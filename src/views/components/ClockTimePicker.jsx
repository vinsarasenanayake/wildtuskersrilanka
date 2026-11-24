/**
 * @file ClockTimePicker.jsx
 * @description Dropdown time selector with 5-minute intervals.
 * Features 3 dropdown controls (12 Hours, 5-minute interval Minutes, AM/PM),
 * instant "Now" preset, clear option, and future-time restriction with explicit reason.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Clock, ChevronDown, RotateCcw, X, AlertCircle } from 'lucide-react';
import { todayLocalISO, currentTimeHHMM, formatDisplayTime } from '../../utils/localDate';

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_5M = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PERIODS = ['AM', 'PM'];

/**
 * Format 24-hr "HH:mm" string into 12-hr { hours: 1-12, minutes: 0-55, period: 'AM'|'PM' }
 */
function parseTime5M(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    const now = new Date();
    let h = now.getHours();
    // Round down to current 5-min interval so current time is never in the future
    let m = Math.floor(now.getMinutes() / 5) * 5;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hours: h, minutes: m, period, isSet: false };
  }
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10) || 0;
    let m = parseInt(parts[1], 10) || 0;
    // Snap down to 5m slot
    m = Math.min(55, Math.max(0, Math.floor(m / 5) * 5));
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hours: h, minutes: m, period, isSet: true };
  }
  return { hours: 12, minutes: 0, period: 'AM', isSet: false };
}

/**
 * Convert 12-hr { hours, minutes, period } to 24-hr "HH:mm"
 */
