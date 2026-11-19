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
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Abaya_Kawdulla.jpg',
    status: 'approved',
  },
  {
    id: 2,
    title: 'T096 - Agbo',
    tuskerName: 'T096 - Agbo',
    location: 'Mannakkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Agbo_Mannakkatiya.JPG',
    status: 'approved',
  },
  {
    id: 3,
    title: 'T108 - Ananda',
    tuskerName: 'T108 - Ananda',
    location: 'Mankkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ananda_Mankkatiya.JPG',
    status: 'approved',
  },
  {
    id: 4,
    title: 'T112 - Aravinda',
    tuskerName: 'T112 - Aravinda',
    location: 'Udawalawa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Aravinda.jpg',
    status: 'approved',
  },
  {
    id: 5,
    title: 'T008 - Arjuna',
    tuskerName: 'T008 - Arjuna',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Arjuna_Yala.JPG',
    status: 'approved',
  },
  {
    id: 6,
    title: 'Arrita',
    tuskerName: 'Arrita',
    location: 'Mahaviachciya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Arrita_Mahaviachciya.jpg',
    status: 'approved',
  },
  {
    id: 7,
    title: 'T196 - Asela',
    tuskerName: 'T196 - Asela',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Asela1_Minneriya.jpg',
    status: 'approved',
  },
  {
    id: 8,
    title: 'T196 - Asela',
    tuskerName: 'T196 - Asela',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Asela2_Kalawewa.JPG',
    status: 'approved',
  },
  {
    id: 9,
    title: 'T161 - Ashoka',
    tuskerName: 'T161 - Ashoka',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ashoka_Minneriya.jpg',
    status: 'approved',
  },
  {
    id: 10,
    title: 'T057 - Barana',
    tuskerName: 'T057 - Barana',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Barana_Kalawewa.jpg',
    status: 'approved',
  },
  {
    id: 11,
    title: 'T081 - Chandi',
    tuskerName: 'T081 - Chandi',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Chandi_Galgamuwa.jpg',
    status: 'approved',
  },
  {
    id: 12,
    title: 'T023 - Chethiya',
    tuskerName: 'T023 - Chethiya',
    location: 'Yala 5',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Chethiya_Yala_5.jpg',
    status: 'approved',
  },
  {
    id: 13,
    title: 'T099 - Dappula',
    tuskerName: 'T099 - Dappula',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Dappula_Kalawewa.JPG',
    status: 'approved',
  },
  {
    id: 14,
    title: 'T059 - Deega 1',
    tuskerName: 'T059 - Deega 1',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deega1_Kalawewa.jpg',
    status: 'approved',
  },
  {
    id: 15,
    title: 'T059 - Deega 1',
    tuskerName: 'T059 - Deega 1',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deega2_Kalawewa.jpg',
    status: 'approved',
  },
  {
    id: 16,
    title: 'Deegabaya',
    tuskerName: 'Deegabaya',
    location: 'Mahaviachciya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deegabaya_Mahaviachciya.jpg',
    status: 'approved',
  },
  {
    id: 17,
    title: 'T107 - Gajaba',
    tuskerName: 'T107 - Gajaba',
    location: 'YanOya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Gajabahu_YanOya.jpg',
    status: 'approved',
  },
  {
    id: 18,
    title: 'T074 - Puttuwa',
    tuskerName: 'T074 - Puttuwa',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Galagamuwa_Puttuwa_Galgamuwa.jpg',
    status: 'approved',
  },
  {
    id: 19,
    title: 'T012 - Gamunu',
    tuskerName: 'T012 - Gamunu',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Gamunu_Yala.jpg',
    status: 'approved',
  },
  {
    id: 20,
    title: 'T026 - Kalinga',
    tuskerName: 'T026 - Kalinga',
    location: 'Kumana',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kalinga_Kumana.jpg',
    status: 'approved',
  },
  {
    id: 21,
    title: 'T026 - Kalinga',
    tuskerName: 'T026 - Kalinga',
    location: 'Wilpattu',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kali_Wilpattu.jpg',
    status: 'approved',
  },
  {
    id: 22,
    title: 'Kashayapa',
    tuskerName: 'Kashayapa',
    location: 'Bundala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kashayapa_Bundala.jpg',
    status: 'approved',
  },
  {
    id: 23,
    title: 'T015 - Kashyapa',
    tuskerName: 'T015 - Kashyapa',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kashyapa_Yala.JPG',
    status: 'approved',
  },
  {
    id: 24,
    title: 'T246 - Kavan',
    tuskerName: 'T246 - Kavan',
    location: 'galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kavantissa_galgamuwa.jpg',
    status: 'approved',
  },
  {
    id: 25,
    title: 'T189 - Koliya',
    tuskerName: 'T189 - Koliya',
    location: 'Kawdulla',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Koliya_Kawdulla.jpg',
    status: 'approved',
  },
  {
    id: 26,
    title: 'T295 - Lankeshwara',
    tuskerName: 'T295 - Lankeshwara',
    location: 'Huruluwewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Lankeshwara_Huruluwewa.jpg',
    status: 'approved',
  },
  {
    id: 27,
    title: 'T020 - Lokeshwara',
    tuskerName: 'T020 - Lokeshwara',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Lokeshwara_Yala.jpg',
    status: 'approved',
  },
  {
    id: 28,
    title: 'T005 - Mahasen',
    tuskerName: 'T005 - Mahasen',
    location: 'Lunugamwehera',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mahasena_Lunugamwehera.jpg',
    status: 'approved',
  },
  {
    id: 29,
    title: 'T005 - Mahasen',
    tuskerName: 'T005 - Mahasen',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mahasen_Minneriya.jpg',
    status: 'approved',
  },
  {
    id: 30,
    title: 'T064 - Mangala',
    tuskerName: 'T064 - Mangala',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mangala_Kalawewa.JPG',
    status: 'approved',
  },
  {
    id: 31,
    title: 'T151 - Migara',
    tuskerName: 'T151 - Migara',
    location: 'Maruoya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Migara_Maruoya.jpg',
    status: 'approved',
  },
  {
    id: 32,
    title: 'T078 - Missaka',
    tuskerName: 'T078 - Missaka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Missaka_Galgamuwa2.JPG',
    status: 'approved',
  },
  {
    id: 33,
    title: 'T010 - Nandimithra',
    tuskerName: 'T010 - Nandimithra',
    location: 'Manakkatiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mithra_Manakkatiya.jpg',
    status: 'approved',
  },
  {
    id: 34,
    title: 'T111 - Mugalan',
    tuskerName: 'T111 - Mugalan',
    location: 'Udawalawe',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mugalan_Udawalawe.JPG',
    status: 'approved',
  },
  {
    id: 35,
    title: 'T009 - Nalaka',
    tuskerName: 'T009 - Nalaka',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Nalaka_Yala.jpg',
    status: 'approved',
  },
  {
    id: 36,
    title: 'T103 - Mithra',
    tuskerName: 'T103 - Mithra',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Nandamithra_Yala.JPG',
    status: 'approved',
  },
  {
    id: 37,
    title: 'T058 - Neela',
    tuskerName: 'T058 - Neela',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Neela_Kalawewa.jpg',
    status: 'approved',
  },
  {
    id: 38,
    title: 'T083 - Panduka',
    tuskerName: 'T083 - Panduka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Panduka_Galgamuwa.JPG',
    status: 'approved',
  },
  {
    id: 39,
    title: 'T162 - Parinda',
    tuskerName: 'T162 - Parinda',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Parinda_Yala.jpg',
    status: 'approved',
  },
  {
    id: 40,
    title: 'T017 - Podi Dananjaya',
    tuskerName: 'T017 - Podi Dananjaya',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Podi_Dananjaya_Yala.jpg',
    status: 'approved',
  },
  {
    id: 41,
    title: 'Ragu',
    tuskerName: 'Ragu',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ragu_Galgamuwa.JPG',
    status: 'approved',
  },
  {
    id: 42,
    title: 'Rathaka',
    tuskerName: 'Rathaka',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Rathaka_Galgamuwa.JPG',
    status: 'approved',
  },
  {
    id: 43,
    title: 'T079 - Ratta',
    tuskerName: 'T079 - Ratta',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ratta_Galgamuwa.jpg',
    status: 'approved',
  },
  {
    id: 44,
    title: 'Rewatha',
    tuskerName: 'Rewatha',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Rewatha_Kalawewa.JPG',
    status: 'approved',
  },
  {
    id: 45,
    title: 'T011 - Sando',
    tuskerName: 'T011 - Sando',
    location: 'Yala',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sando_Yala.JPG',
    status: 'approved',
  },
  {
    id: 46,
    title: 'T047 - Sapumal',
    tuskerName: 'T047 - Sapumal',
    location: 'Kawdulla',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sapumal_Kawdulla.jpg',
    status: 'approved',
  },
  {
    id: 47,
    title: 'T132 - Soorya',
    tuskerName: 'T132 - Soorya',
    location: 'Mahawilachchiya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Soorya_Mahawilachchiya.JPG',
    status: 'approved',
  },
  {
    id: 48,
    title: 'T038 - Sumedha',
    tuskerName: 'T038 - Sumedha',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sumedha_Minneriya.jpg',
    status: 'approved',
  },
  {
    id: 49,
    title: 'Theekke Raja',
    tuskerName: 'Theekke Raja',
    location: 'Galgamuwa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Theekke_Raja_Galgamuwa.jpg',
    status: 'approved',
  },
  {
    id: 50,
    title: 'Tissa',
    tuskerName: 'Tissa',
    location: 'Lunugamwehera',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Tissa_Lunugamwehera.jpg',
    status: 'approved',
  },
  {
    id: 51,
    title: 'T039 - Unicorn',
    tuskerName: 'T039 - Unicorn',
    location: 'Minneriya',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Unicorn_Minneriya.jpg',
    status: 'approved',
  },
  {
    id: 52,
    title: 'Walaganba',
    tuskerName: 'Walaganba',
    location: 'Karuwalagaswewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Walaganba_Karuwalagaswewa.jpeg',
    status: 'approved',
  },
  {
    id: 53,
    title: 'T072 - Wijaya',
    tuskerName: 'T072 - Wijaya',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Wijaya_Kalawewa.jpg',
    status: 'approved',
  },
  {
    id: 54,
    title: 'T072 - Wijaya',
    tuskerName: 'T072 - Wijaya',
    location: 'WIlpattu',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Wijaya_WIlpattu.jpg',
    status: 'approved',
  },
  {
    id: 55,
    title: 'T069 - Yasa',
    tuskerName: 'T069 - Yasa',
    location: 'Kalawewa',
    date: '2026-11-15',
    photographer: 'WTS Research Team',
    imageUrl: 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Yasa_Kalawewa.JPG',
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

