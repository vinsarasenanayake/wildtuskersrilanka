import React from 'react';

/* ── Living status badge (Alive / No Recent Record / Deceased) ── */
const STATUS_STYLES = {
  'Alive':            'bg-[#e8f5ec] text-[#1f7a3d] border-[#bfe3cb]',
  'No Recent Record': 'bg-[#fff6e5] text-[#9a6200] border-[#f3dca9]',
  'Deceased':         'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]',
};

export default function StatusBadge({ status, deathYear, className = '' }) {
  if (!status) return null;
  const label = status === 'Deceased' && deathYear ? `Deceased · ${deathYear}` : status;
  return (
    <span className={`inline-flex items-center font-sans font-semibold rounded-full border whitespace-nowrap shrink-0 ${STATUS_STYLES[status] || ''} ${className}`}>
      {label}
    </span>
  );
}
