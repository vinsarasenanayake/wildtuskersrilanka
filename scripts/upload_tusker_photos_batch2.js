import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ysloiyecqryftybzcujh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HPMqQNUgV_xstztrDO8wuQ__ulTar6Z';
const BUCKET = 'wts-media';
const SOURCE_DIR = 'C:\\Users\\ASUS\\Downloads\\Tuskers\\New addings';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAPPING = {
  'aggabhodhi': { id: 'T251', name: 'Aggabhodi' },
  'Asthika': { id: 'T266', name: 'Asthika' },
  'Buddhi': { id: 'T275', name: 'Buddhi' },
  'Chula naga': { id: 'T274', name: 'Chula Naga' },
  'Dakshina': { id: 'T245', name: 'Dhakshina' },
  'Datiya': { id: 'T268', name: 'Dathiya' },
  'Deegabaya': { id: 'T242', name: 'Deeghabaya' },
  'Devaka': { id: 'T258', name: 'Devaka' },
  'Devendra': { id: 'T257', name: 'Devendra' },
  'Eka Dantha': { id: 'T264', name: 'Eka Dantha' },
  'jayabahu': { id: 'T248', name: 'Jayabahu' },
  'Jeeva': { id: 'T240', name: 'Jeeva' },
  'Kabir': { id: 'T253', name: 'Kabhir' },
  'Kapila': { id: 'T252', name: 'Kapila' },
  'kavan': { id: 'T246', name: 'Kavan' },
  'Kovida': { id: 'T265', name: 'Kovida' },
  'Madduma': { id: 'T239', name: 'Madduma' },
  'Mahi': { id: 'T267', name: 'Mahi' },
  'megha': { id: 'T243', name: 'Megha' },
  'Mitta': { id: 'T238', name: 'Mitta' },
  'Nath': { id: 'T260', name: 'Nath' },
  'Neelagiri': { id: 'T270', name: 'Neelagiri' },
  'Nimala': { id: 'T241', name: 'Nimala' },
  'Parami': { id: 'T254', name: 'Parami' },
  'Rajinda': { id: 'T263', name: 'Rajinda' },
  'ravinatha': { id: 'T273', name: 'Ravinath' },
  'Revatha 2': { id: 'T256', name: 'Reveatha 2' },
  'saddha': { id: 'T249', name: 'Saddha' },
  'Sankadathu': { id: 'T269', name: 'Sankadhathu' },
  'Senul': { id: 'T261', name: 'Kenul' },
  'Shiva': { id: 'T271', name: 'Shiva' },
  'Sinhabahu': { id: 'T237', name: 'Sinhabahu' },
  'Theraputta': { id: 'T236', name: 'Therapuththa' },
  'Thiru': { id: 'T255', name: 'Thiru' },
  'Vibhishana': { id: 'T272', name: 'Vibhishana' },
  'Vimukthi': { id: 'T259', name: 'Vimukthi' },
  'viruu': { id: 'T250', name: 'Viru' },
  'walagamba 2': { id: 'T247', name: 'Walagamba 2' },
  'Wessagiri': { id: 'T262', name: 'Vessagiri' },
};

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function cleanNameForFilename(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

async function main() {
  console.log('--- Starting Tusker Photo Upload & Rename (Batch 2 - 39 Tuskers) ---');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
  const sqlStatements = [];
  let totalFiles = 0;
  let totalUploaded = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderName = entry.name;
    const match = MAPPING[folderName];

    if (!match) {
      console.log(`Skipping folder: ${folderName} (not mapped or excluded)`);
      continue;
    }

    const { id: tId, name: tName } = match;
    const folderPath = path.join(SOURCE_DIR, folderName);
    const existingFiles = fs.readdirSync(folderPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (existingFiles.length === 0) {
      console.warn(`No photos found in folder: ${folderName}`);
      continue;
    }

    // Sort naturally so order is consistent
    existingFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const cleanName = cleanNameForFilename(tName);
    const renamedFiles = [];

    // Step 1: Rename locally to standard convention: ${tId}_${cleanName}_${index}.${ext}
    for (let i = 0; i < existingFiles.length; i++) {
      const oldFilename = existingFiles[i];
      const ext = path.extname(oldFilename).toLowerCase();
      const targetFilename = `${tId}_${cleanName}_${i + 1}${ext}`;
      const oldPath = path.join(folderPath, oldFilename);
      const newPath = path.join(folderPath, targetFilename);

      if (oldFilename !== targetFilename) {
        fs.renameSync(oldPath, newPath);
        renamedFiles.push(targetFilename);
      } else {
        renamedFiles.push(oldFilename);
      }
    }

    console.log(`\nProcessing ${folderName} -> [${tId} ${tName}] (${renamedFiles.length} photos)...`);

    const photoUrls = [];

    // Step 2: Upload to Supabase Storage bucket 'wts-media'
    for (const filename of renamedFiles) {
      totalFiles++;
      const ext = path.extname(filename).toLowerCase();
      const filePath = path.join(folderPath, filename);
      const storageKey = `tuskers/${filename}`;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storageKey}`;
      photoUrls.push(publicUrl);

      const fileBuffer = fs.readFileSync(filePath);
      const contentType = MIME_MAP[ext] || 'image/jpeg';

      console.log(`  Uploading ${storageKey} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storageKey, fileBuffer, {
        contentType,
        upsert: true,
      });

      if (uploadError) {
        console.error(`  [UPLOAD ERROR] ${uploadError.message}`);
      } else {
        totalUploaded++;
        console.log(`  [UPLOAD OK] ${storageKey}`);
      }
    }

    // Step 3: Direct DB Update & SQL generation
    if (photoUrls.length > 0) {
      const formattedArray = photoUrls.map(u => `'${u}'`).join(', ');
      const sql = `update public.tuskers set photos = array[${formattedArray}] where id = '${tId}';`;
      sqlStatements.push(sql);

      const { error: dbErr } = await supabase
        .from('tuskers')
        .update({ photos: photoUrls })
        .eq('id', tId);

      if (dbErr) {
        console.warn(`  [DB WARNING] ${tId}: ${dbErr.message}`);
      } else {
        console.log(`  [DB OK] ${tId} photos updated in database!`);
      }
    }
  }

  // Write SQL Migration File
  const sqlFile = path.resolve('supabase/migrations/20261118030000_seed_tusker_album_photos_batch2.sql');
  const fileContent = [
    '-- =====================================================================',
    '-- Migration: Seed Tusker Album Photos (Batch 2 - 39 Identified Tuskers)',
    `-- Generated on ${new Date().toISOString()}`,
    `-- Total Photos: ${totalFiles} images across ${sqlStatements.length} tuskers`,
    '-- =====================================================================\n',
    ...sqlStatements,
    '\n'
  ].join('\n');

  fs.writeFileSync(sqlFile, fileContent, 'utf8');

  console.log(`\n========================================`);
  console.log(`Total images processed: ${totalFiles}`);
  console.log(`Successfully uploaded: ${totalUploaded}`);
  console.log(`SQL statements generated: ${sqlStatements.length}`);
  console.log(`Saved Migration to: ${sqlFile}`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
