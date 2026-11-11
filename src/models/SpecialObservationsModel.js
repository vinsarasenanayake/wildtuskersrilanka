/* ==============================================================
   SECTION 1: DEFAULT SPECIAL OBSERVATIONS SEED DATA
============================================================== */
const defaultObservations = [
  {
    id: 1,
    date: '2026-02-18',
    year: '2026',
    tuskerName: 'T299 - Arya',
    location: 'Yala National Park - Block 1',
    title: 'Arya in Full Musth: Scent Marking and Dominance Display',
    description: '10:30 AM: Encountered Arya (T299) emerging from the dense thorn scrub near the Buthawa tank bund. He was in full active musth, with heavy secretion streaming from both temporal glands.\n\nHe displayed intense dominance behavior, vigorously raking the ground with his long, curving tusks and rub-marking large Palu (Manilkara hexandra) tree trunks. Nearby bachelor males gave him a wide berth of over 100 meters, acknowledging his seniority.\n\nRemarkably, the old bullet graze scar on his left shoulder appears completely stable and healed without secondary infection. His condition index remains exceptionally robust for an elephant of his estimated age.',
    images: [],
    author: 'Priyanjana Dilmith (WTS Team)'
  },
  {
    id: 2,
    date: '2025-09-04',
    year: '2025',
    tuskerName: 'T295 - Sumeda',
    location: 'Yala National Park - Block 2 (Menik Ganga)',
    title: 'Sumeda River Crossing and Tusk Growth Evaluation',
    description: '3:45 PM: Recorded Sumeda (T295) wading across the shallow Menik Ganga into Block 2 territory. High-resolution photographic assessment confirms steady longitudinal growth on both straight tusks, with the white tips continuing to exhibit uniform wear.\n\nHe spent nearly 40 minutes dust-bathing on the dry sandy bank before feeding on riverine bamboo shoots. The suspected snare scar on his upper right leg showed zero limping or mobility impediment.\n\nHis calm temperament around field tracking teams provided an ideal opportunity for multi-angle photographic tusk indexing.',
    images: [],
    author: 'Suraj Perera'
  },
  {
    id: 3,
    date: '2024-07-28',
    year: '2024',
    tuskerName: 'T293 - Gajaba & T303 - Rudhraja',
    location: 'Minneriya National Park - Tank Bed',
    title: 'Historic Gathering: Interaction Between Dominant Tuskers',
    description: 'During the peak dry season gathering at Minneriya reservoir, an extraordinary peaceful interaction was observed between Gajaba (T293) and Rudhraja (T303).\n\nBoth tuskers approached the receding water line within 25 meters of each other. Rather than engaging in aggressive posturing, they engaged in mutual trunk-touching greetings before grazing simultaneously in the lush sedge grass plains.\n\nSuch non-combative coexistence during the gathering underscores the complex social hierarchy and mutual respect between veteran Sri Lankan tuskers.',
    images: [],
    author: 'Namal Kamalgoda'
  },
  {
    id: 4,
    date: '2023-11-12',
    year: '2023',
    tuskerName: 'T287 - Sinharaja',
    location: 'Sinharaja Rainforest Buffer Zone',
    title: 'Confirmed Re-sighting of Rare Rainforest Tusker',
    description: 'First comprehensive photographic confirmation of Sinharaja (T287) in the southern rainforest buffer zone in 18 months.\n\nHis unmistakable curled tusk tips were clearly recorded as he navigated a steep bamboo ridge. Navigating dense wet-zone foliage presents unique challenges for tuskers, yet his tusks remain completely intact without fractures.\n\nLocal forest edge communities were notified through our WTS awareness network to prevent retaliatory conflict during seasonal fruit harvesting.',
    images: [],
    author: 'Isuru Upanishad'
  }
];

/* ==============================================================
   SECTION 2: SPECIAL OBSERVATIONS STORAGE & CRUD OPERATIONS
============================================================== */
export function getSpecialObservations() {
  const local = localStorage.getItem('wts_special_observations');
  if (!local) {
    localStorage.setItem('wts_special_observations', JSON.stringify(defaultObservations));
    return defaultObservations;
  }
  return JSON.parse(local);
}

export function saveSpecialObservations(observations) {
  localStorage.setItem('wts_special_observations', JSON.stringify(observations));
}

export function addSpecialObservation(entry) {
  const all = getSpecialObservations();
  entry.id = Date.now();
  if (!entry.year && entry.date) {
    entry.year = new Date(entry.date).getFullYear().toString();
  }
  all.unshift(entry);
  saveSpecialObservations(all);
  return entry;
}

export function updateSpecialObservation(id, updated) {
  const all = getSpecialObservations();
  const index = all.findIndex(o => o.id === Number(id));
  if (index !== -1) {
    if (updated.date) {
      updated.year = new Date(updated.date).getFullYear().toString();
    }
    all[index] = { ...all[index], ...updated };
    saveSpecialObservations(all);
    return all[index];
  }
  return null;
}

export function deleteSpecialObservation(id) {
  const all = getSpecialObservations();
  const filtered = all.filter(o => o.id !== Number(id));
  saveSpecialObservations(filtered);
  return true;
}
