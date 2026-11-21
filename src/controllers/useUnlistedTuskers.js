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
    return [...new Set(tuskers.map(t => t.location).filter(Boolean))].sort();
  }, [tuskers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocDrop, setShowLocDrop] = useState(false);

  const locSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const isBrowsingAll = !q || (selectedLocation && q === selectedLocation.toLowerCase().trim());
    if (isBrowsingAll) return allLocations;
    return allLocations.filter(loc => loc.toLowerCase().includes(q));
  }, [allLocations, locationQuery, selectedLocation]);

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
