import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ysloiyecqryftybzcujh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HPMqQNUgV_xstztrDO8wuQ__ulTar6Z';
const BUCKET = 'wts-media';
const SOURCE_DIR = 'C:\\Users\\ASUS\\Downloads\\Tuskers';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAPPING = {
  // Confirmed ambiguous & variants
  'Suriya': { id: 'T311', name: 'Suriya' },
  'rudhraja': { id: 'T303', name: 'Rudraja' },
  'dhumarakka': { id: 'T308', name: 'Dumarakka' },
  'Jagathwijaya': { id: 'T309', name: 'Jagadvijaya' },
  'Dashakanta': { id: 'T313', name: 'Dasakantha' },
  'Parumaka': { id: 'T314', name: 'Parumuka' },
  'Devesurendra': { id: 'T284', name: 'Devasurendra' },
  'Mahasona': { id: 'T305', name: 'Mahasona (Dheera)' },
  'Walimmba': { id: 'T046', name: 'Walimba' },

  // 42 Exact matches
  'Anuraja': { id: 'T279', name: 'Anuraja' },
  'Arya': { id: 'T297', name: 'Arya' },
  'Bulatha': { id: 'T310', name: 'Bulatha' },
  'Chaddantha': { id: 'T319', name: 'Chaddantha' },
  'Dandanatha': { id: 'T294', name: 'Dandanatha' },
  'Dappula (Dala Kota)': { id: 'T315', name: 'Dappula (Dala Kota)' },
  'dharanindra': { id: 'T318', name: 'Dharanindra' },
  'Dheera': { id: 'T306', name: 'Dheera' },
  'Diksanda': { id: 'T183', name: 'Diksanda' },
  'Giriba': { id: 'T292', name: 'Giriba' },
  'girikanda': { id: 'T321', name: 'Girikanda' },
  'Girikula': { id: 'T307', name: 'Girikula' },
  'ilanaga': { id: 'T282', name: 'Ilanaga' },
  'Jayampathi': { id: 'T285', name: 'Jayampathi' },
  'kalasena': { id: 'T320', name: 'Kalasena' },
  'Kambili': { id: 'T312', name: 'Kambili' },
  'kaniraja': { id: 'T290', name: 'Kaniraja' },
  'keshara': { id: 'T124', name: 'Keshara' },
  'Kuwera': { id: 'T283', name: 'Kuwera' },
  'Lankeshwara': { id: 'T295', name: 'Lankeshwara' },
  'Madulu': { id: 'T298', name: 'Madulu' },
  'Mahosha': { id: 'T244', name: 'Mahosha' },
  'Meghadutha': { id: 'T323', name: 'Meghadutha' },
  'Nero': { id: 'T304', name: 'Nero' },
  'Prahastha': { id: 'T301', name: 'Prahastha' },
  'Prathapa': { id: 'T289', name: 'Prathapa' },
  'Pulina': { id: 'T302', name: 'Pulina' },
  'Rakhitha': { id: 'T277', name: 'Rakhitha' },
  'RanaDheera': { id: 'T276', name: 'RanaDheera' },
  'Rangha': { id: 'T316', name: 'Rangha' },
  'Sakkha': { id: 'T317', name: 'Sakkha' },
  'Sandagiri': { id: 'T296', name: 'Sandagiri' },
  'sesara': { id: 'T288', name: 'Sesara' },
  'Shakya': { id: 'T291', name: 'Shakya' },
  'Swasthika': { id: 'T278', name: 'Swasthika' },
  'Theja': { id: 'T322', name: 'Theja' },
  'Thulaththana': { id: 'T280', name: 'Thulaththana' },
  'Vanniyan': { id: 'T287', name: 'Vanniyan' },
  'VeeDhiya': { id: 'T293', name: 'VeeDhiya' },
  'Vibodhi': { id: 'T286', name: 'Vibodhi' },
  'Vishnu': { id: 'T299', name: 'Vishnu' },
  'Werambha': { id: 'T300', name: 'Werambha' }
};

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function main() {
  console.log('--- Starting Tusker Photo Upload & SQL Generation ---');

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

    if (!match) continue;

    const { id: tId, name: tName } = match;
    const folderPath = path.join(SOURCE_DIR, folderName);
    const files = fs.readdirSync(folderPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) continue;

    // Natural sort
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const photoUrls = [];

    console.log(`\nProcessing ${folderName} -> [${tId} ${tName}] (${files.length} images)...`);

    for (const file of files) {
      totalFiles++;
      const ext = path.extname(file).toLowerCase();
      const filePath = path.join(folderPath, file);
      const storageKey = `tuskers/${file}`;
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
        console.error(`  [UPLOAD STATUS] ${uploadError.message}`);
      } else {
        totalUploaded++;
        console.log(`  [UPLOAD OK] ${storageKey}`);
      }
    }

    if (photoUrls.length > 0) {
      const formattedArray = photoUrls.map(u => `'${u}'`).join(', ');
      const sql = `update public.tuskers set photos = array[${formattedArray}] where id = '${tId}';`;
      sqlStatements.push(sql);

      // Directly update tuskers.photos in Supabase database
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

  // Write SQL migration script with all 51 tuskers mapped
  const sqlFile = path.resolve('supabase/migrations/20261118020000_seed_tusker_album_photos.sql');
  const fileContent = [
    '-- =====================================================================',
    '-- Migration: Seed Tusker Album Photos (Batch 1 - 51 Identified Tuskers)',
    `-- Generated on ${new Date().toISOString()}`,
    `-- Total Photos: ${totalFiles} images across ${sqlStatements.length} tuskers`,
    '-- =====================================================================\n',
    ...sqlStatements,
    '\n'
  ].join('\n');

  fs.writeFileSync(sqlFile, fileContent, 'utf8');
  console.log(`\n========================================`);
  console.log(`Total images scanned: ${totalFiles}`);
  console.log(`Successfully uploaded: ${totalUploaded}`);
  console.log(`SQL statements generated: ${sqlStatements.length}`);
  console.log(`Saved Migration to: ${sqlFile}`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
