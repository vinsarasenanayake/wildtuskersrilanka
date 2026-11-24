/**
 * @file TuskerIdentificationModel.js
 * @description Data access model for educational presentations, guides, and morphological
 * tusker identification materials. Features full online/offline caching, transparent
 * table fallback, document upload support, and clean record serialization.
 */

import { supabase, fromRow, toRow } from '../lib/supabaseClient';
import { uploadMediaFile, uploadDocumentFile } from '../utils/storageUpload';

/* ==============================================================
   SECTION 1: STARTER SEED IDENTIFICATIONS
============================================================== */
export const DEFAULT_IDENTIFICATIONS = [];

/* ==============================================================
   SECTION 2: METADATA SERIALIZATION (FOR FALLBACK STORAGE)
============================================================== */
export function parseIdentificationMeta(rawDescription) {
  if (!rawDescription) return { description: '' };
  const metaMatch = String(rawDescription).match(/<!--WTS_IDENT_META:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      const cleanDesc = rawDescription.replace(metaMatch[0], '').trim();
      return { ...meta, description: cleanDesc };
    } catch (e) {
      console.warn('[TuskerIdentificationModel] Failed to parse meta:', e);
    }
  }
  return { description: rawDescription };
}

export function serializeIdentificationMeta(data) {
  const meta = {
    category: data.category || 'General',
    author: data.author || 'Wild Tuskers Sri Lanka Research Team',
    coverImage: data.coverImage || '',
    fileUrl: data.fileUrl || '',
    fileName: data.fileName || '',
    fileType: data.fileType || '',
    fileSize: data.fileSize || 0,
    slideImages: data.slideImages || [],
  };
  const cleanDesc = (data.description || '').trim();
  return `<!--WTS_IDENT_META:${JSON.stringify(meta)}-->\n${cleanDesc}`;
}

/* ==============================================================
   SECTION 3: INSTANT CACHING (0ms Page Loads)
============================================================= */
let identCache = null;
let identCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedIdentifications() {
  const now = Date.now();
  if (identCache && now - identCacheTime < CACHE_TTL_MS) {
    return identCache.filter((i) => !String(i.id).startsWith('seed-'));
  }
  try {
    const saved = sessionStorage.getItem('wts_identifications_cache') || localStorage.getItem('wts_identifications_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      const filtered = Array.isArray(parsed) ? parsed.filter((i) => !String(i.id).startsWith('seed-')) : [];
      identCache = filtered;
      identCacheTime = now;
      return filtered;
    }
  } catch { /* ignore */ }
  return null;
}

export function invalidateIdentificationsCache() {
  identCache = null;
  identCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_identifications_cache');
    localStorage.removeItem('wts_identifications_cache');
  } catch { /* ignore */ }
}

function persistCache(items) {
  identCache = items;
  identCacheTime = Date.now();
  try {
    const str = JSON.stringify(items);
    sessionStorage.setItem('wts_identifications_cache', str);
    localStorage.setItem('wts_identifications_cache', str);
  } catch { /* ignore */ }
}

