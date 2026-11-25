/**
 * @file locationDistricts.js
 * @description Definitive registry mapping Sri Lankan wildlife roaming corridors,
 * national parks, ancient tanks, and sighting areas to their official administrative districts.
 */

export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

/**
 * Explicit dictionary mapping known locations, sanctuaries, reserves, and corridors
 * to their primary administrative district(s).
 */
export const LOCATION_DISTRICT_MAP = {
  // Eastern Province - Trincomalee District
  'gomarankadawala': ['Trincomalee'],
  'trincomalee': ['Trincomalee'],
  'sooriyapura': ['Trincomalee'],
  'kantale': ['Trincomalee'],
  'mutur': ['Trincomalee'],
  'seruvila': ['Trincomalee'],
  'naval headworks': ['Trincomalee'],
  'naval headworks sanctuary': ['Trincomalee'],
  'pankulam': ['Trincomalee'],
  'morawewa': ['Trincomalee'],

  // North Central Province - Anuradhapura District
  'anuradhapura': ['Anuradhapura'],
  'padaviya': ['Anuradhapura'],
  'horowpathana': ['Anuradhapura'],
  'horowpothana': ['Anuradhapura'],
  'kahatagasdigiliya': ['Anuradhapura'],
  'galenbindunuwewa': ['Anuradhapura'],
  'kebithigollewa': ['Anuradhapura'],
  'kala wewa': ['Anuradhapura'],
  'kalawewa': ['Anuradhapura'],
  'mahawilachchiya': ['Anuradhapura'],
  'nachchaduwa': ['Anuradhapura'],
  'thirappane': ['Anuradhapura'],
  'tirappane': ['Anuradhapura'],
  'thanthirimale': ['Anuradhapura'],
  'tantirimale': ['Anuradhapura'],
  'mihintale': ['Anuradhapura'],
  'medawachchiya': ['Anuradhapura'],
  'kanadarawa': ['Anuradhapura'],
  'maha kanadarawa': ['Anuradhapura'],
  'manankattiya': ['Anuradhapura'],
  'kukulkatuwa': ['Anuradhapura'],
  'wahalkada': ['Anuradhapura'],
  'palugaswewa': ['Anuradhapura'],
  'ritigala': ['Anuradhapura'],
  'maradankadawala': ['Anuradhapura'],
  'noppakulama': ['Anuradhapura'],

  // North Central Province - Polonnaruwa District
  'polonnaruwa': ['Polonnaruwa'],
  'minneriya': ['Polonnaruwa'],
  'kaudulla': ['Polonnaruwa'],
  'angammedilla': ['Polonnaruwa'],
  'aralaganwila': ['Polonnaruwa'],
  'manampitiya': ['Polonnaruwa'],
  'welikanda': ['Polonnaruwa'],
  'dimbulagala': ['Polonnaruwa'],
  'elahera': ['Polonnaruwa'],
  'hingurakgoda': ['Polonnaruwa'],
  'parakrama samudraya': ['Polonnaruwa'],
  'giritale': ['Polonnaruwa'],

  // North Western Province - Puttalam District
  'puttalam': ['Puttalam'],
  'anamaduwa': ['Puttalam'],
  'karuwalagaswewa': ['Puttalam'],
  'thabbowa': ['Puttalam'],
  'tabbowa': ['Puttalam'],
  'eluwankulam': ['Puttalam'],
  'eluwankulama': ['Puttalam'],
  'pomparippu': ['Puttalam'],
  'pomparippu basin': ['Puttalam'],
  'gangewadiya': ['Puttalam'],
  'mahakumbukkadawala': ['Puttalam'],
  'nawagattegama': ['Puttalam'],
  'neatholuwa': ['Puttalam'],
  'serukele': ['Puttalam'],
  'kalpitiya': ['Puttalam'],
  'chilaw': ['Puttalam'],

  // North Western Province - Kurunegala District
  'kurunegala': ['Kurunegala'],
  'galgamuwa': ['Kurunegala'],
  'ebalagamuwa': ['Kurunegala'],
  'ambanpola': ['Kurunegala'],
  'nikaweratiya': ['Kurunegala'],
  'maho': ['Kurunegala'],
  'polpithigama': ['Kurunegala'],
  'kotavehera': ['Kurunegala'],
  'bingiriya': ['Kurunegala'],
  'giribawa': ['Kurunegala'],
  'paduwasnuwara': ['Kurunegala'],
  'rasnayakapura': ['Kurunegala'],

  // Southern Province - Hambantota District
  'hambantota': ['Hambantota'],
  'hambanthota': ['Hambantota'],
  'bundala': ['Hambantota'],
  'mattala': ['Hambantota'],
  'weerawila': ['Hambantota'],
  'tissamaharama': ['Hambantota'],
  'tissa': ['Hambantota'],
  'lunugamvehera': ['Hambantota', 'Monaragala'],
  'yala': ['Hambantota', 'Monaragala'],
  'yala national park': ['Hambantota', 'Monaragala'],
  'manik river': ['Hambantota', 'Monaragala'],
  'menik river': ['Hambantota', 'Monaragala'],
  'manik ganga': ['Hambantota', 'Monaragala'],
  'menik ganga': ['Hambantota', 'Monaragala'],
  'kirindi oya': ['Hambantota', 'Monaragala'],
  'kumbukkan oya': ['Monaragala', 'Ampara'],
  'yala block 1': ['Hambantota'],
  'yala block 2': ['Hambantota', 'Monaragala'],
  'yala block 3': ['Monaragala'],
  'yala block 4': ['Monaragala'],
  'yala block 5': ['Hambantota', 'Monaragala'],
  'yala block 6': ['Hambantota', 'Monaragala'],
  'palatupana': ['Hambantota'],
  'katagamuwa': ['Hambantota'],
  'ridiyagama': ['Hambantota'],
  'ambalantota': ['Hambantota'],

  // Uva Province - Monaragala District
  'monaragala': ['Monaragala'],
  'buttala': ['Monaragala'],
  'wellawaya': ['Monaragala'],
  'kataragama': ['Monaragala', 'Hambantota'],
  'ethimale': ['Monaragala'],
  'pelwatta': ['Monaragala'],
  'sevanagala': ['Monaragala'],
  'thanamalwila': ['Monaragala'],
  'tanamalwila': ['Monaragala'],
  'badalkumbura': ['Monaragala'],
  'siyambalanduwa': ['Monaragala'],
  'bibile': ['Monaragala'],
  'medagama': ['Monaragala'],
  'galge': ['Monaragala'],
  'kuda oya': ['Monaragala'],

  // Uva Province - Badulla District
  'badulla': ['Badulla'],
  'mahiyanganaya': ['Badulla'],
  'rideemaliyadda': ['Badulla'],
  'passara': ['Badulla'],
  'bandarawela': ['Badulla'],
  'ella': ['Badulla'],
  'haputale': ['Badulla'],

  // Eastern Province - Ampara District
  'ampara': ['Ampara'],
  'okanda': ['Ampara'],
  'kumana': ['Ampara'],
  'lahugala': ['Ampara'],
  'panama': ['Ampara'],
  'pottuvil': ['Ampara'],
  'buddhangala': ['Ampara'],
  'deegavapiya': ['Ampara'],
  'inginiyagala': ['Ampara'],
  'maha oya': ['Ampara'],
  'sagama': ['Ampara'],
  'sengamuwa': ['Ampara'],
  'shasthrawela': ['Ampara'],
  'uhana': ['Ampara'],
  'damana': ['Ampara'],
  'dehiattakandiya': ['Ampara'],
  'kalmunai': ['Ampara'],
  'sammanthurai': ['Ampara'],

  // Eastern Province - Batticaloa District
  'batticaloa': ['Batticaloa'],
  'chenkaladi': ['Batticaloa'],
  'thoppigala': ['Batticaloa'],
  'kalkudah': ['Batticaloa'],
  'valachchenai': ['Batticaloa'],
  'vakarai': ['Batticaloa'],
  'eravur': ['Batticaloa'],

  // Central Province - Matale District
  'matale': ['Matale'],
  'dambulla': ['Matale'],
  'sigiriya': ['Matale'],
  'galewela': ['Matale'],
  'naula': ['Matale'],
  'laggala': ['Matale'],
  'pallepola': ['Matale'],
  'yatawatta': ['Matale'],
  'wilgamuwa': ['Matale'],

  // Central Province - Kandy District
  'kandy': ['Kandy'],
  'peradeniya': ['Kandy'],
  'gampola': ['Kandy'],
  'nawalapitiya': ['Kandy'],
  'kundasale': ['Kandy'],

  // Central Province - Nuwara Eliya District
  'nuwara eliya': ['Nuwara Eliya'],
  'hatton': ['Nuwara Eliya'],
  'horton plains': ['Nuwara Eliya'],

  // Sabaragamuwa Province - Ratnapura District
  'ratnapura': ['Ratnapura'],
  'rathnapura': ['Ratnapura'],
  'udawalawe': ['Ratnapura', 'Monaragala'],
  'em darkness': ['Ratnapura'],
  'embiilipitiya': ['Ratnapura'],
  'embilipitiya': ['Ratnapura'],
  'kuruwita': ['Ratnapura'],
  'balangoda': ['Ratnapura'],
  'kalthota': ['Ratnapura'],
  'mau ara': ['Ratnapura', 'Monaragala'],
  'kolonna': ['Ratnapura'],

  // Sabaragamuwa Province - Kegalle District
  'kegalle': ['Kegalle'],
  'pinnawala': ['Kegalle'],
  'mawanella': ['Kegalle'],

  // Northern Province - Mannar District
  'mannar': ['Mannar'],
  'madu': ['Mannar'],
  'madhu': ['Mannar'],
  'silavathurai': ['Mannar'],
  'mullikulam': ['Mannar'],
  'vidataltivu': ['Mannar'],
  'nanaddan': ['Mannar'],
  'musali': ['Mannar'],

  // Northern Province - Vavuniya District
  'vavuniya': ['Vavuniya'],
  'cheddekulam': ['Vavuniya'],
  'nedunkeni': ['Vavuniya'],

  // Northern Province - Mullaitivu District
  'mullaitivu': ['Mullaitivu'],
  'mankulam': ['Mullaitivu'],
  'oddusuddan': ['Mullaitivu'],

  // Northern Province - Kilinochchi District
  'kilinochchi': ['Kilinochchi'],
  'pooneryn': ['Kilinochchi'],

  // Northern Province - Jaffna District
  'jaffna': ['Jaffna'],

  // Western Province
  'colombo': ['Colombo'],
  'gampaha': ['Gampaha'],
  'kalutara': ['Kalutara'],

  // Southern Province - Galle & Matara
  'galle': ['Galle'],
  'matara': ['Matara'],

  // Major Multi-District Wildlife Landscapes & Corridors
  'wilpattu': ['Puttalam', 'Anuradhapura'],
  'wilpattu national park': ['Puttalam', 'Anuradhapura'],
  'wasgamuwa': ['Matale', 'Polonnaruwa'],
  'wasgamuwa national park': ['Matale', 'Polonnaruwa'],
  'maduru oya': ['Polonnaruwa', 'Ampara', 'Badulla'],
  'maduru oya national park': ['Polonnaruwa', 'Ampara', 'Badulla'],
  'somawathiya': ['Polonnaruwa', 'Trincomalee'],
  'somawathiya national park': ['Polonnaruwa', 'Trincomalee'],
  'flood plains': ['Polonnaruwa'],
  'gal oya': ['Ampara', 'Badulla', 'Monaragala'],
  'galoya': ['Ampara', 'Badulla', 'Monaragala'],
  'gal oya national park': ['Ampara', 'Badulla', 'Monaragala'],
  'yan oya': ['Anuradhapura', 'Trincomalee'],
  'habarana': ['Anuradhapura', 'Polonnaruwa'],
  'hurulu eco park': ['Anuradhapura', 'Polonnaruwa'],
  'nuwaragala': ['Ampara', 'Polonnaruwa'],
  'pothana': ['Anuradhapura', 'Matale'],
  'diganpathaha': ['Matale', 'Anuradhapura'],
  'arugam bay': ['Ampara'],
  'balalu wewa': ['Anuradhapura'],
  'deegawapi': ['Ampara'],
  'eco park': ['Anuradhapura', 'Polonnaruwa'],
  'hambegamuwa': ['Monaragala'],
  'handapanagala': ['Monaragala'],
  'hulannuge': ['Ampara'],
  'hurulu wewa': ['Anuradhapura'],
  'kahallapallekele': ['Kurunegala', 'Anuradhapura'],
  'kekirawa': ['Anuradhapura'],
  'kossapola': ['Kurunegala'],
  'melsiripura': ['Kurunegala'],
  'nimalawa wildlife sanctuary': ['Hambantota'],
  'okkampitiya': ['Monaragala'],
  'rambewa': ['Anuradhapura'],
  'saagama': ['Ampara'],
  'situlpawwa': ['Hambantota'],
  'thalawa': ['Anuradhapura'],
  'vanni': ['Vavuniya', 'Mannar'],
  'wandama demaliya': ['Kurunegala'],
};

