/**
 * @file useTusker.js
 * @description Master controller hooks for wild tuskers directory search, filtering,
 * individual profile data loading, sightings management, and admin forms.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getTuskers,
  getCachedTuskers,
  getTuskerById,
  tuskerExists,
  addTusker,
  updateTusker,
  addSightingToTusker,
  getTuskerComparison,
  getTuskerEarComparison,
  compareTuskerId,
  DISTRICTS,
} from '../models/TuskerModel';
import { useAuth } from './useAuth';
import { getLocationCoordinates } from '../utils/sriLankaLocations';
import { todayLocalISO } from '../utils/localDate';
import { getLocationDistricts, isLocationInDistrict } from '../utils/locationDistricts';

export const normalizeDistrict = (name) => {
  if (!name) return '';
  const s = String(name).trim();
  const low = s.toLowerCase();
  if (low.includes('hamban')) return 'Hambantota';
  if (low.includes('ratna') || low.includes('rathna')) return 'Ratnapura';
  if (low.includes('battic')) return 'Batticaloa';
  if (low.includes('nuwara')) return 'Nuwara Eliya';
  return s;
};

const splitAreasBasic = (loc) => {
  if (!loc || loc === 'null') return [];
  return String(loc)
    .split(/[/,;]/)
    .map(a => a.replace(/\(.*?\)/g, '').trim())
    .filter(Boolean);
};

export const getTuskerDistricts = (t) => {
  if (!t) return [];
  const set = new Set();
  if (t.district) {
    String(t.district)
      .split(/[/,;]/)
      .map(d => normalizeDistrict(d.trim()))
      .filter(Boolean)
      .forEach(d => set.add(d));
  }
  // Also infer from mapped locations
  const areas = [t.location, t.lastSeenArea].filter(Boolean);
  areas.forEach(raw => {
    splitAreasBasic(raw).forEach(a => {
      getLocationDistricts(a).forEach(d => set.add(d));
    });
  });
  return Array.from(set);
};

export const tuskerIsInDistrict = (t, districtName) => {
  if (!districtName) return true;
  const targetNorm = normalizeDistrict(districtName).toLowerCase();
  const districts = getTuskerDistricts(t).map(d => d.toLowerCase());
  return districts.includes(targetNorm);
};

/* ==============================================================
   SECTION 1: WILD TUSKERS DIRECTORY & SEARCH CONTROLLER
============================================================== */
export const canonicalLocationName = (name) => {
  if (!name) return '';
  const s = String(name).trim();
  const low = s.toLowerCase();
  if (low === 'horowpothana' || low === 'horowpathana') return 'Horowpathana';
  if (low === 'kalawewa' || low === 'kala wewa') return 'Kala Wewa';
  if (low === 'eluwankulam' || low === 'eluwankulama') return 'Eluwankulam';
  if (low === 'tabbowa' || low === 'thabbowa') return 'Thabbowa';
  if (low === 'tirappane' || low === 'thirappane') return 'Thirappane';
  if (low === 'tantirimale' || low === 'thanthirimale') return 'Thanthirimale';
  if (low === 'hambanthota' || low === 'hambantota') return 'Hambantota';
  if (low === 'rathnapura' || low === 'ratnapura') return 'Ratnapura';
  if (low === 'galoya' || low === 'gal oya') return 'Gal Oya';
  if (low === 'maha kanadarawa' || low === 'kanadarawa') return 'Maha Kanadarawa';
  return s;
};