function to24HourStr(hours, minutes, period) {
  let h = Number(hours) % 12;
  if (period === 'PM') h += 12;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(minutes)}`;
}

export default function ClockTimePicker({
  value,
  onChange,
  selectedDate,
  allowFuture = false,
  required = false,
  placeholder = 'Select time',
  name = 'time',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parsed internal components
  const parsed = useMemo(() => parseTime5M(value), [value]);
  const [tempHours, setTempHours] = useState(parsed.hours);
  const [tempMinutes, setTempMinutes] = useState(parsed.minutes);
  const [tempPeriod, setTempPeriod] = useState(parsed.period);

  // Sync internal state when value or open status changes
  useEffect(() => {
    if (isOpen) {
      setTempHours(parsed.hours);
      setTempMinutes(parsed.minutes);
      setTempPeriod(parsed.period);
    }
  }, [isOpen, parsed]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen]);

  // Check if a 24-hr time is in the future for today's date
  const isTimeFuture = useCallback((val24) => {
    if (allowFuture) return false;
    if (!selectedDate) return false;
    const today = todayLocalISO();
    if (selectedDate < today) return false;
    if (selectedDate > today) return true;
    const now24 = currentTimeHHMM();
    return val24 > now24;
  }, [selectedDate, allowFuture]);

  // Check if current temporary selection is in the future
  const currentTemp24 = to24HourStr(tempHours, tempMinutes, tempPeriod);
  const isCurrentTempFuture = isTimeFuture(currentTemp24);

  // Quick preset: Current time rounded down to nearest 5 minutes
  const handleSetNow = () => {
    const now = new Date();
    let h = now.getHours();
    let m = Math.floor(now.getMinutes() / 5) * 5;
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    setTempHours(h);
    setTempMinutes(m);
    setTempPeriod(p);

    const val24 = to24HourStr(h, m, p);
    if (!isTimeFuture(val24) && onChange) {
      onChange({ target: { name, value: val24 } });
      setIsOpen(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (isCurrentTempFuture) return;
    if (onChange) {
      onChange({ target: { name, value: currentTemp24 } });
    }
    setIsOpen(false);
  };

  // Current display text for trigger button
  const currentDisplay = formatDisplayTime(value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button that looks like a clean form input */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={className || `w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all flex items-center justify-between text-left hover:border-accent hover:bg-white focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 cursor-pointer ${isOpen ? 'border-[#0b2518] bg-white ring-2 ring-[#0b2518]/10' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'text-[#111111] font-semibold' : 'text-[#9ca3af]'}>
          {currentDisplay || placeholder}
        </span>
        <div className="flex items-center gap-1.5 text-[#6b7280]">
          <Clock size={16} />
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0b2518]' : ''}`}
          />
        </div>
      </button>

      {/* Hidden input for native form validation */}
      <input
        type="text"
        name={name}
        value={value || ''}
        required={required}
        readOnly
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 w-full min-w-[280px] sm:min-w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-scale-in"
          style={{ transformOrigin: 'top left' }}
        >
          {/* 3-Part Dropdown Row: Hour (1-12), Minute (5-min gaps), AM/PM */}
          <div className="p-3.5 bg-[#f8faf9] border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-bold text-[#55695f] uppercase tracking-wider">
                Select Time (5-Min Gaps)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 border-none bg-transparent cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Time Preview Header */}
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="font-sans text-2xl font-extrabold px-3 py-1 rounded-lg bg-[#0b2518] text-white shadow-xs tabular-nums">
                {String(tempHours).padStart(2, '0')}
              </div>
              <span className="font-sans text-2xl font-bold text-[#888888] select-none">:</span>
              <div className="font-sans text-2xl font-extrabold px-3 py-1 rounded-lg bg-[#0b2518] text-white shadow-xs tabular-nums">
                {String(tempMinutes).padStart(2, '0')}
              </div>
              <div className="font-sans text-base font-bold px-2.5 py-1.5 rounded-lg bg-[#eef3f0] text-[#0b2518] border border-[#d2dfd8]">
                {tempPeriod}
              </div>
            </div>

            {/* 3 Dropdown Selects */}
            <div className="grid grid-cols-3 gap-2">
              {/* Hour Dropdown (1-12) */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.68rem] font-bold text-gray-600 uppercase">
                  Hour
                </label>
                <select
                  value={tempHours}
                  onChange={(e) => setTempHours(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2 text-xs sm:text-sm font-bold text-[#0b2518] outline-none focus:border-[#0b2518] focus:ring-1 focus:ring-[#0b2518] cursor-pointer"
                >
                  {HOURS_12.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Dropdown (5-min intervals: 00, 05, 10 ... 55) */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.68rem] font-bold text-gray-600 uppercase">
                  Minute (:5m)
                </label>
                <select
                  value={tempMinutes}
                  onChange={(e) => setTempMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2 text-xs sm:text-sm font-bold text-[#0b2518] outline-none focus:border-[#0b2518] focus:ring-1 focus:ring-[#0b2518] cursor-pointer"
                >
                  {MINUTES_5M.map((m) => (
                    <option key={m} value={m}>
                      :{String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.68rem] font-bold text-gray-600 uppercase">
                  AM / PM
                </label>
                <select
                  value={tempPeriod}
                  onChange={(e) => setTempPeriod(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-2 text-xs sm:text-sm font-bold text-[#0b2518] outline-none focus:border-[#0b2518] focus:ring-1 focus:ring-[#0b2518] cursor-pointer"
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Future Warning with explicit reason text as requested */}
          {isCurrentTempFuture && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-sans flex items-start gap-2 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
              <span>
                Selected time ({formatDisplayTime(currentTemp24)}) is in the future. Observations cannot be recorded for future times today.
              </span>
            </div>
          )}

          {/* Bottom Actions Bar (Current Time / Done) */}
          <div className="p-3 bg-white flex items-center justify-between">
            <button
              type="button"
              onClick={handleSetNow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2518] bg-[#f0f5f2] hover:bg-[#e3ede6] px-3 py-1.5 rounded-lg border border-[#c8d9cf] transition-all cursor-pointer shadow-xs active:scale-95"
              title="Set to current local time rounded to nearest 5 minutes"
            >
              <RotateCcw size={12} />
              <span>Current Time</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isCurrentTempFuture}
              className={`text-xs font-bold text-white px-4 py-2 rounded-lg border-none transition-all shadow-xs ${
                isCurrentTempFuture
                  ? 'opacity-40 cursor-not-allowed bg-gray-400'
                  : 'bg-[#0b2518] hover:bg-[#16402b] cursor-pointer active:scale-95'
              }`}
              title={isCurrentTempFuture ? 'Cannot select a future time for today' : 'Apply time'}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
