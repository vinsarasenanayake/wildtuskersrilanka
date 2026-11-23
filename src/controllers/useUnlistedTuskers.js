/**
 * @file useUnlistedTuskers.js
 * @description Controller hooks for managing unlisted tusker records and search filters.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getUnlistedTuskers,
  addUnlistedTusker,
  updateUnlistedTusker,
  deleteUnlistedTusker
} from '../models/UnlistedTuskersModel';
import { DISTRICTS } from '../models/TuskerModel';
import { isLocationInDistrict } from '../utils/locationDistricts';
import { canonicalLocationName } from './useTusker';
import { useAuth } from './useAuth';

export function useUnlistedTuskers() {
  /* ── Data State & Sync ─────────────────────────────────────── */
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, authLoading } = useAuth();

  const reloadData = useCallback(async () => {
    try {
      setTuskers(await getUnlistedTuskers());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin-only table: load once we know the user is an admin
  useEffect(() => {
    if (!authLoading && isAdmin) reloadData();
  }, [authLoading, isAdmin, reloadData]);

  /* ── Filter & Search State ─────────────────────────────────── */
  const allLocations = useMemo(() => {
    const set = new Set();
    tuskers.forEach(t => {
      if (t.location) set.add(canonicalLocationName(t.location));
    });
    return [...set].filter(Boolean).sort();
  }, [tuskers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [showDistrictDrop, setShowDistrictDrop] = useState(false);

  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocDrop, setShowLocDrop] = useState(false);

  // District suggestions
  const districtSuggestions = useMemo(() => {
    const q = districtQuery.trim().toLowerCase();
    const isBrowsingAll = !q || (selectedDistrict && q === selectedDistrict.toLowerCase().trim());
    if (isBrowsingAll) return DISTRICTS;
    return DISTRICTS.filter(d => d.toLowerCase().includes(q));
  }, [districtQuery, selectedDistrict]);

  // Count unlisted tuskers per district
  const countInDistrict = useCallback((dist) => {
    if (!dist) return 0;
    return tuskers.filter(item =>
      isLocationInDistrict(item.location, dist) ||
      isLocationInDistrict(item.district, dist)
    ).length;
  }, [tuskers]);

  // Valid locations for selected district
  const validLocationsForDistrict = useMemo(() => {
    if (!selectedDistrict) return allLocations;
    return allLocations.filter(loc => isLocationInDistrict(loc, selectedDistrict));
  }, [selectedDistrict, allLocations]);

  const locSuggestions = useMemo(() => {
    const pool = validLocationsForDistrict;
    const q = locationQuery.trim().toLowerCase();
    const isBrowsingAll = !q || (selectedLocation && q === selectedLocation.toLowerCase().trim());
    if (isBrowsingAll) return pool;
    return pool.filter(loc => loc.toLowerCase().includes(q));
  }, [validLocationsForDistrict, locationQuery, selectedLocation]);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
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
    // If current location doesn't belong to newly selected district, reset it
    if (selectedLocation && !isLocationInDistrict(selectedLocation, dist)) {
      setSelectedLocation('');
      setLocationQuery('');
    }
  };

  const clearDistrict = () => {
    setSelectedDistrict('');
    setDistrictQuery('');
    setShowDistrictDrop(false);
  };

  const handleLocInput = (val) => {
    setLocationQuery(val);
    setSelectedLocation('');
    setShowLocDrop(true);
  };

  const pickLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationQuery(loc);
    setShowLocDrop(false);
  };

  const clearLocation = () => {
    setLocationQuery('');
    setSelectedLocation('');
    setShowLocDrop(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setDistrictQuery('');
    setShowDistrictDrop(false);
    setLocationQuery('');
    setSelectedLocation('');
    setShowLocDrop(false);
  };

  const focusLocation = () => {
    setShowLocDrop(true);
  };

  /* ── Filter Computation ────────────────────────────────────── */
  const filtered = useMemo(() => {
    return tuskers.filter(item => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchDistrict =
        !selectedDistrict ||
        isLocationInDistrict(item.location, selectedDistrict) ||
        isLocationInDistrict(item.district, selectedDistrict);

      const locFilter = (selectedLocation || locationQuery.trim()).toLowerCase();
      const matchLoc =
        !locFilter ||
        canonicalLocationName(item.location).toLowerCase() === locFilter ||
        item.location.toLowerCase() === locFilter;

      return matchSearch && matchDistrict && matchLoc;
    });
  }, [tuskers, searchQuery, selectedDistrict, selectedLocation, locationQuery]);

  /* ── Mutation Handlers ─────────────────────────────────────── */
  const handleAdd = async (entry) => {
    const created = await addUnlistedTusker(entry);
    await reloadData();
    return created;
  };

  const handleUpdate = async (id, updated) => {
    const res = await updateUnlistedTusker(id, updated);
    await reloadData();
    return res;
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete ${id}?`)) return;
    try {
      await deleteUnlistedTusker(id);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
    await reloadData();
  };

  return {
    tuskers,
    loading,
    authLoading,
    filtered,
    allLocations,
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    districtQuery,
    showDistrictDrop,
    setShowDistrictDrop,
    districtSuggestions,
    countInDistrict,
    handleDistrictInput,
    pickDistrict,
    clearDistrict,
    locationQuery,
    selectedLocation,
    showLocDrop,
    setShowLocDrop,
    locSuggestions,
    handleSearchInput,
    handleLocInput,
    pickLocation,
    clearLocation,
    clearFilters,
    focusLocation,
    isAdmin,
    addUnlistedTusker: handleAdd,
    updateUnlistedTusker: handleUpdate,
    deleteUnlistedTusker: handleDelete,
  };
}
