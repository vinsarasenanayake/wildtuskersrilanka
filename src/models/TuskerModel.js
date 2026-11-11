/* ==============================================================
   SECTION 1: DEFAULT TUSKERS REGISTRY SEED DATA
============================================================== */
const defaultTuskers = [
  {
    id: 'T304',
    name: 'Nero',
    sinhala: 'නීරෝ',
    photos: [null, null],
    location: 'Udawalawe',
    listedDate: '2019-03-14',
    recordedBy: 'WTS Team',
    nicknameGivenBy: 'WTS Team',
    description: 'Nero is a well-known tusker frequently spotted in Udawalawe National Park. He is distinguishable by his long, symmetrical tusks and calm temperament. Often seen near the Udawalawe reservoir during dry season gatherings.',
    specialMarks: 'Distinctive V-shaped notch on the right ear tip.',
    specialWounds: 'None recorded.',
    riskScore: '4.2 / 10 (Low - Moderate)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2019',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'Baseline documentation along the Udawalawe reservoir with smooth, intact ear contours and uniform ivory.',
        hasChange: false
      },
      {
        year: '2022',
        stage: '3-Year Progression',
        photo: null,
        changeSentence: 'Morphological change: Distinct V-shaped notch formed on the right ear tip; tusk diameter noticeably thickened.',
        hasChange: true,
        changeType: 'Ear Tear / Notch'
      },
      {
        year: '2025',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'Right ear notch established as key field identifier; healthy body mass and calm demeanor during gatherings.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T303',
    name: 'Rudhraja',
    sinhala: 'රුද්‍රජ',
    photos: [null, null],
    location: 'Minneriya',
    listedDate: '2018-08-22',
    recordedBy: 'Namal Kamalgoda',
    nicknameGivenBy: 'Namal Kamalgoda',
    description: 'Rudhraja is one of the most photographed tuskers in Minneriya during the annual elephant gathering. Known for his commanding presence and large tusk length.',
    specialMarks: 'Scar line running across left shoulder.',
    specialWounds: 'Old healed wound on right rear leg.',
    riskScore: '6.8 / 10 (Moderate)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2018',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'Initial photographic baseline recorded during the Minneriya gathering with massive ivory and clean flanks.',
        hasChange: false
      },
      {
        year: '2021',
        stage: '3-Year Progression',
        photo: null,
        changeSentence: 'Injury recorded: Deep laceration and combat scar documented across the left shoulder and upper right rear leg.',
        hasChange: true,
        changeType: 'Shoulder Combat Scar'
      },
      {
        year: '2025',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'Shoulder scar healed into permanent pale furrow; retains dominant status leading bachelor groups.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T302',
    name: 'Pulina',
    sinhala: 'පුලින',
    photos: [null, null, null],
    location: 'Yala',
    listedDate: '2020-01-10',
    recordedBy: 'Pathum Bandara',
    nicknameGivenBy: 'Pathum Bandara',
    description: 'Pulina is a dominant male tusker of Yala National Park, known for his imposing stature and asymmetric tusks. Frequently seen near the Block 1 waterhole.',
    specialMarks: 'Left tusk slightly curved downward, right tusk straighter.',
    specialWounds: 'Shallow scar on left flank.',
    riskScore: '6.5 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T301',
    name: 'Prahastha',
    sinhala: 'ප්‍රහස්ථ',
    photos: [null, null, null, null],
    location: 'Udawalawe',
    listedDate: '2019-02-05',
    recordedBy: 'Sadeepa Gunawardana',
    nicknameGivenBy: 'Sadeepa Gunawardana',
    description: 'Prahastha is one of the elder tuskers of Udawalawe, easily identified by his massive build and wide tusk span. A regular visitor to the tank bund area.',
    specialMarks: 'Three small round depigmentation spots near left ear base.',
    specialWounds: 'None recorded.',
    riskScore: '4.5 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T300',
    name: 'Madulu',
    sinhala: 'මඩුලු',
    photos: [null, null, null],
    location: 'Kaudulla',
    listedDate: '2021-06-03',
    recordedBy: 'Pasan Senevirathne',
    nicknameGivenBy: 'Pasan Senevirathne',
    description: 'Madulu is a mid-aged tusker known to roam across the Kaudulla-Minneriya corridor. He is one of the few tuskers documented in both parks.',
    specialMarks: 'Right ear has a triangular tear near the top.',
    specialWounds: 'None recorded.',
    riskScore: '5.8 / 10 (Moderate)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2018',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'Initial documentation in Kaudulla with smooth, untorn ear lobes and emerging straight ivory.',
        hasChange: false
      },
      {
        year: '2021',
        stage: '3-Year Progression',
        photo: null,
        changeSentence: 'Morphological change: Distinct triangular tear formed on upper right ear margin from thorny scrub habitat.',
        hasChange: true,
        changeType: 'Ear Tear'
      },
      {
        year: '2025',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'Upper ear tear fully scarred and healed, remaining his primary unique field recognition trait.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T299',
    name: 'Arya',
    sinhala: 'ආර්ය',
    photos: [null, null, null, null, null],
    location: 'Yala',
    listedDate: '2017-11-17',
    recordedBy: 'Priyanjana Dilmith',
    nicknameGivenBy: 'Priyanjana Dilmith',
    description: 'Arya is one of the eldest documented tuskers in Yala, with exceptionally long curving tusks. A highly respected individual in the local elephant population.',
    specialMarks: 'Both tusks curve outward and upward at tips.',
    specialWounds: 'Old bullet graze scar on left shoulder.',
    riskScore: '7.8 / 10 (High)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2017',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'First recorded in Yala Block 1 displaying upward-curving tusks and clean shoulder contours.',
        hasChange: false
      },
      {
        year: '2022',
        stage: '5-Year Progression',
        photo: null,
        changeSentence: 'Injury recorded: Bullet graze wound sustained along left shoulder during corridor movement; monitored by wildlife rangers.',
        hasChange: true,
        changeType: 'Shoulder Injury'
      },
      {
        year: '2026',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'Shoulder wound completely healed into a permanent pale scar; tusks expanded to immense length with outward curl.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T298',
    name: 'Sandagiri',
    sinhala: 'සඳගිරි',
    photos: [null, null, null, null, null],
    location: 'Minneriya',
    listedDate: '2019-04-08',
    recordedBy: 'Milinda Wattegedara',
    nicknameGivenBy: 'Milinda Wattegedara',
    description: 'Sandagiri is a sociable tusker often spotted in the company of other males during musth gatherings at Minneriya.',
    specialMarks: 'Slightly folded right ear lobe.',
    specialWounds: 'None recorded.',
    riskScore: '4.8 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T297',
    name: 'Lankeshwara',
    sinhala: 'ලංකේශ්වර',
    photos: [null, null, null, null],
    location: 'Wilpattu',
    listedDate: '2016-12-29',
    recordedBy: 'Dushyantha Silva',
    nicknameGivenBy: 'Dushyantha Silva',
    description: 'Lankeshwara is a rare tusker documented in the remote northern areas of Wilpattu. Very few sightings make each encounter highly valuable.',
    specialMarks: 'Prominent dome-shaped forehead and very pale pigmentation patches.',
    specialWounds: 'Deep old scar on right flank from suspected conflict.',
    riskScore: '8.2 / 10 (High)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T296',
    name: 'Gajendra',
    sinhala: 'ගජේන්ද්‍ර',
    photos: [null, null],
    location: 'Udawalawe',
    listedDate: '2020-09-12',
    recordedBy: 'Chandika Lakmal',
    nicknameGivenBy: 'Chandika Lakmal',
    description: 'Gajendra is a young adult tusker showing great promise with rapidly growing tusks. Frequently seen in family group peripheries.',
    specialMarks: 'Distinctive spot pattern on both ears.',
    specialWounds: 'None recorded.',
    riskScore: '4.0 / 10 (Low - Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T295',
    name: 'Sumeda',
    sinhala: 'සුමේධ',
    photos: [null, null, null, null, null, null],
    location: 'Yala',
    listedDate: '2016-03-01',
    recordedBy: 'Suraj Perera',
    nicknameGivenBy: 'Suraj Perera',
    description: 'Sumeda is one of the most-photographed tuskers in Yala Block 2, known for his calm temperament and long straight tusks.',
    specialMarks: 'White tusk tips on both sides.',
    specialWounds: 'Scar on upper right leg from suspected snare.',
    riskScore: '7.4 / 10 (High)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2016',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'First recorded in Yala Block 2 displaying straight, clean ivory and symmetrical undisturbed gait.',
        hasChange: false
      },
      {
        year: '2020',
        stage: '4-Year Progression',
        photo: null,
        changeSentence: 'Conflict mark detected: Wire snare scar identified on upper right leg; timely veterinary treatment avoided permanent lameness.',
        hasChange: true,
        changeType: 'Snare Scar'
      },
      {
        year: '2025',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'Leg injury completely healed with zero mobility impediment; distinctive white tusk tips continue uniform growth.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T294',
    name: 'Nandimithra',
    sinhala: 'නන්දිමිත්‍ර',
    photos: [null, null, null],
    location: 'Kaudulla',
    listedDate: '2018-07-20',
    recordedBy: 'Piyumal Pradeep',
    nicknameGivenBy: 'Piyumal Pradeep',
    description: 'Nandimithra is a striking tusker of Kaudulla, often photographed during the famous Minneriya-Kaudulla gathering season.',
    specialMarks: 'Asymmetric ear veins forming a unique branching pattern.',
    specialWounds: 'None recorded.',
    riskScore: '5.2 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T293',
    name: 'Gajaba',
    sinhala: 'ගජබා',
    photos: [null, null, null, null, null, null, null],
    location: 'Minneriya',
    listedDate: '2017-10-06',
    recordedBy: 'Geemal Harold',
    nicknameGivenBy: 'Geemal Harold',
    description: 'Gajaba is one of the dominant tuskers at Minneriya, often seen leading other males during the dry season. Well documented over several years.',
    specialMarks: 'Broken tip on left tusk.',
    specialWounds: 'None recorded.',
    riskScore: '5.5 / 10 (Moderate)',
    riskLink: '#risk-assessment',
    photographicComparison: [
      {
        year: '2017',
        stage: 'First Recorded Photo',
        photo: null,
        changeSentence: 'First recorded in Minneriya with intact, fully pointed left and right tusks.',
        hasChange: false
      },
      {
        year: '2021',
        stage: '4-Year Progression',
        photo: null,
        changeSentence: 'Significant morphological change: Sharp tusk breakage observed on the left tusk tip following a dry-season sparring clash.',
        hasChange: true,
        changeType: 'Tusk Breakage'
      },
      {
        year: '2025',
        stage: 'Recent Assessment',
        photo: null,
        changeSentence: 'The broken left tusk tip has worn smooth from debarking trees and foraging; healthy body condition maintained.',
        hasChange: false
      }
    ]
  },
  {
    id: 'T292',
    name: 'Ravana',
    sinhala: 'රාවණා',
    photos: [null, null, null, null],
    location: 'Yala',
    listedDate: '2019-06-25',
    recordedBy: 'Saman Halloluwa',
    nicknameGivenBy: 'Saman Halloluwa',
    description: 'Ravana is a powerful and aggressive tusker of Yala, well known by safari guides for his bold behaviour near vehicles.',
    specialMarks: 'Extremely thick tusk base; right tusk shorter than left.',
    specialWounds: 'Small wound near right eye from combat.',
    riskScore: '7.9 / 10 (High)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T291',
    name: 'Weheragala',
    sinhala: 'වෙහෙරගල',
    photos: [null, null],
    location: 'Wilpattu',
    listedDate: '2015-02-11',
    recordedBy: 'Namal Kamalgoda',
    nicknameGivenBy: 'Namal Kamalgoda',
    description: 'Weheragala is one of the oldest known tuskers of Wilpattu, named after a famous wewa in the park. Rarely sighted but unmistakable.',
    specialMarks: 'Deep crease wrinkles on trunk and unique pale forehead blotch.',
    specialWounds: 'Old fracture on right tusk (healed).',
    riskScore: '6.7 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T290',
    name: 'Maligawa',
    sinhala: 'මාලිගාව',
    photos: [null, null, null, null, null],
    location: 'Udawalawe',
    listedDate: '2022-03-30',
    recordedBy: 'Raveendra Siriwardene',
    nicknameGivenBy: 'Raveendra Siriwardene',
    description: 'Maligawa is a young adult tusker with rapidly growing symmetrical tusks, named for the regal quality of his bearing.',
    specialMarks: 'Very prominent temporal glands during musth.',
    specialWounds: 'None recorded.',
    riskScore: '4.6 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T289',
    name: 'Thissa',
    sinhala: 'තිස්ස',
    photos: [null, null, null],
    location: 'Kaudulla',
    listedDate: '2020-08-19',
    recordedBy: 'WTS Team',
    nicknameGivenBy: 'WTS Team',
    description: 'Thissa is a gentle giant of Kaudulla, known to approach vehicles calmly. Popular with photographers for his cooperative nature.',
    specialMarks: 'Pink depigmentation patch on trunk tip.',
    specialWounds: 'None recorded.',
    riskScore: '4.9 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T288',
    name: 'Uthuru',
    sinhala: 'උතුරු',
    photos: [null, null, null, null],
    location: 'Wilpattu',
    listedDate: '2017-01-07',
    recordedBy: 'Malith Madusanka Rajapaksha',
    nicknameGivenBy: 'Malith Madusanka Rajapaksha',
    description: 'Uthuru is documented in the northern reaches of Wilpattu and is rarely observed. One of the most elusive tuskers on the WTS list.',
    specialMarks: 'Left tusk significantly longer than right.',
    specialWounds: 'Healed cut on right front leg.',
    riskScore: '7.6 / 10 (High)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T287',
    name: 'Sinharaja',
    sinhala: 'සිංහරාජ',
    photos: [null, null, null, null, null, null],
    location: 'Sinharaja',
    listedDate: '2023-04-02',
    recordedBy: 'Isuru Upanishad',
    nicknameGivenBy: 'Isuru Upanishad',
    description: 'Sinharaja is an extremely rare tusker documented near the Sinharaja buffer zone, one of the first confirmed tusker sightings in the region.',
    specialMarks: 'Unusual curled tusk tip on both sides.',
    specialWounds: 'None recorded.',
    riskScore: '8.5 / 10 (Critical / High)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T286',
    name: 'Daladapathi',
    sinhala: 'දළදාපති',
    photos: [null, null],
    location: 'Minneriya',
    listedDate: '2018-05-14',
    recordedBy: 'Pathum Bandara',
    nicknameGivenBy: 'Pathum Bandara',
    description: 'Daladapathi (meaning "Tusk Commander") is a senior tusker of Minneriya, commanding respect among the elephant population.',
    specialMarks: 'Both tusks grow in a wide outward sweep.',
    specialWounds: 'None recorded.',
    riskScore: '5.6 / 10 (Moderate)',
    riskLink: '#risk-assessment'
  },
  {
    id: 'T285',
    name: 'Kuruwita',
    sinhala: 'කුරුවිට',
    photos: [null, null, null],
    location: 'Sinharaja',
    listedDate: '2022-11-30',
    recordedBy: 'WTS Team',
    nicknameGivenBy: 'WTS Team',
    description: 'Kuruwita is the second confirmed tusker of the Sinharaja buffer zone, further establishing the presence of tuskers in this biodiversity hotspot.',
    specialMarks: 'Single small tusk on left side only (semitusker).',
    specialWounds: 'None recorded.',
    riskScore: '8.0 / 10 (High)',
    riskLink: '#risk-assessment'
  }
];

