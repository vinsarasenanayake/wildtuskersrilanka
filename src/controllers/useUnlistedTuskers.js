import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getUnlistedTuskers,
  addUnlistedTusker,
  updateUnlistedTusker,
  deleteUnlistedTusker
} from '../models/UnlistedTuskersModel';
import { useAuth } from './useAuth';

export function useUnlistedTuskers() {
  /* ── Data State & Sync ─────────────────────────────────────── */
  const [tuskers, setTuskers] = useState(() => getUnlistedTuskers());
  const { isAdmin } = useAuth();

  const reloadData = useCallback(() => {
    setTuskers(getUnlistedTuskers());
  }, []);

  useEffect(() => {
    const handleUpdate = () => reloadData();
    window.addEventListener('unlistedTuskersChange', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('unlistedTuskersChange', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reloadData]);

  /* ── Filter & Search State ─────────────────────────────────── */
  const allLocations = useMemo(() => {
    return [...new Set(tuskers.map(t => t.location).filter(Boolean))].sort();
  }, [tuskers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocDrop, setShowLocDrop] = useState(false);

  const locSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return allLocations;
    return allLocations.filter(loc => loc.toLowerCase().includes(q));
  }, [allLocations, locationQuery]);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
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

      const locFilter = selectedLocation || locationQuery.trim();
      const matchLoc =
        !locFilter ||
        item.location.toLowerCase() === locFilter.toLowerCase();

      return matchSearch && matchLoc;
    });
  }, [tuskers, searchQuery, selectedLocation, locationQuery]);

  /* ── Mutation Handlers ─────────────────────────────────────── */
  const handleAdd = (entry) => {
    const created = addUnlistedTusker(entry);
    reloadData();
    return created;
  };

  const handleUpdate = (id, updated) => {
    const res = updateUnlistedTusker(id, updated);
    reloadData();
    return res;
  };

  const handleDelete = (id) => {
    deleteUnlistedTusker(id);
    reloadData();
  };

  return {
    tuskers,
    filtered,
    allLocations,
    searchQuery,
    setSearchQuery,
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
