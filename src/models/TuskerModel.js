import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';

/* ==============================================================
   SECTION 1: ROW MAPPING
   Seed data now lives in supabase/seed.sql.
============================================================== */
const TUSKER_FIELDS = [
  'id', 'name', 'sinhala', 'location', 'listedDate', 'recordedBy',
  'nicknameGivenBy', 'description', 'specialMarks', 'specialWounds',
  'riskScore', 'riskLink', 'photos', 'earPhotos',
  'photographicComparison', 'earComparison',
  // Official registry fields
  'livingStatus', 'deathYear', 'deathReason', 'lastSeenArea', 'lastSeen',
  'zone', 'district', 'province', 'ageRange', 'proximateBirthYear', 'birthYear', 'healthCondition',
  'threatLevel', 'remarks',
];

export const LIVING_STATUSES = ['Alive', 'No Recent Record', 'Deceased'];
export const THREAT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
export const ZONES = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];
export const AGE_RANGES = ['1-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60+'];

/**
 * Calculates current estimated age or age at death based on proximate birth year.
 * Falls back to legacy ageRange if birth year is not yet documented.
 */
export function calculateTuskerAge(tusker) {
  if (!tusker) return null;
  const birthYear = Number(tusker.proximateBirthYear || tusker.birthYear);
  if (birthYear && !isNaN(birthYear) && birthYear > 1900) {
    const isDeceased = tusker.livingStatus === 'Deceased';
    const endYear = (isDeceased && tusker.deathYear && !isNaN(Number(tusker.deathYear)))
      ? Number(tusker.deathYear)
      : new Date().getFullYear();
    const age = Math.max(0, endYear - birthYear);
    return `${age} years`;
  }
  return tusker.ageRange ? `${tusker.ageRange} years` : null;
}

/**
 * Natural comparator for tusker IDs (e.g. 'T001' < 'T048' < 'T150').
 */
export function compareTuskerId(aId, bId) {
  const strA = (aId || '').trim();
  const strB = (bId || '').trim();

  const matchA = strA.match(/\d+/);
  const matchB = strB.match(/\d+/);

  if (matchA && matchB) {
    const numA = parseInt(matchA[0], 10);
    const numB = parseInt(matchB[0], 10);
    if (numA !== numB) {
      return numA - numB;
    }
  } else if (matchA && !matchB) {
    return -1;
  } else if (!matchA && matchB) {
    return 1;
  }

  return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
}

const TUSKER_SELECT = '*, sightings:tusker_sightings(*)';

function mapTusker(row) {
  const t = fromRow(row);
  t.photos = t.photos || [];
  t.earPhotos = t.earPhotos || [];
  if (t.threatLevel === 'Highest') t.threatLevel = 'Critical';
  // No invented defaults: missing values stay empty and the UI hides them.
  if (!t.photographicComparison) delete t.photographicComparison;
  if (!t.earComparison) delete t.earComparison;
  t.sightings = (t.sightings || [])
    .map(fromRow)
    .sort((a, b) => a.id - b.id);
  return t;
}

export function parseSightingDetails(sighting) {
  if (!sighting) {
    return { note: '', location: '', healthCondition: '', threatLevel: '', specialMarks: '', specialWounds: '', remarks: '' };
  }
  if (sighting.note && typeof sighting.note === 'string' && sighting.note.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(sighting.note);
      return {
        note: parsed.note || '',
        location: parsed.location || '',
        healthCondition: parsed.healthCondition || '',
        threatLevel: parsed.threatLevel || '',
        specialMarks: parsed.specialMarks || '',
        specialWounds: parsed.specialWounds || '',
        remarks: parsed.remarks || '',
      };
    } catch {
      // fallback to plain note
    }
  }
  return {
    note: sighting.note || '',
    location: '',
    healthCondition: '',
    threatLevel: '',
    specialMarks: '',
    specialWounds: '',
    remarks: '',
  };
}

/* ==============================================================
   SECTION 2: TUSKERS REGISTRY CRUD (async, Supabase)
============================================================== */
export async function getTuskers() {
  const rows = unwrap(await supabase.from('tuskers').select(TUSKER_SELECT));
  return rows.map(mapTusker).sort((a, b) => compareTuskerId(a.id, b.id));
}

