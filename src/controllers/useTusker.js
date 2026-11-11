import { useState, useMemo, useEffect } from 'react';
import {
  getTuskers,
  addTusker,
  updateTusker,
  addSightingToTusker,
  getTuskerComparison,
  getTuskerEarComparison
} from '../models/TuskerModel';
import { useAuth } from './useAuth';

/* ==============================================================
   SECTION 1: WILD TUSKERS DIRECTORY & SEARCH CONTROLLER
============================================================== */
export function useTuskerList() {
  const tuskers = useMemo(() => getTuskers(), []);

  const allLocations = useMemo(() => {
    return [...new Set(tuskers.map(t => t.location).filter(Boolean))].sort();
  }, [tuskers]);

  const [nameQuery, setNameQuery]         = useState('');
  const [nameSuggestions, setNameSugg]    = useState([]);
  const [showNameSugg, setShowNameSugg]   = useState(false);

  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLoc]= useState('');
  const [showLocDrop, setShowLocDrop]     = useState(false);
  const [locSuggestions, setLocSugg]      = useState([]);

  const sortAZ = true;

  const handleNameInput = (val) => {
    setNameQuery(val);
    if (!val.trim()) {
      setNameSugg([]);
      setShowNameSugg(false);
      return;
    }
    const q = val.toLowerCase();
    const matches = tuskers.filter(t =>
      t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    );
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
  };

  const clearFilters = () => {
    setNameQuery('');
    setSelectedLoc('');
    setLocationQuery('');
  };

  const focusLocation = () => {
    setLocSugg(allLocations);
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
      list = list.filter(t => t.location === selectedLocation);
    }
    list.sort((a, b) =>
      sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [nameQuery, selectedLocation, sortAZ, tuskers]);

  return {
    tuskers,
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
  const tuskers = getTuskers();
  const tusker = tuskers.find(t => t.id.toLowerCase() === id?.toLowerCase());
  const { isAdmin } = useAuth();
  const canAddSighting = isAdmin;

  const comparisonList = useMemo(() => getTuskerComparison(tusker), [tusker]);
  const earComparisonList = useMemo(() => getTuskerEarComparison(tusker), [tusker]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const prevPhoto = (photosCount) => {
    setCurrentPhotoIndex(p => (p === 0 ? photosCount - 1 : p - 1));
  };

  const nextPhoto = (photosCount) => {
    setCurrentPhotoIndex(p => (p === photosCount - 1 ? 0 : p + 1));
  };

  return {
    tusker,
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
  const [formData, setFormData] = useState({
    imageUrl: '',
    captureDate: '',
    note: ''
  });
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitSighting = () => {
    const { imageUrl, captureDate, note } = formData;
    if (!imageUrl || !captureDate) {
      setError('Please provide an image URL and capture date.');
      return false;
    }
    
    addSightingToTusker(tuskerId, {
      imageUrl,
      captureDate,
      note,
      author: isAdmin ? 'Admin' : 'Researcher'
    });
    
    return true;
  };

  return {
    formData,
    error,
    handleChange,
    submitSighting
  };
}

/* ==============================================================
   SECTION 4: CREATE / EDIT TUSKER PROFILE FORM CONTROLLER
============================================================== */
export function useTuskerForm(id, locationsList) {
  const isEditMode = !!id;
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sinhala: '',
    location: locationsList[0] || '',
    listedDate: '',
    recordedBy: '',
    nicknameGivenBy: '',
    description: '',
    specialMarks: '',
    specialWounds: '',
    riskScore: '',
    riskLink: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const tuskers = getTuskers();
      const existing = tuskers.find(t => t.id.toLowerCase() === id.toLowerCase());
      if (existing) {
        setFormData({
          id: existing.id,
          name: existing.name,
          sinhala: existing.sinhala,
          location: existing.location || locationsList[0] || '',
          listedDate: existing.listedDate || '',
          recordedBy: existing.recordedBy || '',
          nicknameGivenBy: existing.nicknameGivenBy || existing.recordedBy || '',
          description: existing.description || '',
          specialMarks: existing.specialMarks || '',
          specialWounds: existing.specialWounds || '',
          riskScore: existing.riskScore || '',
          riskLink: existing.riskLink || ''
        });
      } else {
        setError('Tusker not found for editing.');
      }
    }
  }, [id, isEditMode, locationsList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    const { id: tuskerId, name, sinhala, location, listedDate, recordedBy, nicknameGivenBy, description, specialMarks, specialWounds, riskScore, riskLink } = formData;

    if (!tuskerId || !name || !sinhala || !listedDate) {
      setError('Please fill in all required fields (ID, Name, Sinhala Name, First Recorded Date).');
      return false;
    }

    const formattedId = tuskerId.toUpperCase().trim();

    if (isEditMode) {
      updateTusker(id, {
        name,
        sinhala,
        location,
        listedDate,
        recordedBy,
        nicknameGivenBy,
        description,
        specialMarks,
        specialWounds,
        riskScore,
        riskLink
      });
    } else {
      const tuskers = getTuskers();
      if (tuskers.some(t => t.id.toUpperCase() === formattedId)) {
        setError(`Tusker with ID ${formattedId} already exists.`);
        return false;
      }

      addTusker({
        id: formattedId,
        name,
        sinhala,
        location,
        listedDate,
        recordedBy,
        nicknameGivenBy,
        description,
        specialMarks,
        specialWounds,
        riskScore,
        riskLink,
        photos: [null]
      });
    }
    return formattedId;
  };

  return {
    formData,
    error,
    handleChange,
    saveProfile,
    isEditMode,
  };
}
