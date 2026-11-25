/**
 * @file DistrictMultiSelect.jsx
 * @description Searchable multi-district selector supporting single or multiple
 * Sri Lankan administrative districts with modern tag chips, quick removal,
 * and automatic province derivation.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, X, Check, ChevronDown, Search, Plus } from 'lucide-react';
import { DISTRICTS } from '../../models/TuskerModel';
import { parseDistricts, getProvincesForDistricts } from '../../utils/districtUtils';

export default function DistrictMultiSelect({
  name = 'district',
  value = '',
  onChange,
  onProvincesChange,
  placeholder = 'Search & select administrative districts (e.g. Hambantota, Monaragala)...',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedDistricts = useMemo(() => {
    return parseDistricts(value);
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitChange = (nextList) => {
    const formatted = nextList.join(' / ');
    if (onChange) {
      onChange({ target: { name, value: formatted } });
    }
    if (onProvincesChange) {
      const derivedProvinces = getProvincesForDistricts(nextList);
      onProvincesChange(derivedProvinces);
    }
  };

  const handleToggleDistrict = (district) => {
    let next;
    if (selectedDistricts.includes(district)) {
      next = selectedDistricts.filter(d => d !== district);
    } else {
      next = [...selectedDistricts, district];
    }
    emitChange(next);
  };

  const handleRemoveDistrict = (district, e) => {
    e.stopPropagation();
    const next = selectedDistricts.filter(d => d !== district);
    emitChange(next);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    emitChange([]);
  };

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DISTRICTS;
    return DISTRICTS.filter(d => d.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Selected tags container / Input area */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }
          }
        }}
        className="w-full min-h-[48px] bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2 flex flex-wrap items-center gap-2 cursor-pointer hover:border-[#d0d0d0] focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12 transition-all select-none"
      >
        {selectedDistricts.length === 0 ? (
          <div className="flex items-center gap-2 text-[#999999] font-sans text-[0.88rem] py-1">
            <MapPin size={15} className="text-[#aaaaaa] shrink-0" />
            <span>{placeholder}</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 w-full py-0.5">
            {selectedDistricts.map((dist) => (
              <span
                key={dist}
                className="inline-flex items-center gap-1.5 bg-white border border-[#d1ded7] text-[#0b2518] px-3 py-1 rounded-full text-xs font-semibold shadow-2xs hover:border-accent transition-colors"
              >
                <MapPin size={11} className="text-accent shrink-0" />
                <span>{dist}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDistrict(dist, e)}
                    className="w-4 h-4 rounded-full bg-[#f0f0f0] hover:bg-rose-100 hover:text-rose-600 text-[#777777] inline-flex items-center justify-center border-none cursor-pointer p-0 ml-0.5 transition-colors"
                    aria-label={`Remove ${dist}`}
                    title={`Remove ${dist}`}
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}

            {/* Quick add trigger button */}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="inline-flex items-center gap-1 text-[0.76rem] font-semibold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-2.5 py-1 rounded-full border border-accent/25 transition-all cursor-pointer"
              >
                <Plus size={11} />
                <span>Add district</span>
              </button>
            )}

            {/* Clear All button if multiple */}
            {!disabled && selectedDistricts.length > 1 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="ml-auto text-[0.72rem] font-medium text-[#888888] hover:text-rose-600 bg-transparent border-none cursor-pointer px-1 py-0.5 transition-colors"
                title="Clear all selected districts"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {selectedDistricts.length === 0 && (
          <div className="ml-auto pl-2 text-[#888888] flex items-center pointer-events-none">
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8e0] rounded-[12px] shadow-xl z-50 overflow-hidden animate-fade-in max-h-[320px] flex flex-col">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-[#eeeeee] bg-[#fafaf8] shrink-0">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-[#888888]" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Sri Lankan districts (e.g. Hambantota, Monaragala)..."
                className="w-full pl-8 pr-7 py-2 text-xs sm:text-[0.85rem] bg-white border border-[#e0e0e0] rounded-[8px] outline-none focus:border-accent"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearch('');
                  }}
                  className="absolute right-2 text-[#888888] hover:text-[#222222] bg-transparent border-none p-0 cursor-pointer"
                  aria-label="Clear district search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {selectedDistricts.length > 0 && (
              <div className="flex items-center justify-between text-[0.72rem] text-[#666666] px-1 pt-1.5 font-sans">
                <span>{selectedDistricts.length} district{selectedDistricts.length > 1 ? 's' : ''} currently selected</span>
                <span className="text-emerald-700 font-semibold">{getProvincesForDistricts(selectedDistricts)}</span>
              </div>
            )}
          </div>

          {/* District list items */}
          <div className="overflow-y-auto p-1.5 flex flex-col gap-0.5">
            {filteredDistricts.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#888888]">
                No districts matching "{search}"
              </div>
            ) : (
              filteredDistricts.map((d) => {
                const isSelected = selectedDistricts.includes(d);
                const province = DISTRICT_TO_PROVINCE_MAP[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDistrict(d);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-left text-xs sm:text-[0.86rem] font-medium transition-colors cursor-pointer border-none ${
                      isSelected
                        ? 'bg-accent/12 text-primary font-semibold'
                        : 'bg-transparent text-[#333333] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-accent border-accent text-white' : 'border-[#cccccc] bg-white'
                      }`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span>{d}</span>
                    </div>
                    {province && (
                      <span className="text-[0.72rem] px-2 py-0.5 rounded-full bg-gray-100 text-[#666666] font-normal">
                        {province}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
