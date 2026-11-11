/* ==============================================================
   SECTION 1: DEFAULT UNLISTED TUSKERS SEED DATA
============================================================== */
const defaultUnlistedTuskers = [
  {
    id: 'UNLISTED 001',
    location: 'Yala',
    listedDate: '2025-11-12',
    recordedBy: 'WTS Field Team',
    description: 'Young adult male with straight emerging tusks spotted near Katagamuwa sanctuary. Distinct nick on lower left ear margin. Under monitoring to establish permanent ID.',
    specialMarks: 'Small triangular nick on lower left ear pinna.',
    photos: []
  },
  {
    id: 'UNLISTED 002',
    location: 'Minneriya',
    listedDate: '2025-08-20',
    recordedBy: 'Safari Guide Nuwan',
    description: 'Solitary tusker with asymmetrical tusks (right significantly longer than left). Seen at reservoir periphery during dry season gathering.',
    specialMarks: 'Right tusk longer with slight outward curve.',
    photos: []
  },
  {
    id: 'UNLISTED 003',
    location: 'Wilpattu',
    listedDate: '2024-05-14',
    recordedBy: 'Ranger Jayasundara',
    description: 'Large bull tusker observed crossing the Kokkare Villu corridor. Very thick tusk base with notable crown ridge. Rarely sighted.',
    specialMarks: 'Very thick tusk base, prominent temporal depression.',
    photos: []
  },
  {
    id: 'UNLISTED 004',
    location: 'Udawalawe',
    listedDate: '2026-01-08',
    recordedBy: 'WTS Research Team',
    description: 'Juvenile male displaying rapid ivory growth. Frequently seen trailing a resident family herd near the Mau Ara wetland.',
    specialMarks: 'Smooth unblemished ear rims; symmetrical white tusk points.',
    photos: []
  },
  {
    id: 'UNLISTED 005',
    location: 'Kaudulla',
    listedDate: '2025-09-17',
    recordedBy: 'Field Observer Kanishka',
    description: 'Medium-stature tusker with widely divergent tusk spread. Extremely cautious demeanor around vehicles; retreating into forest scrub.',
    specialMarks: 'Widely splayed tusk trajectory.',
    photos: []
  },
  {
    id: 'UNLISTED 006',
    location: 'Yala',
    listedDate: '2025-07-22',
    recordedBy: 'WTS Tracking Unit',
    description: 'Adult tusker observed foraging in the Menik Ganga riverine zone of Block 2. Deep horizontal crease lines across upper trunk.',
    specialMarks: 'Deep horizontal crease wrinkles on upper trunk.',
    photos: []
  },
  {
    id: 'UNLISTED 007',
    location: 'Wilpattu',
    listedDate: '2026-02-19',
    recordedBy: 'Photographer Chamara',
    description: 'Newly photographed tusker with curved upward tusk tips. Spotted near Kumbuk Wila. Photographic verification in progress.',
    specialMarks: 'Both tusk tips curve distinctly upward.',
    photos: []
  },
  {
    id: 'UNLISTED 008',
    location: 'Sinharaja',
    listedDate: '2024-12-05',
    recordedBy: 'Community Tracker Bandara',
    description: 'Rare rainforest buffer zone sighting. Semitusker with solitary right tusk. High conservation priority in the southern wet zone.',
    specialMarks: 'Single right tusk only (semitusker).',
    photos: []
  },
  {
    id: 'UNLISTED 009',
    location: 'Minneriya',
    listedDate: '2025-10-02',
    recordedBy: 'WTS Team',
    description: 'Sub-adult tusker photographed during the tail end of the elephant gathering. Clean ear contours with developing ivory tips.',
    specialMarks: 'Pale pigmentation speckles around trunk base.',
    photos: []
  },
  {
    id: 'UNLISTED 010',
    location: 'Udawalawe',
    listedDate: '2026-03-11',
    recordedBy: 'Ranger Pushpakumara',
    description: 'Young bull with flared tusks documented near the western boundary canal. Observed feeding peacefully among acacia thorns.',
    specialMarks: 'Flared tusk tips with slight left tilt.',
    photos: []
  }
];

/* ==============================================================
   SECTION 2: UNLISTED TUSKERS STORAGE & CRUD OPERATIONS
============================================================== */
export function getUnlistedTuskers() {
  const local = localStorage.getItem('wts_unlisted_tuskers');
  if (!local) {
    localStorage.setItem('wts_unlisted_tuskers', JSON.stringify(defaultUnlistedTuskers));
    return defaultUnlistedTuskers;
  }
  return JSON.parse(local);
}

export function saveUnlistedTuskers(list) {
  localStorage.setItem('wts_unlisted_tuskers', JSON.stringify(list));
  window.dispatchEvent(new Event('unlistedTuskersChange'));
}

export function addUnlistedTusker(entry) {
  const list = getUnlistedTuskers();
  // Auto-generate next unlisted ID if not explicitly provided
  if (!entry.id) {
    const nextNum = list.length + 1;
    entry.id = `UNLISTED ${String(nextNum).padStart(3, '0')}`;
  }
  list.unshift(entry);
  saveUnlistedTuskers(list);
  return entry;
}

export function updateUnlistedTusker(id, updated) {
  const list = getUnlistedTuskers();
  const index = list.findIndex(item => item.id.toUpperCase() === id.toUpperCase());
  if (index !== -1) {
    list[index] = { ...list[index], ...updated };
    saveUnlistedTuskers(list);
    return list[index];
  }
  return null;
}

export function deleteUnlistedTusker(id) {
  const list = getUnlistedTuskers();
  const filtered = list.filter(item => item.id.toUpperCase() !== id.toUpperCase());
  saveUnlistedTuskers(filtered);
  return true;
}

export function getUnlistedTuskerById(id) {
  if (!id) return null;
  const list = getUnlistedTuskers();
  const cleanId = decodeURIComponent(id).trim().toLowerCase().replace(/[-_]/g, ' ');
  return list.find(item => {
    const itemNorm = item.id.toLowerCase().replace(/[-_]/g, ' ');
    return itemNorm === cleanId || item.id.toLowerCase() === id.toLowerCase();
  }) || null;
}