export async function getTuskerById(id) {
  if (!id) return null;
  const row = unwrap(
    await supabase.from('tuskers').select(TUSKER_SELECT)
      .eq('id', id.toUpperCase()).maybeSingle()
  );
  return row ? mapTusker(row) : null;
}

export async function tuskerExists(id) {
  const { count, error } = await supabase
    .from('tuskers').select('id', { count: 'exact', head: true })
    .eq('id', id.toUpperCase());
  if (error) throw new Error(error.message);
  return count > 0;
}

export async function addTusker(tusker) {
  const payload = { ...tusker, id: tusker.id.toUpperCase().trim() };
  if (payload.threatLevel === 'Critical') payload.threatLevel = 'Highest';
  const row = toRow(payload, TUSKER_FIELDS);
  unwrap(await supabase.from('tuskers').insert(row));
}

export async function updateTusker(id, updated) {
  const payload = { ...updated };
  if (payload.threatLevel === 'Critical') payload.threatLevel = 'Highest';
  const row = toRow(payload, TUSKER_FIELDS.filter(f => f !== 'id'));
  unwrap(await supabase.from('tuskers').update(row).eq('id', id.toUpperCase()));
}

export async function deleteTusker(id) {
  unwrap(await supabase.from('tuskers').delete().eq('id', id.toUpperCase()));
}

export async function addSightingToTusker(tuskerId, sighting) {
  unwrap(await supabase.from('tusker_sightings').insert({
    tusker_id: tuskerId.toUpperCase(),
    image_url: sighting.imageUrl,
    capture_date: sighting.captureDate,
    note: sighting.note || null,
    author: sighting.author || null,
  }));
}

/* ==============================================================
   SECTION 3: PHOTOGRAPHIC PROGRESSION COMPARISON GENERATOR
============================================================== */
export function getTuskerComparison(tusker) {
  if (!tusker) return [];

  // Return existing custom comparison if fully defined with 3 items
  if (Array.isArray(tusker.photographicComparison) && tusker.photographicComparison.length === 3) {
    return tusker.photographicComparison;
  }

  // Derive chronological years
  let firstYear = 2017;
  if (tusker.listedDate) {
    const parsed = new Date(tusker.listedDate).getFullYear();
    if (!isNaN(parsed) && parsed > 2000 && parsed <= 2026) {
      firstYear = parsed;
    }
  }

  // 3 to 5 years interval
  const gap = firstYear <= 2021 ? 4 : 2;
  const midYear = Math.min(firstYear + gap, 2024);
  const recentYear = Math.max(midYear + 2, 2025);

  const marks = (tusker.specialMarks || '').toLowerCase();
  const wounds = (tusker.specialWounds || '').toLowerCase();

  // Morphological change analysis (tusk breakage, ear tear, scars, etc.)
  let hasChange = false;
  let changeType = '';
  let midSentence = '';
  let recentSentence = '';

  if (marks.includes('broken') || marks.includes('fracture') || wounds.includes('fracture')) {
    hasChange = true;
    changeType = 'Tusk Breakage';
    midSentence = 'Significant morphological change: Breakage documented on tusk tip following a seasonal sparring clash.';
    recentSentence = 'Fracture surface worn smooth from continuous debarking and foraging; robust physical condition.';
  } else if (marks.includes('tear') || marks.includes('notch') || marks.includes('cut')) {
    hasChange = true;
    changeType = 'Ear Tear / Notch';
    midSentence = 'Noticeable change: Distinct ear tear and margin notch formed along pinna from dense thorny terrain.';
    recentSentence = 'Ear notch margin fully scarred and stabilized, providing a dependable individual field identifier.';
  } else if (wounds && wounds !== 'none recorded.' && !wounds.includes('none')) {
    hasChange = true;
    changeType = 'Injury & Healing';
    midSentence = `Injury documented during routine tracking (${tusker.specialWounds}); under active conservation observation.`;
    recentSentence = 'Tissue completely healed into stable fibrous scarring; excellent mobility and vitality maintained.';
  } else {
    hasChange = false;
    changeType = 'Tusk Growth';
    midSentence = `Intermediate sighting after ${midYear - firstYear} years showing substantial ivory elongation and widening cranial girth.`;
    recentSentence = `Recent monitoring confirming established individual traits (${tusker.specialMarks || 'symmetric ivory'}) in ${tusker.location}.`;
  }

  const p1 = tusker.photos?.[0] || null;
  const p2 = tusker.photos?.[1] || tusker.sightings?.[0]?.imageUrl || null;
  const p3 = tusker.photos?.[2] || tusker.sightings?.[1]?.imageUrl || tusker.photos?.[0] || null;

  return [
    {
      year: String(firstYear),
      stage: 'First Recorded Photo',
      photo: p1,
      changeSentence: `Baseline photographic documentation in ${tusker.location} recording initial ivory alignment and undisturbed physical condition.`,
      hasChange: false
    },
    {
      year: String(midYear),
      stage: `${midYear - firstYear}-Year Progression`,
      photo: p2,
      changeSentence: midSentence,
      hasChange: hasChange,
      changeType: changeType
    },
    {
      year: String(recentYear),
      stage: 'Recent Assessment',
      photo: p3,
      changeSentence: recentSentence,
      hasChange: false
    }
  ];
}

