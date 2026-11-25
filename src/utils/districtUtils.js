/**
 * @file districtUtils.js
 * @description Utility functions for normalizing, parsing, and deriving provinces for Sri Lankan districts.
 */

import { DISTRICT_TO_PROVINCE_MAP } from '../models/TuskerModel';

export function normalizeDistrictName(name) {
  if (!name) return '';
  const s = String(name).trim();
  const low = s.toLowerCase();
  if (low.includes('hamban')) return 'Hambantota';
  if (low.includes('ratna') || low.includes('rathna')) return 'Ratnapura';
  if (low.includes('battic') || low.includes('batic')) return 'Batticaloa';
  if (low.includes('nuwara')) return 'Nuwara Eliya';
  if (low.includes('polon')) return 'Polonnaruwa';
  if (low.includes('anuradh')) return 'Anuradhapura';
  if (low.includes('kurun')) return 'Kurunegala';
  if (low.includes('puttal')) return 'Puttalam';
  if (low.includes('monar')) return 'Monaragala';
  if (low.includes('ampar')) return 'Ampara';
  if (low.includes('trinco')) return 'Trincomalee';
  if (low.includes('vavun')) return 'Vavuniya';
  if (low.includes('mannar')) return 'Mannar';
  if (low.includes('mullai')) return 'Mullaitivu';
  if (low.includes('matale')) return 'Matale';
  if (low.includes('matara')) return 'Matara';
  if (low.includes('badulla')) return 'Badulla';
  if (low.includes('kandy')) return 'Kandy';
  if (low.includes('kegall')) return 'Kegalle';
  return s;
}

export function parseDistricts(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(normalizeDistrictName).filter(Boolean);
  return String(val)
    .split(/[/,;]/)
    .map(s => normalizeDistrictName(s.trim()))
    .filter(Boolean);
}

export function getProvincesForDistricts(districtsList) {
  const provs = new Set();
  districtsList.forEach(d => {
    const prov = DISTRICT_TO_PROVINCE_MAP[d];
    if (prov) provs.add(prov);
  });
  return Array.from(provs).join(' / ');
}