/* ==============================================================
   SECTION 4: ROW MAPPING
============================================================== */
function mapDedicatedRow(row) {
  const o = fromRow(row);
  return {
    id: o.id,
    title: o.title || '',
    category: o.category || 'General',
    description: o.description || '',
    author: o.author || 'Wild Tuskers Sri Lanka Research Team',
    coverImage: o.coverImage || '',
    fileUrl: o.fileUrl || '',
    fileName: o.fileName || '',
    fileType: o.fileType || (o.fileName ? o.fileName.split('.').pop().toLowerCase() : 'pptx'),
    fileSize: Number(o.fileSize) || 0,
    slideImages: Array.isArray(o.slideImages) ? o.slideImages : [],
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

function mapFallbackRow(row) {
  const meta = parseIdentificationMeta(row.description);
  return {
    id: row.id,
    title: row.title || '',
    category: meta.category || row.tusker_name || 'General',
    description: meta.description || '',
    author: meta.author || row.author || 'Wild Tuskers Sri Lanka Research Team',
    coverImage: meta.coverImage || (row.images && row.images[0]) || '',
    fileUrl: meta.fileUrl || '',
    fileName: meta.fileName || '',
    fileType: meta.fileType || (meta.fileName ? meta.fileName.split('.').pop().toLowerCase() : 'pptx'),
    fileSize: Number(meta.fileSize) || 0,
    slideImages: Array.isArray(meta.slideImages) ? meta.slideImages : (row.images && row.images.slice(1)) || [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/* ==============================================================
   SECTION 5: CRUD OPERATIONS (SUPABASE + FALLBACK)
============================================================== */
export async function getIdentifications(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedIdentifications();
    if (cached && cached.length > 0) return cached;
  }

  // 1. Try dedicated table first
  try {
    const { data, error } = await supabase
      .from('tusker_identifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const items = data.map(mapDedicatedRow);
      persistCache(items);
      return items;
    }
  } catch (err) {
    console.warn('[TuskerIdentificationModel] Dedicated table not yet available, falling back:', err);
  }

  // 2. Fallback to special_observations where location = 'LEARN_IDENTIFICATION'
  try {
    const { data, error } = await supabase
      .from('special_observations')
      .select('*')
      .eq('location', 'LEARN_IDENTIFICATION')
      .order('id', { ascending: false });

    if (!error && data && data.length > 0) {
      const items = data.map(mapFallbackRow);
      persistCache(items);
      return items;
    }
  } catch (err) {
    console.warn('[TuskerIdentificationModel] Fallback query error:', err);
  }

  // 3. Fallback to default starter seeds
  persistCache(DEFAULT_IDENTIFICATIONS);
  return DEFAULT_IDENTIFICATIONS;
}

export async function getIdentificationById(id) {
  const cached = getCachedIdentifications();
  if (cached) {
    const found = cached.find((i) => String(i.id) === String(id));
    if (found) return found;
  }

  // Try dedicated table
  try {
    const { data } = await supabase
      .from('tusker_identifications')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    if (data) return mapDedicatedRow(data);
  } catch { /* ignore */ }

  // Try fallback
  try {
    const { data } = await supabase
      .from('special_observations')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    if (data) return mapFallbackRow(data);
  } catch { /* ignore */ }

  return DEFAULT_IDENTIFICATIONS.find((i) => String(i.id) === String(id)) || null;
}

export async function addIdentification(payload) {
  let coverImage = payload.coverImage;
  if (coverImage && (coverImage instanceof Blob || coverImage.startsWith('data:') || coverImage.startsWith('blob:'))) {
    coverImage = await uploadMediaFile(coverImage, 'identifications');
  }

  let fileUrl = payload.fileUrl;
  let fileName = payload.fileName || '';
  let fileType = payload.fileType || '';
  let fileSize = payload.fileSize || 0;

  if (payload.file && payload.file instanceof Blob) {
    const docMeta = await uploadDocumentFile(payload.file, 'identifications');
    if (docMeta) {
      fileUrl = docMeta.url;
      fileName = docMeta.name;
      fileType = docMeta.type;
      fileSize = docMeta.size;
    }
  }

  // Upload any slide images
  const slideImages = [];
  if (Array.isArray(payload.slideImages)) {
    for (const slide of payload.slideImages) {
      if (slide instanceof Blob || (typeof slide === 'string' && (slide.startsWith('data:') || slide.startsWith('blob:')))) {
        const uploaded = await uploadMediaFile(slide, 'identifications');
        if (uploaded) slideImages.push(uploaded);
      } else if (typeof slide === 'string' && slide) {
        slideImages.push(slide);
      }
    }
  }

  const record = {
    title: payload.title.trim(),
    category: payload.category || 'General',
    description: payload.description.trim(),
    author: payload.author || 'Wild Tuskers Sri Lanka Research Team',
    coverImage: coverImage || '',
    fileUrl: fileUrl || '',
    fileName: fileName || '',
    fileType: fileType || (fileName ? fileName.split('.').pop().toLowerCase() : 'pptx'),
    fileSize: fileSize || 0,
    slideImages,
  };

  // 1. Try insert into dedicated table
  try {
    const { data, error } = await supabase
      .from('tusker_identifications')
      .insert([toRow(record, [
        'title', 'category', 'description', 'author', 'coverImage',
        'fileUrl', 'fileName', 'fileType', 'fileSize', 'slideImages'
      ])])
      .select()
      .single();

    if (!error && data) {
      invalidateIdentificationsCache();
      return mapDedicatedRow(data);
    }
  } catch (err) {
    console.warn('[TuskerIdentificationModel] Could not write to dedicated table, using fallback:', err);
  }

  // 2. Fallback insert into special_observations
  const serializedDesc = serializeIdentificationMeta(record);
  const images = [record.coverImage, ...record.slideImages].filter(Boolean);
  const { data: fbData, error: fbErr } = await supabase
    .from('special_observations')
    .insert([{
      date: '2026-01-01',
      tusker_name: record.category,
      location: 'LEARN_IDENTIFICATION',
      title: record.title,
      description: serializedDesc,
      images,
      author: record.author,
    }])
    .select()
    .single();

  if (fbErr) {
    console.error('[TuskerIdentificationModel] Fallback insert failed:', fbErr);
    // If Supabase is unavailable, create local item
    const localId = `local-${Date.now()}`;
    const localItem = { ...record, id: localId, createdAt: new Date().toISOString() };
    const current = getCachedIdentifications() || DEFAULT_IDENTIFICATIONS;
    persistCache([localItem, ...current]);
    return localItem;
  }

  invalidateIdentificationsCache();
  return mapFallbackRow(fbData);
}

export async function updateIdentification(id, updated) {
  let coverImage = updated.coverImage;
  if (coverImage && (coverImage instanceof Blob || coverImage.startsWith('data:') || coverImage.startsWith('blob:'))) {
    coverImage = await uploadMediaFile(coverImage, 'identifications');
  }

  let fileUrl = updated.fileUrl;
  let fileName = updated.fileName || '';
  let fileType = updated.fileType || '';
  let fileSize = updated.fileSize || 0;

  if (updated.file && updated.file instanceof Blob) {
    const docMeta = await uploadDocumentFile(updated.file, 'identifications');
    if (docMeta) {
      fileUrl = docMeta.url;
      fileName = docMeta.name;
      fileType = docMeta.type;
      fileSize = docMeta.size;
    }
  }

  const record = {
    title: updated.title.trim(),
    category: updated.category || 'General',
    description: updated.description.trim(),
    author: updated.author || 'Wild Tuskers Sri Lanka Research Team',
    coverImage: coverImage || '',
    fileUrl: fileUrl || '',
    fileName: fileName || '',
    fileType: fileType || (fileName ? fileName.split('.').pop().toLowerCase() : 'pptx'),
    fileSize: fileSize || 0,
    slideImages: updated.slideImages || [],
  };

  // Try dedicated table
  try {
    const { data, error } = await supabase
      .from('tusker_identifications')
      .update(toRow(record, [
        'title', 'category', 'description', 'author', 'coverImage',
        'fileUrl', 'fileName', 'fileType', 'fileSize', 'slideImages'
      ]))
      .eq('id', Number(id))
      .select()
      .maybeSingle();

    if (!error && data) {
      invalidateIdentificationsCache();
      return mapDedicatedRow(data);
    }
  } catch { /* ignore */ }

  // Try fallback
  const serializedDesc = serializeIdentificationMeta(record);
  const images = [record.coverImage, ...record.slideImages].filter(Boolean);
  const { data: fbData } = await supabase
    .from('special_observations')
    .update({
      tusker_name: record.category,
      title: record.title,
      description: serializedDesc,
      images,
      author: record.author,
    })
    .eq('id', Number(id))
    .select()
    .maybeSingle();

  invalidateIdentificationsCache();
  if (fbData) return mapFallbackRow(fbData);

  // Fallback cache update
  const current = getCachedIdentifications() || DEFAULT_IDENTIFICATIONS;
  const updatedList = current.map((i) => (String(i.id) === String(id) ? { ...i, ...record } : i));
  persistCache(updatedList);
  return { id, ...record };
}

export async function deleteIdentification(id) {
  invalidateIdentificationsCache();

  try {
    await supabase.from('tusker_identifications').delete().eq('id', Number(id));
  } catch { /* ignore */ }

  try {
    await supabase.from('special_observations').delete().eq('id', Number(id));
  } catch { /* ignore */ }

  const current = getCachedIdentifications() || DEFAULT_IDENTIFICATIONS;
  const filtered = current.filter((i) => String(i.id) !== String(id));
  persistCache(filtered);
  return true;
}
