/* ==============================================================
   SECTION 1: DEFAULT FIELD NOTES SEED DATA
============================================================== */
const defaultFieldNotes = [
  {
    id: 1,
    date: '2026-04-01',
    title: 'Minneriya National Park - Sighting of Tusker Mahasen',
    description: '4:00 PM: Observed Mahasen, one of the most magnificent and well-known tuskers in Sri Lanka, near the Minneriya tank during the annual gathering.\n\nHe is recognized by his large stature and impressively thick, symmetrical tusks. He calmly grazed among a large herd of elephants, undisturbed by the safari vehicles nearby.\n\n5:15 PM: Mahasen slowly moved towards the forest edge. His presence is a highlight of the gathering, but continued monitoring is essential for his protection in the wild.',
    specialNote: 'Mahasen is an iconic Sri Lankan tusker, highly revered and easily identifiable by his distinctive tusk shape and majestic calm demeanor.',
    images: [],
    author: 'Admin',
    authorContact: 'info@wildtuskers.lk',
    status: 'approved',
    submittedAt: '2026-04-01T16:30:00Z',
    approvedAt: '2026-04-01T17:00:00Z'
  },
  {
    id: 2,
    date: '2025-08-14',
    title: 'Galgamuwa Range - Sighting of Kawanthissa',
    description: '4:15 PM: Encountered the majestic tusker known as Kawanthissa (also referred to as "Gajaba" or "Maha Atha") wandering near the edge of the Galgamuwa forest reserve.\n\nHe is estimated to be between 50 and 60 years old and stands an impressive 11 feet tall. His magnificent tusks are nearly 6 feet long, crossing slightly at the tips. He was grazing calmly near the scrubland, seemingly undisturbed by the presence of our observation vehicle at a safe distance.\n\n5:30 PM: He slowly retreated deeper into the forest cover as dusk approached. Continuous monitoring in this corridor is vital due to the high human-elephant conflict risk.',
    specialNote: 'Kawanthissa is one of the largest and oldest living tuskers in Sri Lanka, an absolute icon of the Northwestern province.',
    images: [],
    author: 'Admin',
    authorContact: 'info@wildtuskers.lk',
    status: 'approved',
    submittedAt: '2025-08-14T17:45:00Z',
    approvedAt: '2025-08-14T18:00:00Z'
  },
  {
    id: 3,
    date: '2026-04-12',
    title: 'Kaudulla National Park - Sighting of Tusker Parakrama',
    description: '4:45 PM: Spotted solitary tusker Parakrama grazing near the northern wetland sector of Kaudulla. Observed good physical condition with prominent ear venation and distinct trunk markings. He was seen feeding on aquatic grasses and interacting peacefully with a resident herd of 14 females and calves.',
    specialNote: 'Left tusk has a slight upward curve; visible healing scratch on right flank from scrub brush.',
    images: [],
    author: 'Nisal Perera (Field Observer)',
    authorContact: 'nisal.field@gmail.com',
    status: 'pending',
    submittedAt: '2026-04-12T17:30:00Z'
  }
];

/* ==============================================================
   SECTION 2: FIELD NOTES STORAGE & CRUD OPERATIONS
============================================================== */
export function getFieldNotes() {
  const local = localStorage.getItem('wts_field_notes');
  if (!local) {
    localStorage.setItem('wts_field_notes', JSON.stringify(defaultFieldNotes));
    return defaultFieldNotes;
  }
  
  let notes = JSON.parse(local);
  let modified = false;
  
  notes = notes.map(note => {
    // Ensure status exists (default existing notes to approved)
    if (!note.status) {
      note.status = 'approved';
      modified = true;
    }

    // Auto-update the old Wilpattu note to Mahasen if it still exists
    if (note.id === 1 && note.title.includes('Wilpattu National Park')) {
      modified = true;
      const mahasenNote = defaultFieldNotes.find(n => n.id === 1);
      return { ...mahasenNote, status: 'approved' };
    }

    if (note.images && note.images.length > 0) {
      const originalLen = note.images.length;
      note.images = note.images.filter(img => !img.includes('unsplash.com'));
      if (note.images.length !== originalLen) modified = true;
    }
    return note;
  });

  // Seed sample pending note if not present so admin review flow can be tested
  const hasSamplePending = notes.some(n => n.id === 3);
  if (!hasSamplePending) {
    const pendingSample = defaultFieldNotes.find(n => n.id === 3);
    if (pendingSample) {
      notes.push(pendingSample);
      modified = true;
    }
  }

  if (modified) {
    saveFieldNotes(notes);
  }

  return notes;
}

export function saveFieldNotes(notes) {
  localStorage.setItem('wts_field_notes', JSON.stringify(notes));
  window.dispatchEvent(new Event('fieldNotesChange'));
}

export function getApprovedFieldNotes() {
  return getFieldNotes().filter(note => note.status === 'approved');
}

export function getPendingFieldNotes() {
  return getFieldNotes().filter(note => note.status === 'pending');
}

export function addFieldNote(entry) {
  const all = getFieldNotes();
  const newEntry = {
    ...entry,
    id: Date.now(),
    status: entry.status || 'pending',
    submittedAt: new Date().toISOString(),
  };
  all.unshift(newEntry);
  saveFieldNotes(all);
  return newEntry;
}

export function approveFieldNote(id) {
  const all = getFieldNotes();
  let found = null;
  const updated = all.map(note => {
    if (note.id === id) {
      found = {
        ...note,
        status: 'approved',
        approvedAt: new Date().toISOString()
      };
      return found;
    }
    return note;
  });
  saveFieldNotes(updated);
  return found;
}

export function rejectFieldNote(id) {
  const all = getFieldNotes();
  const updated = all.filter(note => note.id !== id);
  saveFieldNotes(updated);
  return true;
}

export function deleteFieldNote(id) {
  return rejectFieldNote(id);
}
