/**
 * @file lookalikePairs.js
 * @description Diagnostic English and Sinhala comparison data for lookalike wild tusker pairs.
 * Used on individual TuskerProfile dossiers for the 8 matched bulls (T119, T219, T096, T232, T078, T073, T173, T162).
 */

export const LOOKALIKE_PAIRS = [
  {
    id: 'pair-01',
    pairNumber: '01',
    title: 'Pair 01: Wilpattu Wijaya (Left) vs. Thabbowa Karuwalagaswewa Walagamba (Right)',
    titleSi: 'යුගලය 01: විල්පත්තුවේ විජය (වම්පස) සහ තබ්බෝව කරුවලගස්වැව වළගම්බා (දකුණුපස)',
    image: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/observations/lookalikes/1_wijaya_vs_walagamba.jpg',
    left: {
      id: 'T119',
      name: 'Wilpattu Wijaya',
      nameSi: 'විල්පත්තුවේ විජය',
      range: 'Wilpattu / Eluwankulama / Pomparippu',
      rangeSi: 'විල්පත්තුව / එළුවන්කුලම / පොම්පරිප්පු',
    },
    right: {
      id: 'T219',
      name: 'Walagamba',
      nameSi: 'වළගම්බා',
      range: 'Wilpattu / Karuwalagaswewa / Thabbowa / Puttalam',
      rangeSi: 'විල්පත්තුව / කරුවලගස්වැව / තබ්බෝව / පුත්තලම',
    },
    differencesEn: [
      {
        label: 'Tusks',
        text: 'Wijaya possesses slightly convergent tusks with a downward curve, whereas Walagamba features thicker, more divergent tusks pointing forward.',
      },
      {
        label: 'Ears & Depigmentation',
        text: 'Wijaya exhibits heavy pink depigmentation across both ear lobes and a distinct roll on his upper ear fold. Walagamba displays prominent jagged tear notches on his right ear margin with differing depigmentation distribution on the forehead and trunk base.',
      },
    ],
    differencesSi: [
      {
        label: 'දළවල ලක්ෂණ',
        text: 'විජයගේ දළ තරමක් එකිනෙකට ළං වන ආකාරයෙන් පිහිටා ඇති අතර පහළට වක්‍ර වේ. ඊට වෙනස්ව, වළගම්බාගේ දළ වඩාත් ඝනකමින් යුක්ත වන අතර ඉදිරියට යොමු වූ, එකිනෙකින් ඈත් වන ආකාරයෙන් පිහිටා ඇත.',
      },
      {
        label: 'කන් සහ සමේ වර්ණක වෙනස්වීම්',
        text: 'විජයගේ කන් පෙති දෙකෙහිම කැපී පෙනෙන රෝස පැහැති වර්ණක අඩුවීම් දක්නට ලැබෙන අතර, කන්වල ඉහළ නැමීමේ සුවිශේෂී රෝල් වූ ස්වභාවයක් ද පවතී. වළගම්බාගේ දකුණු කනේ මායිමේ කැපී පෙනෙන අක්‍රමවත් ඉරීම් හා කැපුම් සලකුණු දක්නට ලැබේ. එමෙන්ම නළලේ සහ හොඬවැලේ මුල් ප්‍රදේශයේ වර්ණක වෙනස්වීම් ද විජයගෙන් වෙනස් ආකාරයකින් පිහිටා ඇත.',
      },
    ],
  },
  {
    id: 'pair-02',
    pairNumber: '02',
    title: 'Pair 02: Agbo (Left) vs. Gajabahu (Right)',
    titleSi: 'යුගලය 02: අග්බෝ (වම්පස) සහ ගජබාහු (දකුණුපස)',
    image: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/observations/lookalikes/2_agbo_vs_gajabahu.jpg',
    left: {
      id: 'T096',
      name: 'Agbo',
      nameSi: 'අග්බෝ',
      range: 'Thirappane / Manankattiya / Mahakanadarawa',
      rangeSi: 'තිරප්පනේ / මානන්කට්ටිය / මහකනදරාව',
    },
    right: {
      id: 'T232',
      name: 'Gajabahu',
      nameSi: 'ගජබාහු',
      range: 'Padaviya / Wahalkada / Kebithigollewa',
      rangeSi: 'පදවිය / වාහල්කඩ / කැබිතිගොල්ලෑව',
    },
    differencesEn: [
      {
        label: 'Tusks',
        text: "Agbo's tusks are long, divergent, and curve gracefully upward with clean tips. Gajabahu's left tusk features distinctive wear and mud-caking patterns with a slightly steeper downward angle.",
      },
      {
        label: 'Ears',
        text: "Agbo's ear pinnae have a broad, flat top fold with fine marginal nicks. Gajabahu displays pronounced lateral ear folds with distinct depigmentation patches across the upper ear cartilage and temporal regions.",
      },
    ],
    differencesSi: [
      {
        label: 'දළවල ලක්ෂණ',
        text: 'අග්බෝගේ දළ දිගින් වැඩි වන අතර එකිනෙකින් ඈත් වී, අලංකාර ලෙස ඉහළට වක්‍ර වී පිහිටා ඇත. ඒවායේ අග්‍ර ද පැහැදිලි හා සුමට ස්වභාවයක් ගනී. ගජබාහුගේ වම් දළයේ විශේෂිත ගෙවීම් සලකුණු සහ මඩ තැවරීම් රටා දක්නට ලැබෙන අතර, එය තරමක් වැඩි කෝණයකින් පහළට නැඹුරු වී ඇත.',
      },
      {
        label: 'කන්වල ලක්ෂණ',
        text: 'අග්බෝගේ කන් පෙතිවල ඉහළ නැමීම පුළුල් හා පැතලි ස්වභාවයක් ගන්නා අතර, කන් මායිම්වල සියුම් කැපුම් සලකුණු දක්නට ලැබේ. ගජබාහුගේ කන්වල පැති දෙසට විහිදෙන කැපී පෙනෙන නැමීම් පවතින අතර, කන්වල ඉහළ කාටිලේජ ප්‍රදේශයේ සහ කන් හා හිස සම්බන්ධ වන ප්‍රදේශවල විශේෂිත වර්ණක අඩුවීම් ද දක්නට ලැබේ.',
      },
    ],
  },
  {
    id: 'pair-03',
    pairNumber: '03',
    title: 'Pair 03: Missaka (Left) vs. Homo (Right)',
    titleSi: 'යුගලය 03: මිස්සක (වම්පස) සහ හෝමෝ (දකුණුපස)',
    image: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/observations/lookalikes/3_missaka_vs_homo.jpg',
    left: {
      id: 'T078',
      name: 'Missaka',
      nameSi: 'මිස්සක',
      range: 'Galgamuwa',
      rangeSi: 'ගල්ගමුව',
    },
    right: {
      id: 'T073',
      name: 'Homo',
      nameSi: 'හෝමෝ',
      range: 'Kala Wewa / Galgamuwa',
      rangeSi: 'කලාවැව / ගල්ගමුව',
    },
    differencesEn: [
      {
        label: 'Tusks',
        text: "Both bulls bear short, thick, convergent tusks. However, Missaka's tusks are slightly more widely spaced at the base, while Homo's tusks point more sharply inward toward the trunk.",
      },
      {
        label: 'Facial & Ear Features',
        text: 'Missaka has prominent vertical forehead creases with a distinctive scar line on his trunk base. Homo has an iconic dome-shaped double cranial bump and subtle ear notch patterns near the bottom ear lobes that differentiate him in close encounters.',
      },
    ],
    differencesSi: [
      {
        label: 'දළවල ලක්ෂණ',
        text: 'ඇතුන් දෙදෙනාගේම දළ කෙටි, ඝනකමින් වැඩි සහ එකිනෙකට ළං වන ආකාරයෙන් පිහිටා ඇත. කෙසේ වෙතත්, මිස්සකගේ දළවල මුල් කොටස් අතර පරතරය තරමක් වැඩි වන අතර, හෝමෝගේ දළ හොඬවැල දෙසට වඩාත් තියුණු ලෙස ඇතුළට නැඹුරු වී ඇත.',
      },
      {
        label: 'මුහුණේ සහ කන්වල ලක්ෂණ',
        text: 'මිස්සකගේ නළලේ පැහැදිලි සිරස් රැලි දක්නට ලැබෙන අතර, හොඬවැලේ මුල් ප්‍රදේශයේ සුවිශේෂී කැළැල් රේඛාවක් ද පවතී. හෝමෝගේ හිසෙහි ගෝලාකාර හැඩයෙන් යුත් ද්විත්ව උස්වීම් සුවිශේෂී ලක්ෂණයක් වන අතර, කන් පෙතිවල පහළ කොටස් ආසන්නයේ දක්නට ලැබෙන සියුම් කැපුම් සලකුණු ද ඔහු සමීපව හඳුනාගැනීමට උපකාරී වේ.',
      },
    ],
  },
  {
    id: 'pair-04',
    pairNumber: '04',
    title: 'Pair 04: Devra (Left) vs. Parinda (Right)',
    titleSi: 'යුගලය 04: දේව්රා (වම්පස) සහ පරිඳ (දකුණුපස)',
    image: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/observations/lookalikes/4_devra_vs_parinda.jpg',
    left: {
      id: 'T173',
      name: 'Devra',
      nameSi: 'දේව්රා',
      range: 'Yala',
      rangeSi: 'යාල',
    },
    right: {
      id: 'T162',
      name: 'Parinda',
      nameSi: 'පරිඳ',
      range: 'Yala / Yala Block 3, 5',
      rangeSi: 'යාල / යාල කලාප 3 සහ 5',
    },
    differencesEn: [
      {
        label: 'Tusks',
        text: "Devra bears short, parallel tusks with slight asymmetrical elevation (left tusk slightly higher). Parinda's tusks are slightly longer, more divergent, and curve forward with sharper tapering tips.",
      },
      {
        label: 'Ears & Head Conformation',
        text: 'Devra has broad, forward-pointing ear folds with distinctive edge frills. Parinda features smaller, more rounded ear folds and distinctive depigmentation flecks along the inner ear border and trunk bridge.',
      },
    ],
    differencesSi: [
      {
        label: 'දළවල ලක්ෂණ',
        text: 'දේව්රාගේ දළ කෙටි වන අතර එකිනෙකට සමාන්තරව පිහිටා ඇත. එහෙත් සුළු අසමමිතිකභාවයක් දක්නට ලැබෙන අතර, වම් දළය දකුණු දළයට වඩා තරමක් ඉහළින් පිහිටා ඇත. පරිඳගේ දළ ඊට වඩා තරමක් දිගු වන අතර, එකිනෙකින් ඈත් වී ඉදිරියට වක්‍ර වන ආකාරයෙන් පිහිටා ඇත. දළ අග්‍ර ද වඩාත් තියුණු ලෙස සිහින් වී අවසන් වේ.',
      },
      {
        label: 'කන්වල සහ හිසෙහි හැඩ ලක්ෂණ',
        text: 'දේව්රාගේ කන්වල ඉදිරියට යොමු වූ පුළුල් නැමීම් සහ කන් මායිම්වල සුවිශේෂී රැලි සහිත ස්වභාවයක් දක්නට ලැබේ. පරිඳගේ කන් නැමීම් ප්‍රමාණයෙන් කුඩා හා වඩාත් වටකුරු හැඩයක් ගන්නා අතර, කන්වල ඇතුළත මායිම දිගේ සහ හොඬවැලේ ඉහළ සම්බන්ධක ප්‍රදේශයේ විශේෂිත වර්ණක අඩුවීම් දක්නට ලැබේ.',
      },
    ],
  },
];

/**
 * Finds the lookalike pair entry for a given tusker ID (case-insensitive).
 * @param {string|undefined|null} tuskerId
 * @returns {{ pair: object, side: 'left'|'right', self: object, counterpart: object } | null}
 */
export function getLookalikeMatchForTusker(tuskerId) {
  if (!tuskerId) return null;
  const normalized = String(tuskerId).trim().toUpperCase();
  for (const pair of LOOKALIKE_PAIRS) {
    if (pair.left.id.toUpperCase() === normalized) {
      return { pair, side: 'left', self: pair.left, counterpart: pair.right };
    }
    if (pair.right.id.toUpperCase() === normalized) {
      return { pair, side: 'right', self: pair.right, counterpart: pair.left };
    }
  }
  return null;
}
