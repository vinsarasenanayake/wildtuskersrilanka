/**
 * @file AdminPortal.jsx
 * @description Central administrative management portal.
 * Features tabs for managing wild tuskers, unlisted monitoring records, special observations,
 * community field note reviews, project/expedition events, photo gallery moderation, and team members.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, PlusCircle, Trash2, Edit3, Eye, FileText, Binoculars, Calendar,
  Radar, Database, CheckCircle2, XCircle, Search, LogOut, RefreshCw, AlertCircle, Check, Users, ExternalLink, Save, X, Layers,
  Map as MapIcon,
} from 'lucide-react';
import { getTuskers, getCachedTuskers, deleteTusker } from '../../models/TuskerModel';
import { getUnlistedTuskers, getCachedUnlistedTuskers, deleteUnlistedTusker, addUnlistedTusker } from '../../models/UnlistedTuskersModel';
import { getSpecialObservations, getCachedSpecialObservations, deleteSpecialObservation } from '../../models/SpecialObservationsModel';
import { getEvents, getCachedEvents, deleteEvent } from '../../models/ProjectModel';
import { getFieldNotes, getCachedFieldNotes, approveFieldNote, rejectFieldNote } from '../../models/FieldNotesModel';
import { getGalleryPhotos, getCachedGalleryPhotos, approveGalleryPhoto, rejectGalleryPhoto, deleteGalleryPhoto, updateGalleryPhoto } from '../../models/GalleryModel';
import { getTeamMembers, getCachedTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../../models/TeamModel';
import { useAuth } from '../../controllers/useAuth';
import { safeUrl } from '../../utils/safeUrl';
import StatusBadge from '../components/StatusBadge';
import ImageUploadBox from '../components/ImageUploadBox';
import EditGalleryPhotoModal from '../components/EditGalleryPhotoModal';
import LocationSearchInput from '../components/LocationSearchInput';
import { todayLocalISO } from '../../utils/localDate';

/* ==============================================================
   CENTRAL ADMINISTRATIVE CONSOLE COMPONENT
============================================================== */
export default function AdminPortal() {
  const navigate = useNavigate();
  const { isAdmin, authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('tuskers');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Data states with instant 0ms memory & session cache initialization
  const [tuskers, setTuskers] = useState(() => getCachedTuskers() || []);
  const [unlisted, setUnlisted] = useState(() => getCachedUnlistedTuskers() || []);
  const [observations, setObservations] = useState(() => getCachedSpecialObservations() || []);
  const [events, setEvents] = useState(() => getCachedEvents() || { upcoming: [], past: [] });
  const [fieldNotes, setFieldNotes] = useState(() => {
    const cached = getCachedFieldNotes(true);
    if (Array.isArray(cached) && cached.length > 0) {
      return {
        approved: cached.filter(n => n.status === 'approved'),
        pending: cached.filter(n => n.status === 'pending'),
      };
    }
    return { approved: [], pending: [] };
  });
  const [galleryPhotos, setGalleryPhotos] = useState(() => getCachedGalleryPhotos(true) || []);
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState(null);
  const [teamMembers, setTeamMembers] = useState(() => getCachedTeamMembers() || []);
  const [dataLoading, setDataLoading] = useState(() => !getCachedTuskers());

  // Team Admin Modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: 'Admin',
    facebookUrl: '',
    image: '',
    displayOrder: 1,
  });
  const [savingTeamMember, setSavingTeamMember] = useState(false);
  const [teamFormError, setTeamFormError] = useState('');

  // Unlisted Tusker Modal state
  const [showAddUnlistedModal, setShowAddUnlistedModal] = useState(false);
  const [unlistedFormData, setUnlistedFormData] = useState({
    id: '',
    location: '',
    listedDate: todayLocalISO(),
    recordedBy: 'WTS Admin',
    description: '',
    specialMarks: '',
    photoUrl: '',
    photos: [],
  });
  const [savingUnlisted, setSavingUnlisted] = useState(false);
  const [unlistedError, setUnlistedError] = useState('');

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Admin Portal';
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  const loadAllData = async () => {
    try {
      const [tuskerList, unlistedList, observationList, eventGroups, rawNotes, rawGallery, teamList] = await Promise.all([
        getTuskers(),
        getUnlistedTuskers(),
        getSpecialObservations(),
        getEvents(),
        getFieldNotes({ admin: true }),
        getGalleryPhotos({ admin: true }),
        getTeamMembers(),
      ]);
      setTuskers(tuskerList);
      setUnlisted(unlistedList);
      setObservations(observationList);
      setEvents(eventGroups);
      const notesArray = Array.isArray(rawNotes) ? rawNotes : [];
      setFieldNotes({
        approved: notesArray.filter(n => n.status === 'approved'),
        pending: notesArray.filter(n => n.status === 'pending'),
      });
      setGalleryPhotos(Array.isArray(rawGallery) ? rawGallery : []);
      setTeamMembers(Array.isArray(teamList) ? teamList : []);
    } catch (err) {
      showToast(`Could not load data: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin]);

  /** Run a mutation, reload, then toast (or report the error). */
  const runAction = async (action, successMsg) => {
    try {
      await action();
      await loadAllData();
      showToast(successMsg);
    } catch (err) {
      showToast(`Action failed: ${err.message}`);
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // CRUD Handlers
  const handleDeleteTusker = (id, name) => {
    if (window.confirm(`Are you sure you want to delete Tusker ${id} (${name})? This action cannot be undone.`)) {
      runAction(() => deleteTusker(id), `Tusker ${id} was deleted successfully.`);
    }
  };

  const handleDeleteObservation = (id, title) => {
    if (window.confirm(`Are you sure you want to delete observation "${title}"?`)) {
      runAction(() => deleteSpecialObservation(id), 'Special observation was deleted successfully.');
    }
  };

  const handleDeleteEvent = (id, title) => {
    if (window.confirm(`Are you sure you want to delete event "${title}"?`)) {
      runAction(() => deleteEvent(id), 'Event was deleted successfully.');
    }
  };

  const handleApproveFieldNote = (id) => {
    runAction(() => approveFieldNote(id), 'Field note approved and published to public feed.');
  };

  const handleDeleteFieldNote = (id) => {
    if (window.confirm('Are you sure you want to delete this field note?')) {
      runAction(() => rejectFieldNote(id), 'Field note removed.');
    }
  };

  const handleApprovePhoto = (id) => {
    runAction(() => approveGalleryPhoto(id), 'Photo approved and published to gallery.');
  };

  const handleRejectPhoto = (id) => {
    if (window.confirm('Are you sure you want to reject this photo?')) {
      runAction(() => rejectGalleryPhoto(id), 'Photo rejected.');
    }
  };

  const handleDeletePhoto = (id) => {
    if (window.confirm('Are you sure you want to delete this gallery photo?')) {
      runAction(() => deleteGalleryPhoto(id), 'Gallery photo deleted.');
    }
  };

  const openAddTeamModal = () => {
    setEditingTeamMember(null);
    setTeamFormData({
      name: '',
      role: 'Admin',
      facebookUrl: '',
      image: '',
      displayOrder: (teamMembers.length || 0) + 1,
    });
    setTeamFormError('');
    setShowTeamModal(true);
  };

  const openEditTeamModal = (member) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name || '',
      role: member.role || 'Admin',
      facebookUrl: member.facebookUrl || '',
      image: member.image || '',
      displayOrder: member.displayOrder || 1,
    });
    setTeamFormError('');
    setShowTeamModal(true);
  };

  const handleDeleteTeamMember = (member) => {
    if (window.confirm(`Are you sure you want to delete team member "${member.name}"?`)) {
      runAction(async () => {
        if (member.id) await deleteTeamMember(member.id);
      }, `Team member "${member.name}" was removed.`);
    }
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!teamFormData.name.trim()) {
      setTeamFormError('Please enter member name.');
      return;
    }
    setSavingTeamMember(true);
    setTeamFormError('');
    try {
      const payload = {
        name: teamFormData.name.trim(),
        role: teamFormData.role.trim() || 'Admin',
        facebookUrl: teamFormData.facebookUrl.trim() || null,
        image: teamFormData.image || null,
        displayOrder: Number(teamFormData.displayOrder) || 1,
      };
      if (editingTeamMember && editingTeamMember.id) {
        await updateTeamMember(editingTeamMember.id, payload);
        showToast(`Updated "${payload.name}".`);
      } else {
        await addTeamMember(payload);
        showToast(`Added new team admin "${payload.name}".`);
      }
      setShowTeamModal(false);
      await loadAllData();
    } catch (err) {
      setTeamFormError(err.message);
    } finally {
      setSavingTeamMember(false);
    }
  };

  const handleDeleteUnlisted = (id) => {
    if (window.confirm(`Are you sure you want to delete unlisted record "${id}"?`)) {
      runAction(() => deleteUnlistedTusker(id), `Unlisted record ${id} removed.`);
    }
  };

  const handleSaveUnlisted = async (e) => {
    e.preventDefault();
    if (!unlistedFormData.location.trim()) {
      setUnlistedError('Please enter a location.');
      return;
    }
    if (!unlistedFormData.description.trim()) {
      setUnlistedError('Please enter description or sighting details.');
      return;
    }
    setSavingUnlisted(true);
    setUnlistedError('');
    try {
      const photos = (unlistedFormData.photos && unlistedFormData.photos.length > 0)
        ? unlistedFormData.photos
        : (unlistedFormData.photoUrl
          ? (unlistedFormData.photoUrl.includes(',')
            ? unlistedFormData.photoUrl.split(',').map(s => s.trim()).filter(Boolean)
            : [unlistedFormData.photoUrl])
          : []);
      const payload = {
        id: unlistedFormData.id.trim() || undefined,
        location: unlistedFormData.location.trim(),
        listedDate: unlistedFormData.listedDate,
        recordedBy: unlistedFormData.recordedBy.trim(),
        description: unlistedFormData.description.trim(),
        specialMarks: unlistedFormData.specialMarks.trim(),
        photos,
      };
      await addUnlistedTusker(payload);
      showToast('New unlisted tusker record logged successfully.');
      setShowAddUnlistedModal(false);
      setUnlistedFormData({
        id: '',
        location: '',
        listedDate: todayLocalISO(),
        recordedBy: 'WTS Admin',
        description: '',
        specialMarks: '',
        photoUrl: '',
      });
      await loadAllData();
    } catch (err) {
      setUnlistedError(err.message);
    } finally {
      setSavingUnlisted(false);
    }
  };

  const pendingGalleryPhotos = useMemo(() => {
    return galleryPhotos.filter(p => p.status === 'pending');
  }, [galleryPhotos]);

  // Filtered queries
  const filteredTuskers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tuskers;
    return tuskers.filter(t =>
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.location && t.location.toLowerCase().includes(q))
    );
  }, [tuskers, searchQuery]);

  const filteredUnlisted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return unlisted;
    return unlisted.filter(u =>
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q)) ||
      (u.description && u.description.toLowerCase().includes(q)) ||
      (u.specialMarks && u.specialMarks.toLowerCase().includes(q))
    );
  }, [unlisted, searchQuery]);

  const filteredObservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return observations;
    return observations.filter(o =>
      (o.title && o.title.toLowerCase().includes(q)) ||
      (o.tuskerName && o.tuskerName.toLowerCase().includes(q)) ||
      (o.location && o.location.toLowerCase().includes(q))
    );
  }, [observations, searchQuery]);

  const combinedEvents = useMemo(() => {
    const up = (events.upcoming || []).map(e => ({ ...e, eventCategory: 'Upcoming' }));
    const pa = (events.past || []).map(e => ({ ...e, eventCategory: 'Past' }));
    const all = up.concat(pa);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(e =>
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.sharedBy && e.sharedBy.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const pendingNotes = fieldNotes.pending || [];
  const approvedNotes = fieldNotes.approved || [];

  const filteredGallery = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return galleryPhotos;
    return galleryPhotos.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.photographer && p.photographer.toLowerCase().includes(q)) ||
      (p.tuskerName && p.tuskerName.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    );
  }, [galleryPhotos, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1f2824] pb-24">
      {/* Top Banner / Header */}
      <div className="w-full bg-[#0b2518] text-white pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-6 sm:pb-10 px-4 sm:px-10 lg:px-16 shadow-lg mb-6 sm:mb-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#d4af37] text-xs font-semibold tracking-wider uppercase mb-2.5 w-full sm:w-auto text-center">
              <Shield size={14} className="shrink-0" />
              <span>WTS Central Administrative Console</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-[2.2rem] md:text-[2.6rem] font-bold tracking-tight text-white m-0">
              Admin Portal
            </h1>
            <p className="text-[#a4b8af] text-xs sm:text-sm md:text-base mt-2 max-w-[340px] sm:max-w-[360px] lg:max-w-[500px] xl:max-w-[640px] leading-relaxed m-0 text-left">
              Consolidated registry control center. Manage wild tuskers, unlisted sightings, field observations, project events, and community field notes from a single command portal.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto lg:flex-row lg:items-center">
            <Link
              to="/"
              className="w-full lg:w-auto whitespace-nowrap shrink-0 justify-center text-center bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-lg border border-white/15 transition-all flex items-center gap-2 no-underline"
            >
              <Eye size={16} className="shrink-0" />
              <span className="whitespace-nowrap">View Live Website</span>
            </Link>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full lg:w-auto whitespace-nowrap shrink-0 justify-center text-center bg-[#c2410c] hover:bg-[#9a3412] text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none shadow-sm"
            >
              <LogOut size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-[#0b2518] text-white border-l-4 border-[#d4af37] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-[#d4af37]" />
              <span className="text-sm font-medium">{notification}</span>
            </div>
            <button
              onClick={() => setNotification('')}
              className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Quick Metrics Bar: 2-col balanced on mobile/tablet portrait, 5-col on landscape/desktop */}
        <div className="grid grid-cols-2 min-[800px]:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
          <div
            onClick={() => setActiveTab('tuskers')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'tuskers'
              ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
              : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Wild Tuskers</span>
              <Database size={18} className="text-[#0b2518]" />
            </div>
            {dataLoading && tuskers.length === 0 ? (
              <div className="h-9 w-16 bg-[#0b2518]/10 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{tuskers.length}</div>
            )}
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Documented profiles</p>
          </div>

          <Link
            to="/unlisted"
            className="p-5 rounded-2xl border transition-all cursor-pointer bg-white border-[#e2e8e4] hover:border-[#c8d4ce] hover:shadow-sm no-underline block"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Unlisted</span>
              <Radar size={18} className="text-[#0b2518]" />
            </div>
            {dataLoading && unlisted.length === 0 ? (
              <div className="h-9 w-16 bg-[#0b2518]/10 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{unlisted.length}</div>
            )}
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Under monitoring</p>
          </Link>

          <div
            onClick={() => setActiveTab('observations')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'observations'
              ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
              : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Observations</span>
              <Binoculars size={18} className="text-[#0b2518]" />
            </div>
            {dataLoading && observations.length === 0 ? (
              <div className="h-9 w-16 bg-[#0b2518]/10 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{observations.length}</div>
            )}
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Field observations</p>
          </div>

          <div
            onClick={() => setActiveTab('events')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'events'
              ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
              : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Events</span>
              <Calendar size={18} className="text-[#0b2518]" />
            </div>
            {dataLoading && !events.upcoming?.length && !events.past?.length ? (
              <div className="h-9 w-16 bg-[#0b2518]/10 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="font-serif text-3xl font-extrabold text-[#0b2518]">
                {(events.upcoming?.length || 0) + (events.past?.length || 0)}
              </div>
            )}
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Past and upcoming</p>
          </div>

          <div
            onClick={() => setActiveTab('field-notes')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer col-span-2 min-[800px]:col-span-1 ${activeTab === 'field-notes'
              ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
              : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Field Notes</span>
              <FileText size={18} className="text-[#0b2518]" />
            </div>
            {dataLoading && !approvedNotes.length && !pendingNotes.length ? (
              <div className="h-9 w-16 bg-[#0b2518]/10 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-extrabold text-[#0b2518]">{approvedNotes.length}</span>
                {pendingNotes.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {pendingNotes.length} pending
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Researcher field notes</p>
          </div>
        </div>

        {/* Quick Creation Command Center */}
        <div className="bg-white rounded-2xl p-6 border border-[#e2e8e4] shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#edf2ef]">
            <div>
              <h2 className="text-base font-bold text-[#0b2518] m-0">Quick Creation Actions</h2>
              <p className="text-xs text-[#6a7c73] m-0 mt-0.5">Direct shortcuts to add records across all modules</p>
            </div>
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b2518] bg-[#f0f5f2] hover:bg-[#e4ede8] px-3 py-1.5 rounded-md transition-all border-none cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Refresh Records</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Link
              to="/admin/zone-map"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#0b2518] to-[#16402b] hover:from-[#16402b] hover:to-[#1d5236] text-white transition-all shadow-sm group border border-[#c69b55]/40 no-underline"
            >
              <div className="w-9 h-9 rounded-lg bg-[#c69b55]/20 text-[#c69b55] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layers size={18} />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-semibold text-sm leading-tight">Zone Map</div>
                <div className="text-[0.75rem] text-white/70 truncate">4 Landscape Zones & Regional Tusker Distribution</div>
              </div>
              <span className="text-[#c69b55] text-xs font-semibold shrink-0">Open →</span>
            </Link>

            <Link
              to="/admin/district-map"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#082015] to-[#0f3422] hover:from-[#0f3422] hover:to-[#17482f] text-white transition-all shadow-sm group border border-amber-500/30 no-underline"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MapIcon size={18} />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-semibold text-sm leading-tight">District Map</div>
                <div className="text-[0.75rem] text-white/70 truncate">All 25 Sri Lankan administrative districts & tusker distribution</div>
              </div>
              <span className="text-amber-400 text-xs font-semibold shrink-0">Explore →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/admin/add-tusker"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0b2518] hover:bg-[#16402b] text-white transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <PlusCircle size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm leading-tight">Add New Tusker</div>
                <div className="text-[0.75rem] text-white/70 truncate">Create catalog profile</div>
              </div>
            </Link>

            <Link
              to="/admin/add-observation"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0b2518] hover:bg-[#16402b] text-white transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Binoculars size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm leading-tight">Add Observation</div>
                <div className="text-[0.75rem] text-white/70 truncate">Special sighting record</div>
              </div>
            </Link>

            <Link
              to="/admin/create-event"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0b2518] hover:bg-[#16402b] text-white transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm leading-tight">Create Event</div>
                <div className="text-[0.75rem] text-white/70 truncate">New project or lecture</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0b2518] hover:bg-[#16402b] text-white transition-all shadow-sm group border-none cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm leading-tight">Admins &amp; Team</div>
                <div className="text-[0.75rem] text-white/70 truncate">Manage team members</div>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs and Search */}
        <div className="bg-white rounded-2xl border border-[#e2e8e4] shadow-sm overflow-hidden mb-12">
          {/* Tabs Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#edf2ef] px-4 sm:px-6 pt-3.5 sm:pt-4 pb-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
              <button
                onClick={() => setActiveTab('tuskers')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'tuskers'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                Wild Tuskers ({tuskers.length})
              </button>

              <button
                onClick={() => setActiveTab('observations')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'observations'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                Special Observations ({observations.length})
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'events'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                Projects and Events ({combinedEvents.length})
              </button>

              <button
                onClick={() => setActiveTab('field-notes')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${activeTab === 'field-notes'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                <span>Field Notes ({approvedNotes.length + pendingNotes.length})</span>
                {pendingNotes.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${activeTab === 'gallery'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                <span>The Gallery ({galleryPhotos.length})</span>
                {pendingGalleryPhotos.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${activeTab === 'team'
                  ? 'bg-[#0b2518] text-white shadow-sm'
                  : 'text-[#56685f] hover:bg-[#f0f5f2]'
                  }`}
              >
                <Users size={15} />
                <span>Team &amp; Admins ({teamMembers.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8fa298]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#dde6e1] bg-[#f9fbf9] text-xs sm:text-sm text-[#1f2824] focus:outline-none focus:border-[#0b2518] focus:ring-1 focus:ring-[#0b2518]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8fa298] hover:text-[#1f2824] bg-none border-none cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: WILD TUSKERS */}
          {activeTab === 'tuskers' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  {dataLoading && tuskers.length === 0 ? 'Loading registry records…' : `Showing ${filteredTuskers.length} of ${tuskers.length} tuskers`}
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/admin/add-tusker"
                    className="flex-1 sm:flex-initial justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2.5 sm:py-2 rounded-lg transition-all no-underline whitespace-nowrap"
                  >
                    <PlusCircle size={15} className="shrink-0" />
                    <span>Add Tusker</span>
                  </Link>
                  <Link
                    to="/unlisted"
                    className="flex-1 sm:flex-initial justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2518] bg-[#faf5ec] hover:bg-[#f3ebd9] border border-accent/40 px-3.5 py-2.5 sm:py-2 rounded-lg transition-all no-underline shadow-xs whitespace-nowrap"
                  >
                    <Radar size={15} className="text-accent shrink-0" />
                    <span>Unlisted Monitoring</span>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4 min-w-[95px] whitespace-nowrap">Tusker ID</th>
                      <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Name</th>
                      <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Location</th>
                      <th className="py-3 px-4 min-w-[125px] whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 min-w-[115px] whitespace-nowrap">Sightings</th>
                      <th className="py-3 px-4 text-right min-w-[90px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && tuskers.length === 0 ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded-full" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredTuskers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#7e9087]">
                          No tuskers found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredTuskers.map((t) => (
                        <tr key={t.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0b2518] whitespace-nowrap">{t.id}</td>
                          <td className="py-3 px-4 font-semibold text-[#182620]">
                            {t.name}{t.sinhala && <span className="text-xs text-[#7e9087] font-normal"> ({t.sinhala})</span>}
                          </td>
                          <td className="py-3 px-4 text-[#4a5c53]">{t.location || 'Unknown'}</td>
                          <td className="py-3 px-4 text-xs">
                            <StatusBadge status={t.livingStatus} deathYear={t.deathYear} className="px-2 py-0.5 text-[0.7rem]" />
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#eef5f1] text-[#0b2518] font-bold text-xs whitespace-nowrap shrink-0">
                              {t.sightings?.length || 0} sightings
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to={`/tuskers/${t.id.toLowerCase()}`}
                                state={{ from: '/admin' }}
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="View public profile"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                to={`/tuskers/${t.id.toLowerCase()}/add-sighting`}
                                className="p-1.5 rounded-lg text-[#0284c7] hover:bg-[#e0f2fe] transition-all"
                                title="Add sighting record"
                              >
                                <PlusCircle size={16} />
                              </Link>
                              <Link
                                to={`/admin/edit-tusker/${t.id.toLowerCase()}`}
                                className="p-1.5 rounded-lg text-[#d97706] hover:bg-[#fef3c7] transition-all"
                                title="Edit profile"
                              >
                                <Edit3 size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteTusker(t.id, t.name)}
                                className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                title="Delete tusker"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: UNLISTED MONITORING */}
          {activeTab === 'unlisted' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Showing {filteredUnlisted.length} of {unlisted.length} unlisted records
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddUnlistedModal(true)}
                    className="flex-1 sm:flex-initial justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-light px-4 py-2.5 sm:py-2 rounded-lg transition-all shadow-sm border-none cursor-pointer whitespace-nowrap"
                  >
                    <PlusCircle size={15} className="shrink-0" />
                    <span>Add Unlisted Tusker</span>
                  </button>
                  <Link
                    to="/unlisted"
                    className="flex-1 sm:flex-initial justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2518] bg-[#0b2518]/10 hover:bg-[#0b2518]/15 px-4 py-2.5 sm:py-2 rounded-lg transition-all whitespace-nowrap"
                  >
                    <Radar size={15} className="shrink-0" />
                    <span>Open Monitoring Board</span>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Tracking Code</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Identifiable Marks</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && unlisted.length === 0 ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredUnlisted.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#7e9087]">
                          No unlisted records found.
                        </td>
                      </tr>
                    ) : (
                      filteredUnlisted.map((u) => {
                        const slug = encodeURIComponent(u.id.toLowerCase().replace(/\s+/g, '-'));
                        return (
                          <tr key={u.id} className="hover:bg-[#fbfcfb] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#0b2518]">{u.id}</td>
                            <td className="py-3 px-4 font-semibold text-[#182620]">{u.location || 'Undisclosed'}</td>
                            <td className="py-3 px-4 text-[#4a5c53]">{u.specialMarks || u.recordedBy || 'None recorded'}</td>
                            <td className="py-3 px-4 text-xs text-[#7e9087] max-w-[360px] truncate">
                              {u.description || 'Under monitoring.'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <Link
                                  to={`/unlisted/${slug}`}
                                  className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all inline-flex items-center justify-center"
                                  title="View unlisted profile"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUnlisted(u.id)}
                                  className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                                  title="Delete unlisted record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIAL OBSERVATIONS */}
          {activeTab === 'observations' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  {dataLoading && observations.length === 0 ? 'Loading observations…' : `Showing ${filteredObservations.length} of ${observations.length} special observations`}
                </span>
                <Link
                  to="/admin/add-observation"
                  className="w-full sm:w-auto justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2.5 sm:py-2 rounded-lg transition-all whitespace-nowrap"
                >
                  <PlusCircle size={15} />
                  <span>Add Observation</span>
                </Link>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Tusker</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && observations.length === 0 ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredObservations.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#7e9087]">
                          No observations found.
                        </td>
                      </tr>
                    ) : (
                      filteredObservations.map((o) => (
                        <tr key={o.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-[#7e9087] whitespace-nowrap">{o.date}</td>
                          <td className="py-3 px-4 font-semibold text-[#0b2518] whitespace-nowrap">{o.tuskerName}</td>
                          <td className="py-3 px-4 font-medium text-[#182620] max-w-[320px] truncate">{o.title}</td>
                          <td className="py-3 px-4 text-xs text-[#4a5c53]">{o.location}</td>
                          <td className="py-3 px-4 text-xs text-[#7e9087]">{o.author}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to="/observations"
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="View in feed"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                to={`/admin/edit-observation/${o.id}`}
                                className="p-1.5 rounded-lg text-[#d97706] hover:bg-[#fef3c7] transition-all"
                                title="Edit observation"
                              >
                                <Edit3 size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteObservation(o.id, o.title)}
                                className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                title="Delete observation"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS AND EVENTS */}
          {activeTab === 'events' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  {dataLoading && !events.upcoming?.length && !events.past?.length ? 'Loading events…' : `Showing ${combinedEvents.length} events`}
                </span>
                <Link
                  to="/admin/create-event"
                  className="w-full sm:w-auto justify-center text-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2.5 sm:py-2 rounded-lg transition-all whitespace-nowrap"
                >
                  <PlusCircle size={15} />
                  <span>Create Event</span>
                </Link>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">Date</th>
                      <th className="py-3 px-4 min-w-[105px] whitespace-nowrap">Type</th>
                      <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Title</th>
                      <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Shared By</th>
                      <th className="py-3 px-4 text-right min-w-[90px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && !events.upcoming?.length && !events.past?.length ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : combinedEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#7e9087]">
                          No events recorded.
                        </td>
                      </tr>
                    ) : (
                      combinedEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-[#7e9087] whitespace-nowrap">{e.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${e.eventCategory === 'Upcoming'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {e.eventCategory}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#182620]">{e.title}</td>
                          <td className="py-3 px-4 text-xs text-[#5a6c63]">{e.sharedBy || 'WTS Admin'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to="/projects"
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="View in feed"
                                aria-label="View in feed"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                to={`/admin/edit-event/${e.id}`}
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="Edit event"
                                aria-label="Edit event"
                              >
                                <Edit3 size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteEvent(e.id, e.title)}
                                aria-label="Delete event"
                                className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                title="Delete event"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FIELD NOTES & APPROVALS */}
          {activeTab === 'field-notes' && (
            <div className="p-6">
              {/* Pending Approvals Section */}
              {pendingNotes.length > 0 && (
                <div className="mb-8 p-5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={18} className="text-amber-700" />
                    <h3 className="font-bold text-amber-900 text-base m-0">
                      Pending Field Notes Awaiting Approval ({pendingNotes.length})
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 mb-4">
                    The following field notes were submitted by community contributors or researchers and require admin authorization before becoming visible to the public.
                  </p>

                  <div className="space-y-3">
                    {pendingNotes.map((pn) => (
                      <div
                        key={pn.id}
                        className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-[900px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#7e9087]">{pn.date}</span>
                            <span className="text-xs font-bold text-[#0b2518]">• By {pn.author || 'Anonymous'}</span>
                            {pn.tuskerId && (
                              <span className="text-xs px-2 py-0.5 rounded bg-[#f0f5f2] font-mono text-[#0b2518]">
                                {pn.tuskerId}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-[#182620]">{pn.title}</div>
                          <p className="text-xs text-[#4a5c53] line-clamp-2 m-0">{pn.description || pn.content}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveFieldNote(pn.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] px-3.5 py-2 rounded-lg transition-all border-none cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFieldNote(pn.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#dc2626] hover:bg-red-50 px-3 py-2 rounded-lg transition-all border border-red-200 bg-white cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Published Field Notes Section */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Published Field Notes {dataLoading && !approvedNotes.length ? '' : `(${approvedNotes.length})`}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Tusker</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && !approvedNotes.length && !pendingNotes.length ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : approvedNotes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#7e9087]">
                          No published field notes found.
                        </td>
                      </tr>
                    ) : (
                      approvedNotes.map((n) => (
                        <tr key={n.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-[#7e9087] whitespace-nowrap">{n.date}</td>
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0b2518]">
                            {n.tuskerId || 'General'}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#182620] max-w-[340px] truncate">{n.title}</td>
                          <td className="py-3 px-4 text-xs text-[#5a6c63]">{n.author}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to="/field-notes"
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="View in feed"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteFieldNote(n.id)}
                                className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                title="Delete note"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: THE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0b2518] m-0">Wild Tuskers Sri Lanka Gallery</h3>
                  <p className="text-sm text-[#5a6c63] mt-1 m-0">
                    Review community photo submissions, approve high-resolution photographs, and manage published gallery records.
                  </p>
                </div>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-light transition-all self-start sm:self-auto"
                >
                  <Eye size={14} />
                  <span>View Public Gallery</span>
                </Link>
              </div>

              {/* Pending Approvals Section if any */}
              {pendingGalleryPhotos.length > 0 && (
                <div className="mb-8 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <h4 className="font-sans text-sm font-bold text-amber-950 m-0">
                      Pending Photo Submissions ({pendingGalleryPhotos.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingGalleryPhotos.map((photo) => (
                      <div key={photo.id} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-xs flex flex-col justify-between">
                        <div className="aspect-[16/10] bg-black/5 overflow-hidden relative">
                          <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[0.7rem]">
                            Pending
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-sm text-[#111111] m-0">{photo.title}</h5>
                            <p className="text-xs text-[#666666] m-0 mt-1">
                              By <strong>{photo.photographer}</strong> {photo.location ? `• ${photo.location}` : ''}
                            </p>
                            {photo.tuskerName && (
                              <p className="text-xs text-accent font-semibold m-0 mt-0.5">{photo.tuskerName}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-[#f0f0f0]">
                            <button
                              onClick={() => setEditingGalleryPhoto(photo)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 cursor-pointer flex items-center gap-1 transition-colors"
                              title="Edit photo details (T-number, name, location)"
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleApprovePhoto(photo.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs border-none cursor-pointer flex items-center gap-1"
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectPhoto(photo.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs border-none cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Published Photos Table */}
              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Tusker / Location</th>
                      <th className="py-3 px-4">Photographer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && galleryPhotos.length === 0 ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-2 px-4 w-16"><div className="w-12 h-12 rounded-lg bg-gray-200" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredGallery.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#7e9087]">
                          No gallery photos found.
                        </td>
                      </tr>
                    ) : (
                      filteredGallery.map((item) => (
                        <tr key={item.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-2 px-4 w-16">
                            <div className="w-12 h-12 rounded-lg bg-black/5 overflow-hidden">
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#182620] max-w-[260px] truncate">{item.title}</td>
                          <td className="py-3 px-4 text-xs text-[#5a6c63]">
                            <div>{item.tuskerName || '-'}</div>
                            <div className="text-[#888888]">{item.location || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#5a6c63]">
                            <div>{item.photographer}</div>
                            <div className="text-[0.72rem] text-[#999999]">{item.date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold ${item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingGalleryPhoto(item)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all border-none bg-transparent cursor-pointer"
                                title="Edit photo details"
                              >
                                <Edit3 size={16} />
                              </button>
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleApprovePhoto(item.id)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePhoto(item.id)}
                                className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                title="Delete photo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* TAB 7: TEAM & ADMINS */}
          {activeTab === 'team' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1b2a22] m-0">Team &amp; Admin Members ({teamMembers.length})</h3>
                  <p className="text-xs text-[#6a7c73] mt-1 mb-0">
                    Manage the administrators and researchers displayed on the About Us page. Changes sync live with Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddTeamModal}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2.5 rounded-lg transition-all shadow-sm border-none cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle size={15} />
                  <span>Add Admin / Team Member</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4 w-16">Avatar</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Facebook</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {dataLoading && teamMembers.length === 0 ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-2.5 px-4"><div className="w-10 h-10 rounded-full bg-gray-200" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : teamMembers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#7e9087]">
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      teamMembers.map((member) => {
                        const cleanName = (member.name || '').replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '');
                        const words = cleanName.trim().split(/\s+/);
                        const initials = words.length >= 2
                          ? (words[0][0] + words[1][0]).toUpperCase()
                          : (member.name || 'WT').slice(0, 2).toUpperCase();

                        return (
                          <tr key={member.id || member.name} className="hover:bg-[#fbfcfb] transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="w-10 h-10 rounded-full bg-[#0b2518] text-[#c69b55] font-bold text-xs flex items-center justify-center overflow-hidden border border-[#dce4df] shrink-0">
                                {member.image ? (
                                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{initials}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#182620]">
                              {member.name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold bg-[#c69b55]/12 text-[#a07830] border border-[#c69b55]/30">
                                {member.role || 'Admin'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#5a6c63] font-mono">
                              #{member.displayOrder || 1}
                            </td>
                            <td className="py-3 px-4 text-xs text-[#5a6c63]">
                              {member.facebookUrl ? (
                                <a
                                  href={safeUrl(member.facebookUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                  <span>Profile Link</span>
                                  <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span className="text-[#aaaaaa]">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => openEditTeamModal(member)}
                                  className="p-1.5 rounded-lg text-[#0b2518] hover:bg-[#eef4f0] transition-all border-none bg-transparent cursor-pointer"
                                  title="Edit details"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeamMember(member)}
                                  className="p-1.5 rounded-lg text-[#dc2626] hover:bg-[#fee2e2] transition-all border-none bg-transparent cursor-pointer"
                                  title="Remove member"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Member Modal */}
      {showTeamModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={() => setShowTeamModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-[500px] w-full p-6 sm:p-8 shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 aspect-square">
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-[0.95rem] sm:text-lg font-bold text-gray-900 m-0 whitespace-nowrap truncate">
                      {editingTeamMember ? 'Edit Admin / Team Member' : 'Add New Admin / Team Member'}
                    </h3>
                    <p className="font-sans text-[0.72rem] sm:text-xs text-gray-500 m-0 whitespace-nowrap truncate">
                      Directly managed in database and displayed on About Us
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-1 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {teamFormError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-xs font-medium">
                  {teamFormError}
                </div>
              )}

              <form onSubmit={handleSaveTeamMember} className="flex flex-col gap-4">
                {/* Photo Upload with ImageUploadBox (Circle Mode) */}
                <div className="flex flex-col items-center justify-center mb-2">
                  <ImageUploadBox
                    circle
                    folder="team"
                    value={teamFormData.image}
                    onChange={(url) => setTeamFormData({ ...teamFormData, image: url })}
                  />
                  <span className="text-[0.72rem] text-gray-400 mt-1">Profile Photo (Optional)</span>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WTS Admin"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                  />
                </div>

                {/* Role & Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WTS Admin"
                      value={teamFormData.role}
                      onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={teamFormData.displayOrder}
                      onChange={(e) => setTeamFormData({ ...teamFormData, displayOrder: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                </div>

                {/* Facebook URL */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Facebook Profile Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/username"
                    value={teamFormData.facebookUrl}
                    onChange={(e) => setTeamFormData({ ...teamFormData, facebookUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(false)}
                    className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTeamMember}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-light rounded-lg border-none shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Save size={14} />
                    <span>{savingTeamMember ? 'Saving…' : 'Save Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      {/* Add Unlisted Tusker Modal */}
      {showAddUnlistedModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={() => setShowAddUnlistedModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-[540px] w-full p-6 sm:p-8 shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 aspect-square">
                    <Radar size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-[0.98rem] sm:text-lg font-bold text-gray-900 m-0 whitespace-nowrap truncate">
                      Add Unlisted Tusker
                    </h3>
                    <p className="font-sans text-[0.72rem] sm:text-xs text-gray-500 m-0 whitespace-nowrap truncate">
                      Create a provisional monitoring entry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUnlistedModal(false)}
                  className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-1 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {unlistedError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-xs font-medium">
                  {unlistedError}
                </div>
              )}

              <form onSubmit={handleSaveUnlisted} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Unlisted ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UNLISTED 011"
                      value={unlistedFormData.id}
                      onChange={(e) => setUnlistedFormData({ ...unlistedFormData, id: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Location *
                    </label>
                    <LocationSearchInput
                      required
                      placeholder="e.g. Yala, Galgamuwa, Minneriya"
                      value={unlistedFormData.location}
                      onChange={(e, val) => setUnlistedFormData({ ...unlistedFormData, location: val || e.target.value })}
                      className="w-full py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      First Spotted Date
                    </label>
                    <input
                      type="date"
                      value={unlistedFormData.listedDate}
                      onChange={(e) => setUnlistedFormData({ ...unlistedFormData, listedDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      First Sighted By
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WTS Admin"
                      value={unlistedFormData.recordedBy}
                      onChange={(e) => setUnlistedFormData({ ...unlistedFormData, recordedBy: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Special Marks &amp; Identifiers
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Broken left tusk tip, triangular tear on right ear"
                    value={unlistedFormData.specialMarks}
                    onChange={(e) => setUnlistedFormData({ ...unlistedFormData, specialMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Field Description / Observation Details *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Record initial sighting coordinates, estimated age, tusk shape, herd behavior..."
                    value={unlistedFormData.description}
                    onChange={(e) => setUnlistedFormData({ ...unlistedFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans resize-y"
                  />
                </div>

                {/* Direct Image Upload Box */}
                <ImageUploadBox
                  label="Direct Photo Upload"
                  folder="unlisted"
                  multiple
                  value={unlistedFormData.photos && unlistedFormData.photos.length > 0 ? unlistedFormData.photos : (unlistedFormData.photoUrl ? [unlistedFormData.photoUrl] : [])}
                  onChange={(urls) => {
                    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
                    setUnlistedFormData({ ...unlistedFormData, photos: list, photoUrl: list[0] || '' });
                  }}
                  aspectClass="aspect-[16/10]"
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUnlistedModal(false)}
                    className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUnlisted}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-light rounded-lg border-none shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Save size={14} />
                    <span>{savingUnlisted ? 'Saving…' : 'Save Unlisted Tusker'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Admin Edit Gallery Photo Modal */}
      {editingGalleryPhoto && (
        <EditGalleryPhotoModal
          photo={editingGalleryPhoto}
          onClose={() => setEditingGalleryPhoto(null)}
          onSave={async (id, updates) => {
            await updateGalleryPhoto(id, updates);
            setEditingGalleryPhoto(null);
            setNotification('Gallery photo details updated successfully.');
            // Reload gallery photos list
            const raw = await getGalleryPhotos({ admin: true });
            setGalleryPhotos(Array.isArray(raw) ? raw : []);
          }}
        />
      )}
    </div>
  );
}
