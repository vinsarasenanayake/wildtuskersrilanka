import { supabase, fromRow } from '../lib/supabaseClient';
import { uploadMediaFile } from '../utils/storageUpload';

/* ==============================================================
   SECTION 1: STARTER SEED PHOTOS (Fallback if table is empty)
============================================================== */
export const DEFAULT_GALLERY = [
  {
    id: 1,
    title: 'T048 - Abhaya',
    tuskerName: 'T048 - Abhaya',
    location: 'Kaudulla',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Abaya_Kawdulla.webp',
    status: 'approved',
  },
  {
    id: 2,
    title: 'T096 - Agbo',
    tuskerName: 'T096 - Agbo',
    location: 'Mannakkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Agbo_Mannakkatiya.webp',
    status: 'approved',
  },
  {
    id: 3,
    title: 'T108 - Ananda',
    tuskerName: 'T108 - Ananda',
    location: 'Mankkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Ananda_Mankkatiya.webp',
    status: 'approved',
  },
  {
    id: 4,
    title: 'T112 - Aravinda',
    tuskerName: 'T112 - Aravinda',
    location: 'Udawalawa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Aravinda.webp',
    status: 'approved',
  },
  {
    id: 5,
    title: 'T008 - Arjuna',
    tuskerName: 'T008 - Arjuna',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Arjuna_Yala.webp',
    status: 'approved',
  },
  {
    id: 6,
    title: 'T121 - Aritta',
    tuskerName: 'T121 - Aritta',
    location: 'Mahaviachciya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Arrita_Mahaviachciya.webp',
    status: 'approved',
  },
  {
    id: 7,
    title: 'T062 - Esala 1',
    tuskerName: 'T062 - Esala 1',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Asela1_Minneriya.webp',
    status: 'approved',
  },
  {
    id: 8,
    title: 'T063 - Esala 2',
    tuskerName: 'T063 - Esala 2',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Asela2_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 9,
    title: 'T161 - Ashoka',
    tuskerName: 'T161 - Ashoka',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Ashoka_Minneriya.webp',
    status: 'approved',
  },
  {
    id: 10,
    title: 'T057 - Barana',
    tuskerName: 'T057 - Barana',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Barana_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 11,
    title: 'T081 - Chandi',
    tuskerName: 'T081 - Chandi',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Chandi_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 12,
    title: 'T023 - Chethiya',
    tuskerName: 'T023 - Chethiya',
    location: 'Yala 5',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Chethiya_Yala_5.webp',
    status: 'approved',
  },
  {
    id: 13,
    title: 'T099 - Dappula',
    tuskerName: 'T099 - Dappula',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Dappula_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 14,
    title: 'T059 - Deega 1',
    tuskerName: 'T059 - Deega 1',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Deega1_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 15,
    title: 'T059 - Deega 1',
    tuskerName: 'T059 - Deega 1',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Deega2_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 16,
    title: 'T185 - Deeghabaya',
    tuskerName: 'T185 - Deeghabaya',
    location: 'Mahaviachciya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Deegabaya_Mahaviachciya.webp',
    status: 'approved',
  },
  {
    id: 17,
    title: 'T107 - Gajaba',
    tuskerName: 'T107 - Gajaba',
    location: 'YanOya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Gajabahu_YanOya.webp',
    status: 'approved',
  },
  {
    id: 18,
    title: 'T074 - Puttuwa',
    tuskerName: 'T074 - Puttuwa',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Galagamuwa_Puttuwa_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 19,
    title: 'T012 - Gamunu',
    tuskerName: 'T012 - Gamunu',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Gamunu_Yala.webp',
    status: 'approved',
  },
  {
    id: 20,
    title: 'T026 - Kalinga',
    tuskerName: 'T026 - Kalinga',
    location: 'Kumana',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Kalinga_Kumana.webp',
    status: 'approved',
  },
  {
    id: 21,
    title: 'T026 - Kalinga',
    tuskerName: 'T026 - Kalinga',
    location: 'Wilpattu',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Kali_Wilpattu.webp',
    status: 'approved',
  },
  {
    id: 22,
    title: 'T035 - Kashyapa',
    tuskerName: 'T035 - Kashyapa',
    location: 'Bundala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Kashayapa_Bundala.webp',
    status: 'approved',
  },
  {
    id: 23,
    title: 'T015 - Kashyapa',
    tuskerName: 'T015 - Kashyapa',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Kashyapa_Yala.webp',
    status: 'approved',
  },
  {
    id: 24,
    title: 'T246 - Kavan',
    tuskerName: 'T246 - Kavan',
    location: 'galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Kavantissa_galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 25,
    title: 'T189 - Koliya',
    tuskerName: 'T189 - Koliya',
    location: 'Kawdulla',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Koliya_Kawdulla.webp',
    status: 'approved',
  },
  {
    id: 26,
    title: 'T295 - Lankeshwara',
    tuskerName: 'T295 - Lankeshwara',
    location: 'Huruluwewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Lankeshwara_Huruluwewa.webp',
    status: 'approved',
  },
  {
    id: 27,
    title: 'T020 - Lokeshwara',
    tuskerName: 'T020 - Lokeshwara',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Lokeshwara_Yala.webp',
    status: 'approved',
  },
  {
    id: 28,
    title: 'T005 - Mahasen',
    tuskerName: 'T005 - Mahasen',
    location: 'Lunugamwehera',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Mahasena_Lunugamwehera.webp',
    status: 'approved',
  },
  {
    id: 29,
    title: 'T005 - Mahasen',
    tuskerName: 'T005 - Mahasen',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Mahasen_Minneriya.webp',
    status: 'approved',
  },
  {
    id: 30,
    title: 'T064 - Mangala',
    tuskerName: 'T064 - Mangala',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Mangala_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 31,
    title: 'T151 - Migara',
    tuskerName: 'T151 - Migara',
    location: 'Maruoya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Migara_Maruoya.webp',
    status: 'approved',
  },
  {
    id: 32,
    title: 'T078 - Missaka',
    tuskerName: 'T078 - Missaka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Missaka_Galgamuwa2.webp',
    status: 'approved',
  },
  {
    id: 33,
    title: 'T010 - Nandimithra',
    tuskerName: 'T010 - Nandimithra',
    location: 'Manakkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Mithra_Manakkatiya.webp',
    status: 'approved',
  },
  {
    id: 34,
    title: 'T111 - Mugalan',
    tuskerName: 'T111 - Mugalan',
    location: 'Udawalawe',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Mugalan_Udawalawe.webp',
    status: 'approved',
  },
  {
    id: 35,
    title: 'T009 - Nalaka',
    tuskerName: 'T009 - Nalaka',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Nalaka_Yala.webp',
    status: 'approved',
  },
  {
    id: 36,
    title: 'T103 - Mithra',
    tuskerName: 'T103 - Mithra',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Nandamithra_Yala.webp',
    status: 'approved',
  },
  {
    id: 37,
    title: 'T058 - Neela',
    tuskerName: 'T058 - Neela',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Neela_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 38,
    title: 'T083 - Panduka',
    tuskerName: 'T083 - Panduka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Panduka_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 39,
    title: 'T162 - Parinda',
    tuskerName: 'T162 - Parinda',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Parinda_Yala.webp',
    status: 'approved',
  },
  {
    id: 40,
    title: 'T017 - Podi Dananjaya',
    tuskerName: 'T017 - Podi Dananjaya',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Podi_Dananjaya_Yala.webp',
    status: 'approved',
  },
  {
    id: 41,
    title: 'T077 - Raghu',
    tuskerName: 'T077 - Raghu',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Ragu_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 42,
    title: 'T082 - Raththaka',
    tuskerName: 'T082 - Raththaka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Rathaka_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 43,
    title: 'T079 - Ratta',
    tuskerName: 'T079 - Ratta',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Ratta_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 44,
    title: 'T056 - Revatha',
    tuskerName: 'T056 - Revatha',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Rewatha_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 45,
    title: 'T011 - Sando',
    tuskerName: 'T011 - Sando',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Sando_Yala.webp',
    status: 'approved',
  },
  {
    id: 46,
    title: 'T047 - Sapumal',
    tuskerName: 'T047 - Sapumal',
    location: 'Kawdulla',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Sapumal_Kawdulla.webp',
    status: 'approved',
  },
  {
    id: 47,
    title: 'T132 - Soorya',
    tuskerName: 'T132 - Soorya',
    location: 'Mahawilachchiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Soorya_Mahawilachchiya.webp',
    status: 'approved',
  },
  {
    id: 48,
    title: 'T038 - Sumedha',
    tuskerName: 'T038 - Sumedha',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Sumedha_Minneriya.webp',
    status: 'approved',
  },
  {
    id: 49,
    title: 'T076 - Thekke Raja',
    tuskerName: 'T076 - Thekke Raja',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Theekke_Raja_Galgamuwa.webp',
    status: 'approved',
  },
  {
    id: 50,
    title: 'T022 - Thissa',
    tuskerName: 'T022 - Thissa',
    location: 'Lunugamwehera',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Tissa_Lunugamwehera.webp',
    status: 'approved',
  },
  {
    id: 51,
    title: 'T039 - Unicorn',
    tuskerName: 'T039 - Unicorn',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Unicorn_Minneriya.webp',
    status: 'approved',
  },
  {
    id: 52,
    title: 'T219 - Walagamba',
    tuskerName: 'T219 - Walagamba',
    location: 'Karuwalagaswewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Walaganba_Karuwalagaswewa.webp',
    status: 'approved',
  },
  {
    id: 53,
    title: 'T072 - Wijaya',
    tuskerName: 'T072 - Wijaya',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Wijaya_Kalawewa.webp',
    status: 'approved',
  },
  {
    id: 54,
    title: 'T072 - Wijaya',
    tuskerName: 'T072 - Wijaya',
    location: 'WIlpattu',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Wijaya_WIlpattu.webp',
    status: 'approved',
  },
  {
    id: 55,
    title: 'T069 - Yasa',
    tuskerName: 'T069 - Yasa',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/Yasa_Kalawewa.webp',
    status: 'approved',
  },
];

