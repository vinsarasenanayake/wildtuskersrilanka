import { useState, useMemo, useEffect } from 'react';
import {
  getTuskers,
  getTuskerById,
  tuskerExists,
  addTusker,
  updateTusker,
  addSightingToTusker,
  getTuskerComparison,
  getTuskerEarComparison,
  compareTuskerId
} from '../models/TuskerModel';
import { useAuth } from './useAuth';
import { SRI_LANKA_WILDLIFE_LOCATIONS, getLocationCoordinates } from '../utils/sriLankaLocations';

/* ==============================================================
   SECTION 1: WILD TUSKERS DIRECTORY & SEARCH CONTROLLER
============================================================== */
export function useTuskerList() {
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    getTuskers()
      .then(list => { if (active) setTuskers(list); })
      .catch(err => { if (active) setLoadError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Roaming areas are often combined ("Minneriya / Kaudulla") or
  // list multiple park blocks ("Yala Block 3,5"), so expand blocks and
  // split them into individual areas for the filter.
  const splitAreas = (loc) => {
    if (!loc) return [];
    const normalized = loc.replace(
      /(\b(?:Yala\s+)?Block\s+)(\d+)\s*,\s*(\d+)/gi,
      (_, prefix, n1, n2) => `${prefix}${n1} / ${prefix}${n2}`
    );
    return normalized
      .split(/[/,]/)
      .map((a) => a.trim())
      .filter((a) => Boolean(a) && !/^\d+$/.test(a));
  };

  const allLocations = useMemo(() => {
    const byKey = new Map();
    // 1. Gather all areas documented across tuskers
    tuskers.forEach(t => splitAreas(t.location).forEach(a => {
      const key = a.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, a);
    }));
    // 2. Also incorporate curated Sri Lanka wildlife sanctuaries & parks
    SRI_LANKA_WILDLIFE_LOCATIONS.forEach(loc => {
      const key = loc.name.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, loc.name);
    });
    return [...byKey.values()].sort((a, b) => a.localeCompare(b));
  }, [tuskers]);

  const tuskerRoamsIn = (t, area) =>
    splitAreas(t.location).some(a => a.toLowerCase() === area.toLowerCase());

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
  const [selectedLocation, setSelectedLoc] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedLoc') || ''; } catch { return ''; }
  });
  const [locationQuery, setLocationQuery] = useState(() => {
    try { return sessionStorage.getItem('wts_selectedLoc') || ''; } catch { return ''; }
  });
  const [showLocDrop, setShowLocDrop] = useState(false);
  const [locSuggestions, setLocSugg] = useState([]);

  /* ── Persist Filter & Sort State across Navigation & Reload ── */
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

  const handleLocInput = (val) => {
    setLocationQuery(val);
    const q = val.toLowerCase();
    const filtered = allLocations.filter(loc => loc.toLowerCase().includes(q));
    filtered.sort((a, b) => {
      const countA = countInArea(a);
      const countB = countInArea(b);
      if (countA > 0 && countB === 0) return -1;
      if (countB > 0 && countA === 0) return 1;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });
    setLocSugg(filtered);
    setShowLocDrop(true);
  };

  const pickLocation = (loc) => {
    setSelectedLoc(loc);
    setLocationQuery(loc);
    setLocSugg([]);
    setShowLocDrop(false);
  };

  const clearLocation = () => {
    setSelectedLoc('');
    setLocationQuery('');
    setLocSugg([]);
    setShowLocDrop(false);
    try {
      sessionStorage.removeItem('wts_selectedLoc');
    } catch { /* ignore */ }
  };

  const clearFilters = () => {
    setNameQuery('');
    setSelectedLoc('');
    setLocationQuery('');
    setStatusFilter('ALL');
    setSortOrder('ID_DESC');
    try {
      sessionStorage.removeItem('wts_nameQuery');
      sessionStorage.removeItem('wts_statusFilter');
      sessionStorage.removeItem('wts_sortOrder');
      sessionStorage.removeItem('wts_sortOrder_v2');
      sessionStorage.removeItem('wts_selectedLoc');
    } catch { /* ignore */ }
  };

  const focusLocation = () => {
    const sorted = [...allLocations].sort((a, b) => {
      const countA = countInArea(a);
      const countB = countInArea(b);
      if (countA > 0 && countB === 0) return -1;
      if (countB > 0 && countA === 0) return 1;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });
    setLocSugg(sorted);
    setShowLocDrop(true);
  };

  const filtered = useMemo(() => {
    let list = [...tuskers];
    if (nameQuery.trim()) {
      const q = nameQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    if (selectedLocation) {
      list = list.filter(t => tuskerRoamsIn(t, selectedLocation));
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
  }, [nameQuery, selectedLocation, statusFilter, sortOrder, tuskers]);

  return {
    tuskers,
    loading,
    loadError,
    statusFilter,
    setStatusFilter,
    statusCounts,
    sortOrder,
    setSortOrder,
    countInArea: (area) => tuskers.filter(t => tuskerRoamsIn(t, area)).length,
    nameQuery,
    nameSuggestions,
    showNameSugg,
    setShowNameSugg,
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
  const canAddSighting = isAdmin;

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
    captureDate: new Date().toISOString().split('T')[0],
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
