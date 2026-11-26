/**
 * @file TuskerMultiSelect.jsx
 * @description Searchable multi-tusker selection dropdown supporting single or multiple
 * tusker associations with natural text joiners ('&', 'vs', ',').
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Plus, Check, ChevronDown } from 'lucide-react';
import { getTuskers } from '../../models/TuskerModel';

/**
 * Reusable Searchable Multi-Tusker Dropdown Selector
 *
 * @param {Array|string} value - Selected tusker objects, IDs, or comma/connector separated string
 * @param {Function} onChange - (selectedTuskers: Array<{id, name, location}>, formattedString: string) => void
 * @param {string} [label] - Label text
 * @param {string} [placeholder] - Search placeholder text
 * @param {boolean} [required] - Whether field is required
 * @param {boolean} [allowConnector] - Whether to show comparison connectors ('vs' / '&')
 * @param {string} [connector] - 'vs' | '&' | ','
 * @param {Function} [onConnectorChange] - (newConnector: string) => void
 * @param {string} [helperText] - Small hint text below
 */
export default function TuskerMultiSelect({
  value,
  onChange,
  label = 'Tusker Name / ID',
  placeholder = 'Search by ID or name…',
  required = false,
  allowConnector = false,
  connector = 'vs',
  onConnectorChange,
  helperText,
}) {
  const [tuskersList, setTuskersList] = useState([]);
  const [selectedTuskers, setSelectedTuskers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch latest tuskers from Supabase if available
  useEffect(() => {
    let active = true;
    getTuskers()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setTuskersList(data);
        }
      })
      .catch((err) => {
        console.warn('[TuskerMultiSelect] Could not fetch tuskers:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync external `value` prop into selectedTuskers internal state
  useEffect(() => {
    if (!value || tuskersList.length === 0) {
      if (!value) setSelectedTuskers([]);
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0]?.id) {
        setSelectedTuskers(value);
      } else {
        // Array of IDs or strings
        const matched = value
          .map((v) => {
            const idMatch = String(v).match(/T\d+/i);
            const targetId = idMatch ? idMatch[0].toUpperCase() : String(v).trim().toUpperCase();
            return tuskersList.find((t) => t.id.toUpperCase() === targetId);
          })
          .filter(Boolean);
        setSelectedTuskers(matched);
      }
    } else if (typeof value === 'string' && value.trim()) {
      // String like "T180 - Skandaraja" or "T180 - Skandaraja, T056 - Revatha" or "T180 vs T056"
      const parts = value.split(/,|\s+vs\s+|\s+&\s+/i).map((s) => s.trim()).filter(Boolean);
      const matched = [];
      for (const part of parts) {
        const idMatch = part.match(/T\d+/i);
        if (idMatch) {
          const found = tuskersList.find((t) => t.id.toUpperCase() === idMatch[0].toUpperCase());
          if (found && !matched.some((m) => m.id === found.id)) matched.push(found);
        } else {
          const normPart = part.toLowerCase();
          const found = tuskersList.find((t) => t.name.toLowerCase() === normPart);
          if (found && !matched.some((m) => m.id === found.id)) matched.push(found);
        }
      }
      setSelectedTuskers(matched);
    }
  }, [value, tuskersList]);

  // Click & tap outside listener to close dropdown on both desktop and mobile touch devices
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Format the output string based on selected tuskers and connector
  const formatOutput = (tuskers, conn) => {
    if (!tuskers || tuskers.length === 0) return '';
    if (allowConnector) {
      return tuskers.map((t) => `${t.id} - ${t.name}`).join(` ${conn} `);
    }
    const names = tuskers.map((t) => `${t.id} - ${t.name}`);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
  };

  const handleSelectTusker = (tusker) => {
    if (selectedTuskers.some((t) => t.id === tusker.id)) return;
    const nextList = [...selectedTuskers, tusker];
    setSelectedTuskers(nextList);
    setSearchQuery('');
    setIsOpen(false); // Auto-close dropdown on selection
    if (searchInputRef.current) {
      searchInputRef.current.blur(); // Dismiss mobile keyboard
    }
    if (onChange) {
      onChange(nextList, formatOutput(nextList, connector));
    }
  };

  const handleRemoveTusker = (idToRemove) => {
    const nextList = selectedTuskers.filter((t) => t.id !== idToRemove);
    setSelectedTuskers(nextList);
    if (onChange) {
      onChange(nextList, formatOutput(nextList, connector));
    }
  };

  const handleToggleConnector = (newConn) => {
    if (onConnectorChange) {
      onConnectorChange(newConn);
    }
    if (onChange) {
      onChange(selectedTuskers, formatOutput(selectedTuskers, newConn));
    }
  };

  // Filtered tuskers based on search query
  const filteredTuskers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) {
      // Show top 12 initially
      return tuskersList.slice(0, 12);
    }

    const normQ = q.toUpperCase().replace(/^T0*/, 'T');

    return tuskersList
      .filter((t) => {
        const idLower = t.id.toLowerCase();
        const normId = (t.id || '').toUpperCase().replace(/^T0*/, 'T');
        const nameLower = t.name.toLowerCase();
        const locLower = (t.location || '').toLowerCase();
        const sinhalaLower = (t.sinhala || t.sinhalaName || '').toLowerCase();

        return (
          idLower.includes(q) ||
          normId === normQ ||
          normId.includes(normQ) ||
          nameLower.includes(q) ||
          sinhalaLower.includes(q) ||
          locLower.includes(q)
        );
      })
      .slice(0, 30);
  }, [tuskersList, searchQuery]);

  // Keep the search input & its dropdown comfortably in view inside scrollable modals on mobile
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (containerRef.current && window.innerWidth < 768) {
        containerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1.5 w-full scroll-mt-3" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center justify-between">
          <span>
            {label}
            {required ? (
              <span className="text-red-500"> *</span>
            ) : (
              <span className="font-normal text-[#999999] lowercase"> (optional)</span>
            )}
          </span>
          {selectedTuskers.length > 0 && (
            <span className="text-[11px] font-semibold text-accent normal-case">
              {selectedTuskers.length} selected
            </span>
          )}
        </label>
      )}

      {/* Selected Tusker Chips */}
      {selectedTuskers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#fbfcfb] border border-[#e4eae6] rounded-xl">
          {selectedTuskers.map((t, idx) => (
            <React.Fragment key={t.id}>
              {idx > 0 && allowConnector && (
                <div className="inline-flex items-center rounded-lg bg-[#eef3f0] border border-[#d6e0da] p-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleConnector('vs')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-md border-none cursor-pointer transition-colors ${
                      connector === 'vs'
                        ? 'bg-[#0b2518] text-white shadow-xs'
                        : 'bg-transparent text-[#666666] hover:text-[#111111]'
                    }`}
                    title="Compare tuskers (vs)"
                  >
                    vs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleConnector('&')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-md border-none cursor-pointer transition-colors ${
                      connector === '&'
                        ? 'bg-[#0b2518] text-white shadow-xs'
                        : 'bg-transparent text-[#666666] hover:text-[#111111]'
                    }`}
                    title="Group together (&)"
                  >
                    &amp;
                  </button>
                </div>
              )}
              {idx > 0 && !allowConnector && (
                <span className="text-xs text-[#999999] font-medium">+</span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#d1ded7] text-[#0b2518] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <span className="font-mono text-accent">{t.id}</span>
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTusker(t.id)}
                  className="w-4 h-4 rounded-full bg-[#f0f0f0] hover:bg-rose-100 hover:text-rose-600 text-[#777777] inline-flex items-center justify-center border-none cursor-pointer p-0 ml-0.5 transition-colors"
                  title="Remove tusker"
                >
                  <X size={10} />
                </button>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search Bar & Dropdown Input */}
      <div className="relative">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            className={`w-full bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg pl-9 ${
              isOpen || searchQuery ? 'pr-24' : 'pr-10'
            } py-2.5 outline-none focus:border-accent focus:bg-white text-sm text-[#111111] placeholder:text-[#999999] transition-all`}
            placeholder={
              selectedTuskers.length === 0
                ? placeholder
                : '+ Add another tusker…'
            }
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                if (!containerRef.current?.contains(document.activeElement)) {
                  setIsOpen(false);
                }
              }, 200);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                if (searchInputRef.current) searchInputRef.current.blur();
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#999999] hover:text-[#555555] p-1 border-none bg-transparent cursor-pointer rounded"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
            {isOpen ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (searchInputRef.current) searchInputRef.current.blur();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-sans text-xs font-bold border-none cursor-pointer transition-colors shadow-2xs"
                title="Close list"
                aria-label="Close list"
              >
                <span>Close</span>
                <X size={12} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(true);
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="text-[#888888] hover:text-[#111111] p-1.5 border-none bg-transparent cursor-pointer rounded flex items-center"
                title="Open menu"
                aria-label="Open menu"
              >
                <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Transparent Backdrop to close dropdown on tap outside */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/5 sm:hidden"
            onClick={() => {
              setIsOpen(false);
              if (searchInputRef.current) searchInputRef.current.blur();
            }}
            aria-hidden="true"
          />
        )}

        {/* Floating Search Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e5e7eb] rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-gray-100 animate-fade-in">
            {/* Mobile & Desktop Sticky Header with Explicit Done / Close Button */}
            <div className="sticky top-0 bg-[#f9fafb] border-b border-[#e5e7eb] px-3.5 py-1.5 flex items-center justify-between text-xs font-semibold text-[#555555] z-10 backdrop-blur-xs">
              <span className="text-[11px] text-[#666666]">
                {filteredTuskers.length} {filteredTuskers.length === 1 ? 'tusker' : 'tuskers'} found
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (searchInputRef.current) searchInputRef.current.blur();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0b2518] hover:bg-[#133824] text-white font-sans text-[11px] font-bold border-none cursor-pointer shadow-2xs transition-colors"
                title="Dismiss dropdown"
              >
                <span>Done</span>
                <X size={11} />
              </button>
            </div>
            {filteredTuskers.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#888888]">
                No matching tuskers found for "{searchQuery}".
              </div>
            ) : (
              filteredTuskers.map((tusker) => {
                const isSelected = selectedTuskers.some((t) => t.id === tusker.id);
                return (
                  <div
                    key={tusker.id}
                    onClick={() => {
                      if (!isSelected) handleSelectTusker(tusker);
                    }}
                    className={`p-2.5 px-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 text-emerald-900 pointer-events-none'
                        : 'hover:bg-[#f7faf8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {tusker.id}
                      </span>
                      <div className="truncate">
                        <span className="font-sans text-xs sm:text-sm font-semibold text-[#111111] block truncate">
                          {tusker.name}
                        </span>
                        {tusker.location && (
                          <span className="font-sans text-[11px] text-[#777777] block truncate">
                            {tusker.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check size={13} /> Selected
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5">
                          <Plus size={13} /> Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {/* Sticky Footer for Fast Dismiss on Long Lists */}
            <div className="sticky bottom-0 bg-[#f9fafb] border-t border-[#e5e7eb] p-2 flex items-center justify-center z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (searchInputRef.current) searchInputRef.current.blur();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Check size={13} className="text-emerald-600" />
                <span>Done / Close Suggestions</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {helperText && (
        <span className="text-[11px] text-[#888888]">{helperText}</span>
      )}
    </div>
  );
}