// Whole-name check: a tusker is in an area only when one of its listed
// places IS that area (not merely contains the same letters, so "Madu"
// no longer matches "Maduru Oya" and "Yala Block 3" no longer matches
// every Yala tusker). "Yala" still includes its numbered blocks.
const sameArea = (aLow, targetLower) => {
  if (aLow === targetLower) return true;
  const cA = canonicalLocationName(aLow).toLowerCase();
  const cT = canonicalLocationName(targetLower).toLowerCase();
  if (cA === cT) return true;
  if (aLow === targetLower + 'a' || targetLower === aLow + 'a') return true;
  if (aLow.startsWith('yala block') && targetLower.startsWith('block') && aLow.endsWith(targetLower)) return true;
  if (targetLower.startsWith('yala block') && aLow.startsWith('block') && targetLower.endsWith(aLow)) return true;
  if (targetLower === 'yala' && aLow.startsWith('yala block')) return true;
  if (aLow === 'maha kanadarawa' && targetLower === 'kanadarawa') return true;
  if (targetLower === 'maha kanadarawa' && aLow === 'kanadarawa') return true;
  if (aLow === 'horowpathana' && targetLower === 'horopathana ehg') return true;
  if (targetLower === 'horowpathana' && aLow === 'horopathana ehg') return true;
  return false;
};