/* ==============================================================
   SECTION 2: IMAGE UPLOAD HELPER (Supabase Storage)
============================================================== */
async function uploadGalleryImage(img) {
  if (!img) return null;
  if (typeof img === 'string' && /^https?:\/\//i.test(img)) return img;
  try {
    return await uploadMediaFile(img, 'gallery');
  } catch (err) {
    console.error('[GalleryModel] Failed to upload image:', err);
    return null; // never store raw image data in the database
  }
}

/* ==============================================================
   SECTION 3: GALLERY CRUD OPERATIONS
============================================================== */
export async function getGalleryPhotos({ admin = false } = {}) {
  try {
    let query = supabase
      .from('gallery_photos')
      .select('*')
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (!admin) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      const rows = data.map(fromRow);
      if (admin) return rows;
      if (rows.length < DEFAULT_GALLERY.length) {
        const existingUrls = new Set(rows.map((r) => r.imageUrl));
        const additional = DEFAULT_GALLERY.filter((d) => !existingUrls.has(d.imageUrl));
        return [...rows, ...additional];
      }
      return rows;
    }
  } catch (err) {
    console.warn('[GalleryModel] Could not fetch from Supabase, using default gallery:', err);
  }
  return DEFAULT_GALLERY;
}

export async function submitGalleryPhoto(form) {
  const imageUrl = await uploadGalleryImage(form.image || form.imageUrl);
  if (!imageUrl) throw new Error('Please select or provide a photo.');

  const row = {
    image_url: imageUrl,
    title: form.title,
    tusker_name: form.tuskerName || null,
    location: form.location || null,
    date: form.date || new Date().toISOString().split('T')[0],
    photographer: form.photographer,
    photographer_contact: form.photographerContact || null,
    status: 'pending',
  };

  const { error } = await supabase
    .from('gallery_photos')
    .insert(row);

  if (error) throw error;
  return fromRow(row);
}

export async function approveGalleryPhoto(id) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function rejectGalleryPhoto(id) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .update({ status: 'rejected' })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteGalleryPhoto(id) {
  const { error } = await supabase
    .from('gallery_photos')
    .delete()
    .eq('id', Number(id));

  if (error) throw error;
  return true;
}

