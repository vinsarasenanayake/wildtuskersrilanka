const defaultPastResearch = [
  {
    id: 1,
    date: '2021-10-15',
    title: 'Ear Contour Matching for Sri Lankan Elephants',
    description: 'A study introducing semi-automated edge matching algorithm for identifying wild elephants using high-resolution ear contour photographs.',
    author: 'Dr. Sadeepa Gunawardana',
    image: null,
  },
  {
    id: 2,
    date: '2023-02-12',
    title: 'Seasonal Migration Patterns in Minneriya National Park',
    description: 'An analysis of temporal and spatial distribution of identified tuskers during the dry season gathering, based on 5 years of tracking data.',
    author: 'WTS Research Team',
    image: null,
  },
  {
    id: 3,
    date: '2024-11-05',
    title: 'Coexistence Models in Agricultural Corridors',
    description: 'Evaluating the effectiveness of community-managed seasonal electric fences along traditional elephant migration corridors in North Central Province.',
    author: 'Namal Kamalgoda',
    image: null,
  },
];

const defaultActiveResearch = [
  {
    id: 101,
    date: '2026-06-01',
    title: 'AI-Powered Individual Tusker Tracker (Ongoing)',
    description: 'Development of computer vision models to identify individual Sri Lankan elephants using neural network analysis on ear contours and tusk shapes.',
    author: 'WTS Tech Unit',
    image: null,
  }
];

export function getResearch() {
  const local = localStorage.getItem('wts_research');
  if (!local) {
    const initial = { active: defaultActiveResearch, past: defaultPastResearch };
    localStorage.setItem('wts_research', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(local);
}

export function saveResearch(research) {
  localStorage.setItem('wts_research', JSON.stringify(research));
}

export function addResearchEntry(entry, type) {
  const all = getResearch();
  entry.id = Date.now();
  if (type === 'active') {
    all.active.unshift(entry);
  } else {
    all.past.unshift(entry);
  }
  saveResearch(all);
}