/* ==============================================================
   SECTION 2: TUSKERS REGISTRY STORAGE & CRUD OPERATIONS
============================================================== */
export function getTuskers() {
  const local = localStorage.getItem('wts_tuskers');
  let tuskers = [];
  if (!local) {
    tuskers = defaultTuskers;
  } else {
    tuskers = JSON.parse(local);
  }

  // Ensure sightings, riskScore, riskLink, nicknameGivenBy, and photographicComparison exist
  let modified = false;
  tuskers = tuskers.map(t => {
    let itemChanged = false;
    if (!t.sightings) {
      itemChanged = true;
      t.sightings = [];
    }
    if (!t.riskScore) {
      itemChanged = true;
      const defaultMatch = defaultTuskers.find(dt => dt.id.toLowerCase() === t.id.toLowerCase());
      t.riskScore = defaultMatch?.riskScore || (t.specialWounds && t.specialWounds !== 'None recorded.' ? '7.5 / 10 (High)' : '5.0 / 10 (Moderate)');
    }
    if (!t.riskLink) {
      itemChanged = true;
      t.riskLink = '#risk-assessment';
    }
    if (!t.nicknameGivenBy) {
      itemChanged = true;
      const defaultMatch = defaultTuskers.find(dt => dt.id.toLowerCase() === t.id.toLowerCase());
      t.nicknameGivenBy = defaultMatch?.nicknameGivenBy || t.recordedBy || 'WTS Team';
    }
    if (!t.photographicComparison) {
      const defaultMatch = defaultTuskers.find(dt => dt.id.toLowerCase() === t.id.toLowerCase());
      if (defaultMatch?.photographicComparison) {
        t.photographicComparison = defaultMatch.photographicComparison;
        itemChanged = true;
      }
    }
    if (itemChanged) modified = true;
    return t;
  });

  if (modified) saveTuskers(tuskers);
  return tuskers;
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

export function deleteTusker(id) {
  const list = getTuskers();
  const filtered = list.filter(t => t.id.toLowerCase() !== id.toLowerCase());
  saveTuskers(filtered);
}

export function addSightingToTusker(tuskerId, sighting) {
  const list = getTuskers();
  const index = list.findIndex(t => t.id.toLowerCase() === tuskerId.toLowerCase());
  if (index !== -1) {
    sighting.id = Date.now();
    list[index].sightings.push(sighting);
    saveTuskers(list);
  }
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

  // Return custom ear comparison if explicitly provided
  if (Array.isArray(tusker.earComparison) && tusker.earComparison.length === 3) {
    return tusker.earComparison;
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
  const ep3 = tusker.earPhotos?.[2] || tusker.photos?.[2] || null;

  return [
    {
      year: String(firstYear),
      stage: 'Initial Ear Baseline',
      photo: ep1,
      changeSentence: `Baseline ear documentation in ${tusker.location} recording initial lobe curvature, natural folds, and healthy margin contours.`,
      hasChange: false
    },
    {
      year: String(midYear),
      stage: `${midYear - firstYear}-Year Ear Progression`,
      photo: ep2,
      changeSentence: midSentence,
      hasChange: hasChange,
      changeType: changeType
    },
    {
      year: String(recentYear),
      stage: 'Recent Ear Verification',
      photo: ep3,
      changeSentence: recentSentence,
      hasChange: false
    }
  ];
}
