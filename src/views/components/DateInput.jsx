/**
 * @file DateInput.jsx
 * @description Date/time input wrapper that displays a clean placeholder and icon on iOS WebKit
 * browsers (where empty native date/time inputs render blank and ignore the placeholder attribute),
 * while leaving native desktop/Android date pickers untouched.
 */

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function DateInput({
  type = 'date',
  value = '',
  placeholder = 'DD / MM / YYYY',
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const isEmpty = !value;
  const Icon = type === 'time' ? Clock : Calendar;

  return (
    <div className={`relative w-full min-w-0 ${wrapperClassName}`}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className={`w-full min-w-0 max-w-full box-border ${className}`}
        {...props}
      />
      {isEmpty && (
        <span
          aria-hidden="true"
          className="ios-date-placeholder pointer-events-none absolute inset-y-0 left-3.5 right-3.5 items-center justify-between text-[#8c8c8c] text-base select-none"
        >
          <span className="truncate">{placeholder}</span>
          <Icon size={16} className="text-[#888888] shrink-0 ml-2" />
        </span>
      )}
    </div>
  );
}