export function useTuskerList() {
  const initialCache = getCachedTuskers();
  const [tuskers, setTuskers] = useState(() => initialCache || []);
  const [loading, setLoading] = useState(() => !initialCache);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    getTuskers()
      .then(list => { if (active) setTuskers(list); })
      .catch(err => { if (active && !initialCache) setLoadError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialCache]);

  // Roaming areas and last-seen locations are often combined corridors
  // (e.g. "Anuradhapura / Maha Kanadarawa / Kebithigollewa / Thanthirimale")
  // or list multiple park blocks ("Yala Block 3,5"), so expand blocks and
  // split them into discrete individual locations for filtering.
  const splitAreas = (loc) => {
    if (!loc || loc === 'null') return [];
    const expanded = String(loc).replace(
      /(\b(?:Yala\s+)?Block\s+)(\d+)(?:\s*,\s*(\d+))+/gi,
      (match, prefix) => {
        const nums = match.match(/\d+/g) || [];
        return nums.map(n => prefix.trim() + ' ' + n).join(' / ');
      }
    );
    return expanded
      .split(/[/,;]/)
      .map((a) => a.replace(/\(.*?\)/g, '').trim())
      .filter((a) => Boolean(a) && !/^\d+$/.test(a));
  };

  // 1. Pre-index each tusker's separated areas once when dataset updates
  const tuskerAreasMap = useMemo(() => {
    const map = new Map();
    tuskers.forEach(t => {
      const areas = [
        ...splitAreas(t.location),
        ...splitAreas(t.lastSeenArea),
      ].map(a => a.toLowerCase().trim());
      map.set(t.id, areas);
    });
    return map;
  }, [tuskers]);

  // partial = true while the visitor is still typing (e.g. "Thab"), so any
  // place name containing the typed letters matches.
  const tuskerRoamsIn = useCallback((t, area, partial = false) => {
    if (!area) return true;
    const targetLower = area.toLowerCase().trim();
    if (!targetLower) return true;
    const areas = tuskerAreasMap.get(t.id) || [
      ...splitAreas(t.location),
      ...splitAreas(t.lastSeenArea),
    ].map(a => a.toLowerCase().trim());

    return areas.some(aLow => sameArea(aLow, targetLower) || (partial && aLow.includes(targetLower)));
  }, [tuskerAreasMap]);

  // Pre-aggregate distinct locations, compute counts, and pre-sort once per dataset change
  const { allLocations, locationCounts } = useMemo(() => {
    const byKey = new Map();
    tuskers.forEach(t => {
      splitAreas(t.location).forEach(raw => {
        const a = canonicalLocationName(raw);
        const k = a.toLowerCase().trim();
        if (!byKey.has(k) || (/^[A-Z]/.test(a) && !/^[A-Z]/.test(byKey.get(k)))) byKey.set(k, a);
      });
      splitAreas(t.lastSeenArea).forEach(raw => {
        const a = canonicalLocationName(raw);
        const k = a.toLowerCase().trim();
        if (!byKey.has(k) || (/^[A-Z]/.test(a) && !/^[A-Z]/.test(byKey.get(k)))) byKey.set(k, a);
      });
    });

    const counts = new Map();
    byKey.forEach((label, k) => {
      let count = 0;
      for (const t of tuskers) {
        if (tuskerRoamsIn(t, k)) count++;
      }
      counts.set(k, count);
    });

    const sorted = [...byKey.values()].sort((a, b) => {
      const countA = counts.get(a.toLowerCase().trim()) || 0;
      const countB = counts.get(b.toLowerCase().trim()) || 0;
      if (countA > 0 && countB === 0) return -1;
      if (countB > 0 && countA === 0) return 1;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });

    return { allLocations: sorted, locationCounts: counts };
  }, [tuskers, tuskerRoamsIn]);

  // O(1) instant count lookup
  const countInArea = useCallback(
    (area) => {
      if (!area) return 0;
      return locationCounts.get(area.toLowerCase().trim()) || 0;
    },
    [locationCounts]
  );

  const statusCounts = useMemo(() => {
    const counts = { ALL: tuskers.length };
    tuskers.forEach(t => {
      const k = t.livingStatus || 'Unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [tuskers]);

  const [nameQuery, setNameQuery] = useState(() => {
    try { return sessionStorage.getItem('wts_nameQuery') || ''; } catch { return ''; }
  });
  const [nameSuggestions, setNameSugg] = useState([]);
  const [showNameSugg, setShowNameSugg] = useState(false);

  const [statusFilter, setStatusFilter] = useState(() => {
    try { return sessionStorage.getItem('wts_statusFilter') || 'ALL'; } catch { return 'ALL'; }
  });
  const [sortOrder, setSortOrder] = useState(() => {
    try {
      sessionStorage.removeItem('wts_sortOrder');
      return sessionStorage.getItem('wts_sortOrder_v2') || 'ID_DESC';
    } catch {
      return 'ID_DESC';
    }
  });
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedDistrict') || ''; } catch { return ''; }
  });
  const [districtQuery, setDistrictQuery] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedDistrict') || ''; } catch { return ''; }
  });
  const [showDistrictDrop, setShowDistrictDrop] = useState(false);

  const districtCounts = useMemo(() => {
    const counts = new Map();
    DISTRICTS.forEach(dist => {
      let count = 0;
      for (const t of tuskers) {
        if (tuskerIsInDistrict(t, dist)) count++;
      }
      counts.set(dist, count);
    });
    return counts;
  }, [tuskers]);

  const countInDistrict = useCallback((dist) => {
    if (!dist) return 0;
    return districtCounts.get(normalizeDistrict(dist)) || 0;
  }, [districtCounts]);

  const districtSuggestions = useMemo(() => {
    const q = (districtQuery || '').trim().toLowerCase();
    const isBrowsingAll = !q || (selectedDistrict && q === selectedDistrict.toLowerCase().trim());
    if (isBrowsingAll) return DISTRICTS;
    return DISTRICTS.filter(d => d.toLowerCase().includes(q));
  }, [districtQuery, selectedDistrict]);

  // Valid locations for the currently selected district
  const validLocationsForDistrict = useMemo(() => {
    if (!selectedDistrict) return allLocations;
    return allLocations.filter(loc => isLocationInDistrict(loc, selectedDistrict));
  }, [selectedDistrict, allLocations]);

  const [selectedLocation, setSelectedLoc] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedLoc') || ''; } catch { return ''; }
  });
  const [locationQuery, setLocationQuery] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedLoc') || ''; } catch { return ''; }
  });
  const [showLocDrop, setShowLocDrop] = useState(false);

  // Instant single-pass substring filter on district-scoped pool
  const locSuggestions = useMemo(() => {
    const pool = validLocationsForDistrict;
    const q = (locationQuery || '').trim().toLowerCase();
    const isBrowsingAll = !q || (selectedLocation && q === selectedLocation.toLowerCase().trim());
    if (isBrowsingAll) return pool;
    return pool.filter(loc => loc.toLowerCase().includes(q));
  }, [validLocationsForDistrict, locationQuery, selectedLocation]);

  /* ── Persist Filter & Sort State across Navigation & Reload ── */
  useEffect(() => {
    try {
      if (selectedDistrict) {
        sessionStorage.setItem('wts_selectedDistrict', selectedDistrict);
      } else {
        sessionStorage.removeItem('wts_selectedDistrict');
      }
    } catch { /* ignore */ }
  }, [selectedDistrict]);
  useEffect(() => {
    try {
      if (sortOrder) sessionStorage.setItem('wts_sortOrder_v2', sortOrder);
    } catch { /* ignore */ }
  }, [sortOrder]);

  useEffect(() => {
    try {
      if (statusFilter) sessionStorage.setItem('wts_statusFilter', statusFilter);
    } catch { /* ignore */ }
  }, [statusFilter]);

  useEffect(() => {
    try {
      if (selectedLocation) {
        sessionStorage.setItem('wts_selectedLoc', selectedLocation);
      } else {
        sessionStorage.removeItem('wts_selectedLoc');
      }
    } catch { /* ignore */ }
  }, [selectedLocation]);

  useEffect(() => {
    try {
      if (nameQuery) {
        sessionStorage.setItem('wts_nameQuery', nameQuery);
      } else {
        sessionStorage.removeItem('wts_nameQuery');
      }
    } catch { /* ignore */ }
  }, [nameQuery]);

  const handleNameInput = (val) => {
    setNameQuery(val);
    if (!val.trim()) {
      setNameSugg([]);
      setShowNameSugg(false);
      return;
    }
    const q = val.toLowerCase();
    const matches = tuskers
      .filter(t => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .sort((a, b) => compareTuskerId(a.id, b.id));
    setNameSugg(matches.slice(0, 5));
    setShowNameSugg(true);
  };

  const pickName = (tusker) => {
    setNameQuery(tusker.name);
    setNameSugg([]);
    setShowNameSugg(false);
  };

  const handleDistrictInput = (val) => {
    setDistrictQuery(val);
    setSelectedDistrict('');
    setShowDistrictDrop(true);
  };

  const pickDistrict = (dist) => {
    setSelectedDistrict(dist);
    setDistrictQuery(dist);
    setShowDistrictDrop(false);

    // If a location is currently selected, check if it's still valid under the new district
    if (selectedLocation) {
      const validSet = new Set();
      tuskers.forEach(t => {
        if (tuskerIsInDistrict(t, dist)) {
          splitAreas(t.location).forEach(a => validSet.add(a.toLowerCase().trim()));
          splitAreas(t.lastSeenArea).forEach(a => validSet.add(a.toLowerCase().trim()));
        }
      });
      if (!validSet.has(selectedLocation.toLowerCase().trim())) {
        setSelectedLoc('');
        setLocationQuery('');
        try { sessionStorage.removeItem('wts_selectedLoc'); } catch {}
      }
    }
  };

  const clearDistrict = () => {
    setSelectedDistrict('');
    setDistrictQuery('');
    setShowDistrictDrop(false);
    try { sessionStorage.removeItem('wts_selectedDistrict'); } catch {}
  };

  const handleLocInput = (val) => {
    setLocationQuery(val);
    setSelectedLoc('');
    setShowLocDrop(true);
  };

  const pickLocation = (loc) => {
    setSelectedLoc(loc);
    setLocationQuery(loc);
    setShowLocDrop(false);
  };

  const clearLocation = () => {
    setSelectedLoc('');
    setLocationQuery('');
    setShowLocDrop(false);
    try {
      sessionStorage.removeItem('wts_selectedLoc');
    } catch { /* ignore */ }
  };

  const clearFilters = () => {
    setNameQuery('');
    setSelectedDistrict('');
    setDistrictQuery('');
    setShowDistrictDrop(false);
    setSelectedLoc('');
    setLocationQuery('');
    setStatusFilter('ALL');
    setSortOrder('ID_DESC');
    setShowLocDrop(false);
    setShowNameSugg(false);
    try {
      sessionStorage.removeItem('wts_nameQuery');
      sessionStorage.removeItem('wts_selectedDistrict');
      sessionStorage.removeItem('wts_statusFilter');
      sessionStorage.removeItem('wts_sortOrder');
      sessionStorage.removeItem('wts_sortOrder_v2');
      sessionStorage.removeItem('wts_selectedLoc');
    } catch { /* ignore */ }
  };

  const focusLocation = () => {
    setShowLocDrop(true);
  };

  const filtered = useMemo(() => {
    let list = [...tuskers];
    if (nameQuery.trim()) {
      const q = nameQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    if (selectedDistrict) {
      list = list.filter(t => tuskerIsInDistrict(t, selectedDistrict));
    }
    const activeLoc = selectedLocation || locationQuery.trim();
    if (activeLoc) {
      list = list.filter(t => tuskerRoamsIn(t, activeLoc, !selectedLocation));
    }
    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.livingStatus === statusFilter);
    }

    if (sortOrder === 'NAME_ASC') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
    } else if (sortOrder === 'NAME_DESC') {
      list.sort((a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }));
    } else if (sortOrder === 'ID_ASC') {
      list.sort((a, b) => compareTuskerId(a.id, b.id));
    } else {
      // Default: ID_DESC (descending, latest / highest T-number first: T328, T327, ...)
      list.sort((a, b) => compareTuskerId(b.id, a.id));
    }
    return list;
  }, [nameQuery, selectedDistrict, selectedLocation, locationQuery, statusFilter, sortOrder, tuskers, tuskerRoamsIn]);

  return {
    tuskers,
    loading,
    loadError,
    statusFilter,
    setStatusFilter,
    statusCounts,
    sortOrder,
    setSortOrder,
    countInArea,
    nameQuery,
    nameSuggestions,
    showNameSugg,
    setShowNameSugg,
    selectedDistrict,
    setSelectedDistrict,
    districtQuery,
    setDistrictQuery,
    showDistrictDrop,
    setShowDistrictDrop,
    districtSuggestions,
    countInDistrict,
    handleDistrictInput,
    pickDistrict,
    clearDistrict,
    validLocationsForDistrict,
    locationQuery,
    selectedLocation,
    showLocDrop,
    setShowLocDrop,
    locSuggestions,
    handleNameInput,
    pickName,
    handleLocInput,
    pickLocation,
    clearLocation,
    clearFilters,
    focusLocation,
    filtered,
  };
}

