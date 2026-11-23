import React from 'react';
import wtsLogo from '../../assets/images/wtslogo.png';

/**
 * PhotoWatermarkBadge
 * Standardized Wild Tuskers Sri Lanka watermark overlay for wildlife photographs.
 * Displays only the brand logo with drop-shadow for maximum legibility across photos.
 */
export default function PhotoWatermarkBadge({ className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-5.5 sm:h-6.5 landscape:h-5',
    md: 'h-11 sm:h-11.5 landscape:h-7.5',
    lg: 'h-13 sm:h-14 landscape:h-9',
  }[size] || 'h-11 sm:h-11.5 landscape:h-7.5';

  return (
    <div
      className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <img
        src={wtsLogo}
        alt="Wild Tuskers Sri Lanka"
        className={`${sizeClasses} w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]`}
        draggable={false}
      />
    </div>
  );
}
