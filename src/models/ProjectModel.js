/* ==============================================================
   SECTION 1: DEFAULT EVENTS SEED DATA
============================================================== */
const defaultPastEvents = [
  {
    id: 1,
    date: '2018-10-18',
    title: 'WNPS Monthly Lecture',
    description: "A special lecture on elephant conservation and behaviour, highlighting findings from field research across Sri Lanka's national parks.",
    sharedBy: 'Namal Kamalgoda',
    image: null,
  },
  {
    id: 2,
    date: '2019-03-12',
    title: 'WTS Photography Expedition - Minneriya',
    description: 'A field expedition to Minneriya National Park to document and photograph tuskers during the annual elephant gathering.',
    sharedBy: 'WTS Team',
    image: null,
  },
  {
    id: 3,
    date: '2020-08-05',
    title: 'Online Webinar - Identifying Sri Lankan Tuskers',
    description: 'An interactive online session showcasing the methodology used by WTS to identify individual tuskers through tusk and ear patterns.',
    sharedBy: 'WTS Team',
    image: null,
  },
];

const defaultUpcomingEvents = [];

/* ==============================================================
   SECTION 2: EVENTS STORAGE & CRUD OPERATIONS
============================================================== */
export function getEvents() {
  const local = localStorage.getItem('wts_events');
  if (!local) {
    const initial = { upcoming: defaultUpcomingEvents, past: defaultPastEvents };
    localStorage.setItem('wts_events', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(local);
}

export function saveEvents(events) {
  localStorage.setItem('wts_events', JSON.stringify(events));
}

export function addEvent(event, type) {
  // type can be 'upcoming' or 'past'
  const all = getEvents();
  event.id = Date.now(); // assign unique id
  if (type === 'upcoming') {
    all.upcoming.unshift(event);
  } else {
    all.past.unshift(event);
  }
  saveEvents(all);
}

export function deleteEvent(id) {
  const all = getEvents();
  all.upcoming = (all.upcoming || []).filter(e => e.id !== Number(id));
  all.past = (all.past || []).filter(e => e.id !== Number(id));
  saveEvents(all);
}