/* ==============================================================
   SECTION 2: TUSKER PROFILE & SLIDESHOW CONTROLLER
============================================================== */
export function useTuskerProfile(id) {
  const [tusker, setTusker] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTuskerById(id)
      .then(t => { if (active) setTusker(t); })
      .catch(err => { console.error(err); if (active) setTusker(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const canAddSighting = isAdmin && tusker?.livingStatus !== 'Deceased';

  // Only show comparisons that were actually recorded for this tusker.
  // (The auto-generated narrative would invent history for real elephants.)
  const comparisonList = useMemo(
    () => (tusker?.photographicComparison?.length ? getTuskerComparison(tusker) : []),
    [tusker]
  );
  const earComparisonList = useMemo(
    () => ((tusker?.earComparison?.length || tusker?.earPhotos?.length) ? getTuskerEarComparison(tusker) : []),
    [tusker]
  );

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const prevPhoto = (photosCount) => {
    setCurrentPhotoIndex(p => (p === 0 ? photosCount - 1 : p - 1));
  };

  const nextPhoto = (photosCount) => {
    setCurrentPhotoIndex(p => (p === photosCount - 1 ? 0 : p + 1));
  };

  return {
    tusker,
    setTusker,
    reloadTusker: () => {
      if (id) {
        return getTuskerById(id).then(t => { if (t) setTusker(t); return t; });
      }
      return Promise.resolve(null);
    },
    loading,
    comparisonList,
    earComparisonList,
    isAdmin,
    canAddSighting,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    prevPhoto,
    nextPhoto,
  };
}

/* ==============================================================
   SECTION 3: ADD SIGHTING / PHOTO FORM CONTROLLER
============================================================== */
export function useSightingForm(tuskerId) {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    imageUrl: '',
    imageUrls: [],
    captureDate: todayLocalISO(),
    author: isAdmin ? 'WTS Admin' : 'WTS Researcher',
    note: '',
    lastSeenArea: '',
    healthCondition: 'Good',
    threatLevel: '',
    specialMarks: '',
    specialWounds: '',
    remarks: '',
  });
  const [initialTusker, setInitialTusker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tusker metadata for display; do not prefill observation fields from old sightings
  useEffect(() => {
    let active = true;
    if (tuskerId) {
      getTuskerById(tuskerId)
        .then(t => {
          if (active && t) {
            setInitialTusker(t);
            // New sightings must start completely fresh & clean:
            // Sighting area, wounds, marks, threat level, and remarks must not inherit old records.
            setFormData(prev => ({
              ...prev,
              imageUrl: '',
              imageUrls: [],
              lastSeenArea: '',
              healthCondition: 'Good',
              threatLevel: '',
              specialMarks: '',
              specialWounds: '',
              remarks: '',
              note: '',
            }));
          }
        })
        .catch(err => console.error(err))
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [tuskerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (urls) => {
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    setFormData(prev => ({
      ...prev,
      imageUrls: list,
      imageUrl: list[0] || ''
    }));
  };

  const submitSighting = async () => {
    const {
      imageUrl,
      imageUrls,
      captureDate,
      note,
      author,
      lastSeenArea,
      healthCondition,
      threatLevel,
      specialMarks,
      specialWounds,
      remarks,
    } = formData;

    const finalUrls = (imageUrls && imageUrls.length > 0)
      ? imageUrls
      : (imageUrl ? (imageUrl.includes(',') ? imageUrl.split(',').map(s => s.trim()).filter(Boolean) : [imageUrl]) : []);

    if (finalUrls.length === 0 || !captureDate) {
      setError('Please provide at least one photo and capture date.');
      return false;
    }
    if (!String(formData.lastSeenArea || '').trim()) {
      setError('Please add the location where this sighting was recorded.');
      return false;
    }

    try {
      const primaryUrl = finalUrls[0] || imageUrl || '';
      const coords = getLocationCoordinates(lastSeenArea);
      const sightingDetails = {
        note: (note || '').trim(),
        location: (lastSeenArea || '').trim(),
        coords: coords || null,
        healthCondition: healthCondition || '',
        threatLevel: threatLevel || '',
        specialMarks: (specialMarks || '').trim(),
        specialWounds: (specialWounds || '').trim(),
        remarks: (remarks || '').trim(),
        images: finalUrls, // All photos attached to this single sighting
      };
      const serializedNote = JSON.stringify(sightingDetails);
      const observer = (author || 'WTS Admin').trim();

      // 1. Add single sighting row to tusker_sightings with primary image and full photos list
      await addSightingToTusker(tuskerId, {
        imageUrl: finalUrls.join(', ') || primaryUrl,
        captureDate,
        note: serializedNote,
        author: observer,
      });

      // 2. Update tusker's current profile state (for both admin and public)
      // Note: First Recorded By, First Recorded Date, and Nickname By are NEVER modified here!
      const profileUpdates = {};
      if (lastSeenArea && lastSeenArea.trim()) {
        profileUpdates.lastSeenArea = lastSeenArea.trim();
      }
      if (captureDate) {
        // PostgreSQL date requires YYYY-MM-DD
        const monthStr = captureDate.slice(0, 7);
        profileUpdates.lastSeen = `${monthStr}-01`;
      }
      if (healthCondition) {
        profileUpdates.healthCondition = healthCondition;
      }
      if (threatLevel) {
        profileUpdates.threatLevel = threatLevel;
      }
      if (specialMarks && specialMarks.trim()) {
        profileUpdates.specialMarks = specialMarks.trim();
      }
      if (specialWounds && specialWounds.trim()) {
        profileUpdates.specialWounds = specialWounds.trim();
      }
      if (remarks && remarks.trim()) {
        profileUpdates.remarks = remarks.trim();
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateTusker(tuskerId, profileUpdates);
      }
    } catch (err) {
      setError(`Could not save sighting: ${err.message}`);
      return false;
    }

    return true;
  };

  return {
    formData,
    setFormData,
    initialTusker,
    loading,
    error,
    handleChange,
    handleImagesChange,
    submitSighting
  };
}

/* ==============================================================
   SECTION 4: CREATE / EDIT TUSKER PROFILE FORM CONTROLLER
============================================================== */
const EMPTY_TUSKER_FORM = {
  id: '',
  name: '',
  sinhala: '',
  location: '',
  listedDate: '',
  recordedBy: '',
  nicknameGivenBy: '',
  description: '',
  specialMarks: '',
  specialWounds: '',
  riskScore: '',
  riskLink: '#risk-assessment',
  photo: '',
  photos: [],
  // Official registry fields
  livingStatus: 'Alive',
  deathYear: '',
  deathReason: '',
  lastSeenArea: '',
  lastSeen: '',        // "YYYY-MM" in the form, stored as YYYY-MM-01
  zone: '',
  district: '',
  province: '',
  proximateBirthYear: '',
  birthYear: '',
  ageRange: '',
  healthCondition: '',
  threatLevel: '',
  remarks: '',
};

export function useTuskerForm(id) {
  const isEditMode = !!id;
  const [formData, setFormData] = useState(EMPTY_TUSKER_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    getTuskerById(id).then(existing => {
      if (!active) return;
      if (!existing) {
        setError('Tusker not found for editing.');
        return;
      }
      const next = { ...EMPTY_TUSKER_FORM };
      Object.keys(next).forEach(k => {
        if (existing[k] !== null && existing[k] !== undefined) next[k] = String(existing[k]);
      });
      next.lastSeen = existing.lastSeen ? existing.lastSeen.slice(0, 7) : '';
      if (existing.photos && existing.photos.length > 0) {
        next.photos = existing.photos;
        next.photo = existing.photos[0];
      } else if (existing.photo) {
        next.photos = [existing.photo];
        next.photo = existing.photo;
      }
      setFormData(next);
    }).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (urls) => {
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    setFormData(prev => ({
      ...prev,
      photos: list,
      photo: list[0] || ''
    }));
  };

  /** Resolves to the saved tusker ID, or false on error. */
  const saveProfile = async () => {
    const f = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );

    if (!f.id || !f.name) {
      setError('Please fill in the Tusker ID and Name.');
      return false;
    }
    if (!String(f.location || '').trim()) {
      setError('Please add at least one roaming area.');
      return false;
    }
    if (f.deathYear && !/^\d{4}$/.test(f.deathYear)) {
      setError('Year of death must be a 4-digit year.');
      return false;
    }

    const formattedId = f.id.toUpperCase();
    const isDeceased = f.livingStatus === 'Deceased';
    const photosArray = Array.isArray(f.photos) && f.photos.length > 0
      ? f.photos
      : (f.photo ? (typeof f.photo === 'string' ? f.photo.split(',').map(s => s.trim()).filter(Boolean) : [f.photo]) : []);

    const birthNum = f.proximateBirthYear ? Number(f.proximateBirthYear) : (f.birthYear ? Number(f.birthYear) : null);
    const payload = {
      ...f,
      proximateBirthYear: birthNum,
      birthYear: birthNum,
      riskLink: f.riskLink && f.riskLink.trim() ? f.riskLink.trim() : '#risk-assessment',
      deathYear: isDeceased && f.deathYear ? Number(f.deathYear) : null,
      deathReason: isDeceased ? f.deathReason : '',
      lastSeen: f.lastSeen ? `${f.lastSeen}-01` : '',
      photos: photosArray,
    };
    delete payload.id;
    delete payload.photo;

    setError('');
    setSaving(true);
    try {
      if (isEditMode) {
        await updateTusker(id, payload);
      } else {
        if (await tuskerExists(formattedId)) {
          setError(`Tusker with ID ${formattedId} already exists.`);
          return false;
        }
        await addTusker({ ...payload, id: formattedId, photos: photosArray });
      }
    } catch (err) {
      setError(`Could not save tusker: ${err.message}`);
      return false;
    } finally {
      setSaving(false);
    }
    return formattedId;
  };

  return {
    formData,
    setFormData,
    error,
    saving,
    isEditMode,
    handleChange,
    handlePhotosChange,
    saveProfile,
  };
}
