const defaultTuskers = [
  { id: 'T304', name: 'Nero',        sinhala: 'නීරෝ',       photos: [null, null], location: 'Udawalawe', listedDate: '2019-03-14', recordedBy: 'WTS Team', description: 'Nero is a well-known tusker frequently spotted in Udawalawe National Park. He is distinguishable by his long, symmetrical tusks and calm temperament. Often seen near the Udawalawe reservoir during dry season gatherings.', specialMarks: 'Distinctive V-shaped notch on the right ear tip.', specialWounds: 'None recorded.' },
  { id: 'T303', name: 'Rudhraja',    sinhala: 'රුද්‍රජ',     photos: [null, null], location: 'Minneriya', listedDate: '2018-08-22', recordedBy: 'Namal Kamalgoda', description: 'Rudhraja is one of the most photographed tuskers in Minneriya during the annual elephant gathering. Known for his commanding presence and large tusk length.', specialMarks: 'Scar line running across left shoulder.', specialWounds: 'Old healed wound on right rear leg.' },
  { id: 'T302', name: 'Pulina',      sinhala: 'පුලින',       photos: [null, null, null], location: 'Yala', listedDate: '2020-01-10', recordedBy: 'Pathum Bandara', description: 'Pulina is a dominant male tusker of Yala National Park, known for his imposing stature and asymmetric tusks. Frequently seen near the Block 1 waterhole.', specialMarks: 'Left tusk slightly curved downward, right tusk straighter.', specialWounds: 'Shallow scar on left flank.' },
  { id: 'T301', name: 'Prahastha',   sinhala: 'ප්‍රහස්ථ',    photos: [null, null, null, null], location: 'Udawalawe', listedDate: '2019-02-05', recordedBy: 'Sadeepa Gunawardana', description: 'Prahastha is one of the elder tuskers of Udawalawe, easily identified by his massive build and wide tusk span. A regular visitor to the tank bund area.', specialMarks: 'Three small round depigmentation spots near left ear base.', specialWounds: 'None recorded.' },
  { id: 'T300', name: 'Madulu',      sinhala: 'මඩුලු',       photos: [null, null, null], location: 'Kaudulla', listedDate: '2021-06-03', recordedBy: 'Pasan Senevirathne', description: 'Madulu is a mid-aged tusker known to roam across the Kaudulla–Minneriya corridor. He is one of the few tuskers documented in both parks.', specialMarks: 'Right ear has a triangular tear near the top.', specialWounds: 'None recorded.' },
  { id: 'T299', name: 'Arya',        sinhala: 'ආර්ය',        photos: [null, null, null, null, null], location: 'Yala', listedDate: '2017-11-17', recordedBy: 'Priyanjana Dilmith', description: 'Arya is one of the eldest documented tuskers in Yala, with exceptionally long curving tusks. A highly respected individual in the local elephant population.', specialMarks: 'Both tusks curve outward and upward at tips.', specialWounds: 'Old bullet graze scar on left shoulder.' },
  { id: 'T298', name: 'Sandagiri',   sinhala: 'සඳගිරි',      photos: [null, null, null, null, null], location: 'Minneriya', listedDate: '2019-04-08', recordedBy: 'Milinda Wattegedara', description: 'Sandagiri is a sociable tusker often spotted in the company of other males during musth gatherings at Minneriya.', specialMarks: 'Slightly folded right ear lobe.', specialWounds: 'None recorded.' },
  { id: 'T297', name: 'Lankeshwara', sinhala: 'ලංකේශ්වර',   photos: [null, null, null, null], location: 'Wilpattu', listedDate: '2016-12-29', recordedBy: 'Dushyantha Silva', description: 'Lankeshwara is a rare tusker documented in the remote northern areas of Wilpattu. Very few sightings make each encounter highly valuable.', specialMarks: 'Prominent dome-shaped forehead and very pale pigmentation patches.', specialWounds: 'Deep old scar on right flank from suspected conflict.' },
  { id: 'T296', name: 'Gajendra',    sinhala: 'ගජේන්ද්‍ර',   photos: [null, null], location: 'Udawalawe', listedDate: '2020-09-12', recordedBy: 'Chandika Lakmal', description: 'Gajendra is a young adult tusker showing great promise with rapidly growing tusks. Frequently seen in family group peripheries.', specialMarks: 'Distinctive spot pattern on both ears.', specialWounds: 'None recorded.' },
  { id: 'T295', name: 'Sumeda',      sinhala: 'සුමේධ',       photos: [null, null, null, null, null, null], location: 'Yala', listedDate: '2016-03-01', recordedBy: 'Suraj Perera', description: 'Sumeda is one of the most-photographed tuskers in Yala Block 2, known for his calm temperament and long straight tusks.', specialMarks: 'White tusk tips on both sides.', specialWounds: 'Scar on upper right leg from suspected snare.' },
  { id: 'T294', name: 'Nandimithra', sinhala: 'නන්දිමිත්‍ර',  photos: [null, null, null], location: 'Kaudulla', listedDate: '2018-07-20', recordedBy: 'Piyumal Pradeep', description: 'Nandimithra is a striking tusker of Kaudulla, often photographed during the famous Minneriya–Kaudulla gathering season.', specialMarks: 'Asymmetric ear veins forming a unique branching pattern.', specialWounds: 'None recorded.' },
  { id: 'T293', name: 'Gajaba',      sinhala: 'ගජබා',        photos: [null, null, null, null, null, null, null], location: 'Minneriya', listedDate: '2017-10-06', recordedBy: 'Geemal Harold', description: 'Gajaba is one of the dominant tuskers at Minneriya, often seen leading other males during the dry season. Well documented over several years.', specialMarks: 'Broken tip on left tusk.', specialWounds: 'None recorded.' },
  { id: 'T292', name: 'Ravana',      sinhala: 'රාවණා',       photos: [null, null, null, null], location: 'Yala', listedDate: '2019-06-25', recordedBy: 'Saman Halloluwa', description: 'Ravana is a powerful and aggressive tusker of Yala, well known by safari guides for his bold behaviour near vehicles.', specialMarks: 'Extremely thick tusk base; right tusk shorter than left.', specialWounds: 'Small wound near right eye from combat.' },
  { id: 'T291', name: 'Weheragala',  sinhala: 'වෙහෙරගල',    photos: [null, null], location: 'Wilpattu', listedDate: '2015-02-11', recordedBy: 'Namal Kamalgoda', description: 'Weheragala is one of the oldest known tuskers of Wilpattu, named after a famous wewa in the park. Rarely sighted but unmistakable.', specialMarks: 'Deep crease wrinkles on trunk and unique pale forehead blotch.', specialWounds: 'Old fracture on right tusk (healed).' },
  { id: 'T290', name: 'Maligawa',    sinhala: 'මාලිගාව',    photos: [null, null, null, null, null], location: 'Udawalawe', listedDate: '2022-03-30', recordedBy: 'Raveendra Siriwardene', description: 'Maligawa is a young adult tusker with rapidly growing symmetrical tusks, named for the regal quality of his bearing.', specialMarks: 'Very prominent temporal glands during musth.', specialWounds: 'None recorded.' },
  { id: 'T289', name: 'Thissa',      sinhala: 'තිස්ස',       photos: [null, null, null], location: 'Kaudulla', listedDate: '2020-08-19', recordedBy: 'WTS Team', description: 'Thissa is a gentle giant of Kaudulla, known to approach vehicles calmly. Popular with photographers for his cooperative nature.', specialMarks: 'Pink depigmentation patch on trunk tip.', specialWounds: 'None recorded.' },
  { id: 'T288', name: 'Uthuru',      sinhala: 'උතුරු',       photos: [null, null, null, null], location: 'Wilpattu', listedDate: '2017-01-07', recordedBy: 'Malith Madusanka Rajapaksha', description: 'Uthuru is documented in the northern reaches of Wilpattu and is rarely observed. One of the most elusive tuskers on the WTS list.', specialMarks: 'Left tusk significantly longer than right.', specialWounds: 'Healed cut on right front leg.' },
  { id: 'T287', name: 'Sinharaja',   sinhala: 'සිංහරාජ',    photos: [null, null, null, null, null, null], location: 'Sinharaja', listedDate: '2023-04-02', recordedBy: 'Isuru Upanishad', description: 'Sinharaja is an extremely rare tusker documented near the Sinharaja buffer zone — one of the first confirmed tusker sightings in the region.', specialMarks: 'Unusual curled tusk tip on both sides.', specialWounds: 'None recorded.' },
  { id: 'T286', name: 'Daladapathi', sinhala: 'දළදාපති',    photos: [null, null], location: 'Minneriya', listedDate: '2018-05-14', recordedBy: 'Pathum Bandara', description: 'Daladapathi — meaning "Tusk Commander" — is a senior tusker of Minneriya, commanding respect among the elephant population.', specialMarks: 'Both tusks grow in a wide outward sweep.', specialWounds: 'None recorded.' },
  { id: 'T285', name: 'Kuruwita',    sinhala: 'කුරුවිට',    photos: [null, null, null], location: 'Sinharaja', listedDate: '2022-11-30', recordedBy: 'WTS Team', description: 'Kuruwita is the second confirmed tusker of the Sinharaja buffer zone, further establishing the presence of tuskers in this biodiversity hotspot.', specialMarks: 'Single small tusk on left side only (semitusker).', specialWounds: 'None recorded.' },
];

export function getTuskers() {
  const local = localStorage.getItem('wts_tuskers');
  if (!local) {
    localStorage.setItem('wts_tuskers', JSON.stringify(defaultTuskers));
    return defaultTuskers;
  }
  return JSON.parse(local);
}

export function saveTuskers(tuskers) {
  localStorage.setItem('wts_tuskers', JSON.stringify(tuskers));
}

export function addTusker(tusker) {
  const list = getTuskers();
  list.unshift(tusker);
  saveTuskers(list);
}

export function updateTusker(id, updated) {
  const list = getTuskers();
  const index = list.findIndex(t => t.id.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    list[index] = { ...list[index], ...updated };
    saveTuskers(list);
  }
}
