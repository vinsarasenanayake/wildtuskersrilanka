/**
 * @file riskFramework.js
 * @description Multi-factorial risk evaluation framework and score resolver for wild tuskers.
 */

import riskData from '../data/tuskerRiskScores.json';

export const RISK_BANDS = [
  {
    key: 'VERY_LOW',
    label: 'Very Low Risk',
    shortLabel: 'Very Low',
    min: 0,
    max: 20,
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    darkBg: 'rgba(16, 185, 129, 0.12)',
    darkBorder: 'rgba(16, 185, 129, 0.35)',
    darkText: '#34d399',
    posture: 'Baseline Monitoring',
    actionText: 'Confirm identity and baseline record. Routine patrol observations.',
  },
  {
    key: 'LOW',
    label: 'Low Risk',
    shortLabel: 'Low',
    min: 20,
    max: 40,
    color: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#166534',
    darkBg: 'rgba(34, 197, 94, 0.12)',
    darkBorder: 'rgba(34, 197, 94, 0.35)',
    darkText: '#4ade80',
    posture: 'Routine Monitoring',
    actionText: 'Routine patrol observations; update records when material changes occur.',
  },
  {
    key: 'MEDIUM',
    label: 'Medium Risk',
    shortLabel: 'Medium',
    min: 40,
    max: 60,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#92400e',
    darkBg: 'rgba(245, 158, 11, 0.12)',
    darkBorder: 'rgba(245, 158, 11, 0.35)',
    darkText: '#fbbf24',
    posture: 'Enhanced Observation',
    actionText: 'Increase observation frequency. Verify roaming range, settlement contact, and recent conflict history.',
  },
  {
    key: 'HIGH',
    label: 'High Risk',
    shortLabel: 'High',
    min: 60,
    max: 80,
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#9a3412',
    darkBg: 'rgba(249, 115, 22, 0.14)',
    darkBorder: 'rgba(249, 115, 22, 0.4)',
    darkText: '#fb923c',
    posture: 'Targeted Management',
    actionText: 'Create a targeted action plan. Assign monitoring officers; coordinate conflict mitigation and veterinary review.',
  },
  {
    key: 'CRITICAL',
    label: 'Critical Risk',
    shortLabel: 'Critical',
    min: 80,
    max: 100,
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    textColor: '#991b1b',
    darkBg: 'rgba(239, 68, 68, 0.16)',
    darkBorder: 'rgba(239, 68, 68, 0.45)',
    darkText: '#f87171',
    posture: 'Immediate Multidisciplinary Review',
    actionText: 'Rapid field verification; agree on protective and public-safety measures with documented authority.',
  },
];

export const FRAMEWORK_DIMENSIONS = [
  {
    key: 'specimenRarity',
    name: 'Specimen Rarity',
    weight: 30,
    max: 7,
    unit: '30%',
    description: 'Conservation value, genetic significance, and morphological tusk rarity.',
  },
  {
    key: 'behaviourRisk',
    name: 'Behaviour Risk',
    weight: 25,
    max: 7,
    unit: '25%',
    description: 'Observed temperament, crop-raiding tendency, and conflict propensity.',
  },
  {
    key: 'settlementOverlap',
    name: 'Settlement Overlap',
    weight: 20,
    max: 6,
    unit: '20%',
    description: 'Frequency of movement across human habitations, farming lands, and roadways.',
  },
  {
    key: 'conflictIntensity',
    name: 'Conflict Intensity',
    weight: 15,
    max: 6,
    unit: '15%',
    description: 'Historical severity and recurrence of Human-Elephant Conflict (HEC).',
  },
  {
    key: 'sightingRisk',
    name: 'Sighting Frequency Risk',
    weight: 10,
    max: 6,
    unit: '10%',
    description: 'Observability & uncertainty index (reversed: fewer sightings = higher monitoring gaps).',
  },
];

export function getRiskBand(score) {
  const num = typeof score === 'number' ? score : parseFloat(score);
  if (isNaN(num)) return null;
  if (num <= 20) return RISK_BANDS[0];
  if (num <= 40) return RISK_BANDS[1];
  if (num <= 60) return RISK_BANDS[2];
  if (num <= 80) return RISK_BANDS[3];
  return RISK_BANDS[4];
}

export function getTuskerRiskData(tuskerId) {
  if (!tuskerId) return null;
  const id = String(tuskerId).trim().toUpperCase();
  return riskData[id] || null;
}