/**
 * Returns the array of official Sri Lankan districts for a given location or area string.
 * @param {string} locName - Location, roaming area, or reserve name
 * @returns {string[]} List of matching district names (e.g. ['Trincomalee'])
 */
export function getLocationDistricts(locName) {
  if (!locName) return [];
  const clean = String(locName).trim().toLowerCase();

  // 1. Direct dictionary match
  if (LOCATION_DISTRICT_MAP[clean]) {
    return LOCATION_DISTRICT_MAP[clean];
  }

  // 2. Check if the string itself contains a recognized District name
  for (const dist of DISTRICTS) {
    if (clean.includes(dist.toLowerCase())) {
      return [dist];
    }
  }

  // 3. Substring match against known locations in dictionary (longest key first)
  const sortedKeys = Object.keys(LOCATION_DISTRICT_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key) || clean.includes(key)) {
      return LOCATION_DISTRICT_MAP[key];
    }
  }

  return [];
}

/**
 * Checks whether a given location name belongs to the specified target district.
 * @param {string} locName - Sighting location or roaming area
 * @param {string} districtName - Official Sri Lankan district
 * @returns {boolean}
 */
export function isLocationInDistrict(locName, districtName) {
  if (!districtName) return true;
  if (!locName) return false;
  const dists = getLocationDistricts(locName);
  const target = districtName.trim().toLowerCase();
  return dists.some(d => d.toLowerCase() === target);
}