/* ==============================================================
   SECTION 4: EAR BIOMETRIC PROGRESSION COMPARISON GENERATOR
============================================================== */
export function getTuskerEarComparison(tusker) {
  if (!tusker) return [];

  // Return custom ear comparison if explicitly provided (keep top 2)
  if (Array.isArray(tusker.earComparison) && tusker.earComparison.length >= 2) {
    return tusker.earComparison.slice(0, 2);
  }

  // Derive chronological years
  let firstYear = 2017;
  if (tusker.listedDate) {
    const parsed = new Date(tusker.listedDate).getFullYear();
    if (!isNaN(parsed) && parsed > 2000 && parsed <= 2026) {
      firstYear = parsed;
    }
  }

  const gap = firstYear <= 2021 ? 4 : 2;
  const midYear = Math.min(firstYear + gap, 2024);
  const recentYear = Math.max(midYear + 2, 2025);

  const marks = (tusker.specialMarks || '').toLowerCase();

  let hasChange = false;
  let changeType = '';
  let midSentence = '';
  let recentSentence = '';

  if (marks.includes('tear') || marks.includes('notch') || marks.includes('cut')) {
    hasChange = true;
    changeType = 'Ear Margin Tear / Notch';
    midSentence = `Ear pinna modification recorded: ${tusker.specialMarks}; clear structural change observed along the lateral margin.`;
    recentSentence = 'Ear tear has fully scarred and stabilized, documented as a permanent diagnostic ID marker.';
  } else if (marks.includes('spot') || marks.includes('depigmentation')) {
    hasChange = true;
    changeType = 'Depigmentation Pattern';
    midSentence = `Ear depigmentation mapping: ${tusker.specialMarks}; cluster verified under high-resolution telephoto capture.`;
    recentSentence = 'Depigmentation pattern re-confirmed as stable lifetime biometric identifier; margin contours intact.';
  } else if (marks.includes('fold')) {
    hasChange = true;
    changeType = 'Ear Lobe Fold';
    midSentence = `Structural ear fold documented: ${tusker.specialMarks}; provides distinct natural profile confirmation.`;
    recentSentence = 'Lobe folding confirmed stable with no tearing; permanent anatomical feature verified.';
  } else {
    hasChange = false;
    changeType = 'Pinna Growth';
    midSentence = `Intermediate pinna comparison after ${midYear - firstYear} years showing natural lobe growth with undamaged margin venation.`;
    recentSentence = `Recent inspection confirming verified ear margin profile and stable vascular branching in ${tusker.location}.`;
  }

  const ep1 = tusker.earPhotos?.[0] || tusker.photos?.[0] || null;
  const ep2 = tusker.earPhotos?.[1] || tusker.photos?.[1] || null;

  return [
    {
      year: String(firstYear),
      stage: 'Initial Ear Baseline',
      title: 'Initial Ear Baseline',
      photo: ep1,
      changeSentence: `Baseline ear documentation in ${tusker.location || 'field location'} recording initial lobe curvature, natural folds, and healthy margin contours.`,
      summary: `Baseline ear documentation in ${tusker.location || 'field location'} recording initial lobe curvature, natural folds, and healthy margin contours.`,
      hasChange: false
    },
    {
      year: String(recentYear),
      stage: 'Recent Ear Verification',
      title: 'Recent Ear Verification',
      photo: ep2,
      changeSentence: recentSentence || midSentence,
      summary: recentSentence || midSentence,
      hasChange: hasChange,
      changeType: changeType
    }
  ];
}
