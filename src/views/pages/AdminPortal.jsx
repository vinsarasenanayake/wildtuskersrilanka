import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, PlusCircle, Trash2, Edit3, Eye, FileText, Binoculars, Calendar,
  Radar, Database, CheckCircle2, XCircle, Search, ArrowUpRight, LogOut, RefreshCw, AlertCircle
} from 'lucide-react';
import { getTuskers, deleteTusker } from '../../models/TuskerModel';
import { getUnlistedTuskers } from '../../models/UnlistedTuskersModel';
import { getSpecialObservations, deleteSpecialObservation } from '../../models/SpecialObservationsModel';
import { getEvents, deleteEvent } from '../../models/ProjectModel';
import { getFieldNotes, approveFieldNote, rejectFieldNote } from '../../models/FieldNotesModel';
import { useAuth } from '../../controllers/useAuth';

/* ==============================================================
   CENTRAL ADMINISTRATIVE CONSOLE COMPONENT
============================================================== */
export default function AdminPortal() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('tuskers');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Data states
  const [tuskers, setTuskers] = useState([]);
  const [unlisted, setUnlisted] = useState([]);
  const [observations, setObservations] = useState([]);
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [fieldNotes, setFieldNotes] = useState({ approved: [], pending: [] });

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Admin Portal';
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const loadAllData = () => {
    setTuskers(getTuskers());
    setUnlisted(getUnlistedTuskers());
    setObservations(getSpecialObservations());
    setEvents(getEvents());
    const rawNotes = getFieldNotes();
    const notesArray = Array.isArray(rawNotes) ? rawNotes : [];
    setFieldNotes({
      approved: notesArray.filter(n => n.status === 'approved'),
      pending: notesArray.filter(n => n.status === 'pending'),
    });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // CRUD Handlers
  const handleDeleteTusker = (id, name) => {
    if (window.confirm(`Are you sure you want to delete Tusker ${id} (${name})? This action cannot be undone.`)) {
      deleteTusker(id);
      loadAllData();
      showToast(`Tusker ${id} was deleted successfully.`);
    }
  };

  const handleDeleteObservation = (id, title) => {
    if (window.confirm(`Are you sure you want to delete observation "${title}"?`)) {
      deleteSpecialObservation(id);
      loadAllData();
      showToast('Special observation was deleted successfully.');
    }
  };

  const handleDeleteEvent = (id, title) => {
    if (window.confirm(`Are you sure you want to delete event "${title}"?`)) {
      deleteEvent(id);
      loadAllData();
      showToast('Event was deleted successfully.');
    }
  };

  const handleApproveFieldNote = (id) => {
    approveFieldNote(id);
    loadAllData();
    showToast('Field note approved and published to public feed.');
  };

  const handleDeleteFieldNote = (id) => {
    if (window.confirm('Are you sure you want to delete this field note?')) {
      rejectFieldNote(id);
      loadAllData();
      showToast('Field note removed.');
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1f2824] pt-[95px] pb-24">
      {/* Top Banner / Header */}
      <div className="w-full bg-[#0b2518] text-white py-10 px-6 sm:px-10 lg:px-16 shadow-lg mb-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#d4af37] text-xs font-semibold tracking-wider uppercase mb-3">
              <Shield size={14} />
              <span>WTS Central Administrative Console</span>
            </div>
            <h1 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-bold tracking-tight text-white m-0">
              Admin Portal
            </h1>
            <p className="text-[#a4b8af] text-sm sm:text-base mt-2 max-w-[680px] leading-relaxed">
              Consolidated registry control center. Manage wild tuskers, unlisted sightings, field observations, project events, and community field notes from a single command portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-lg border border-white/15 transition-all flex items-center gap-2"
            >
              <Eye size={16} />
              <span>View Live Website</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none shadow-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
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

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div
            onClick={() => setActiveTab('tuskers')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'tuskers'
                ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
                : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Wild Tuskers</span>
              <Database size={18} className="text-[#0b2518]" />
            </div>
            <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{tuskers.length}</div>
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Documented profiles</p>
          </div>

          <div
            onClick={() => setActiveTab('unlisted')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'unlisted'
                ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
                : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Unlisted</span>
              <Radar size={18} className="text-[#0b2518]" />
            </div>
            <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{unlisted.length}</div>
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Under monitoring</p>
          </div>

          <div
            onClick={() => setActiveTab('observations')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'observations'
                ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
                : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Observations</span>
              <Binoculars size={18} className="text-[#0b2518]" />
            </div>
            <div className="font-serif text-3xl font-extrabold text-[#0b2518]">{observations.length}</div>
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Field observations</p>
          </div>

          <div
            onClick={() => setActiveTab('events')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
                : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Events</span>
              <Calendar size={18} className="text-[#0b2518]" />
            </div>
            <div className="font-serif text-3xl font-extrabold text-[#0b2518]">
              {(events.upcoming?.length || 0) + (events.past?.length || 0)}
            </div>
            <p className="text-xs text-[#8a9b92] mt-1 mb-0">Past and upcoming</p>
          </div>

          <div
            onClick={() => setActiveTab('field-notes')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'field-notes'
                ? 'bg-white border-[#0b2518] shadow-md ring-2 ring-[#0b2518]/10'
                : 'bg-white border-[#e2e8e4] hover:border-[#c8d4ce]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6a7c73] uppercase tracking-wider">Field Notes</span>
              <FileText size={18} className="text-[#0b2518]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-extrabold text-[#0b2518]">{approvedNotes.length}</span>
              {pendingNotes.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingNotes.length} pending
                </span>
              )}
            </div>
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

            <Link
              to="/add-field-note"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0b2518] hover:bg-[#16402b] text-white transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm leading-tight">Publish Field Note</div>
                <div className="text-[0.75rem] text-white/70 truncate">Write direct note</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs and Search */}
        <div className="bg-white rounded-2xl border border-[#e2e8e4] shadow-sm overflow-hidden mb-12">
          {/* Tabs Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#edf2ef] px-6 pt-4 pb-3 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('tuskers')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'tuskers'
                    ? 'bg-[#0b2518] text-white shadow-sm'
                    : 'text-[#56685f] hover:bg-[#f0f5f2]'
                }`}
              >
                Wild Tuskers ({tuskers.length})
              </button>

              <button
                onClick={() => setActiveTab('unlisted')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'unlisted'
                    ? 'bg-[#0b2518] text-white shadow-sm'
                    : 'text-[#56685f] hover:bg-[#f0f5f2]'
                }`}
              >
                Unlisted Monitoring ({unlisted.length})
              </button>

              <button
                onClick={() => setActiveTab('observations')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'observations'
                    ? 'bg-[#0b2518] text-white shadow-sm'
                    : 'text-[#56685f] hover:bg-[#f0f5f2]'
                }`}
              >
                Special Observations ({observations.length})
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'bg-[#0b2518] text-white shadow-sm'
                    : 'text-[#56685f] hover:bg-[#f0f5f2]'
                }`}
              >
                Projects and Events ({combinedEvents.length})
              </button>

              <button
                onClick={() => setActiveTab('field-notes')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'field-notes'
                    ? 'bg-[#0b2518] text-white shadow-sm'
                    : 'text-[#56685f] hover:bg-[#f0f5f2]'
                }`}
              >
                <span>Field Notes ({approvedNotes.length + pendingNotes.length})</span>
                {pendingNotes.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8fa298]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#dde6e1] bg-[#f9fbf9] text-sm text-[#1f2824] focus:outline-none focus:border-[#0b2518] focus:ring-1 focus:ring-[#0b2518]"
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Showing {filteredTuskers.length} of {tuskers.length} tuskers
                </span>
                <Link
                  to="/admin/add-tusker"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2 rounded-lg transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Add Tusker</span>
                </Link>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Tusker ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Listed Date</th>
                      <th className="py-3 px-4">Sightings</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {filteredTuskers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#7e9087]">
                          No tuskers found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredTuskers.map((t) => (
                        <tr key={t.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0b2518]">{t.id}</td>
                          <td className="py-3 px-4 font-semibold text-[#182620]">
                            {t.name} <span className="text-xs text-[#7e9087] font-normal">({t.sinhala || 'N/A'})</span>
                          </td>
                          <td className="py-3 px-4 text-[#4a5c53]">{t.location || 'Unknown'}</td>
                          <td className="py-3 px-4 text-[#7e9087] text-xs">{t.listedDate || 'Unspecified'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-[#eef5f1] text-[#0b2518] font-bold text-xs">
                              {t.sightings?.length || 0} sightings
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to={`/tuskers/${t.id.toLowerCase()}`}
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Showing {filteredUnlisted.length} of {unlisted.length} unlisted records
                </span>
                <Link
                  to="/unlisted"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2 rounded-lg transition-all"
                >
                  <Radar size={15} />
                  <span>Open Monitoring Board</span>
                </Link>
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
                    {filteredUnlisted.length === 0 ? (
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
                              <Link
                                to={`/unlisted/${slug}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0b2518]/8 text-[#0b2518] hover:bg-[#0b2518] hover:text-white transition-all"
                              >
                                <span>Inspect Profile</span>
                                <ArrowUpRight size={14} />
                              </Link>
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Showing {filteredObservations.length} of {observations.length} special observations
                </span>
                <Link
                  to="/admin/add-observation"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2 rounded-lg transition-all"
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
                    {filteredObservations.length === 0 ? (
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#5a6c63]">
                  Showing {combinedEvents.length} events
                </span>
                <Link
                  to="/admin/create-event"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2 rounded-lg transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Create Event</span>
                </Link>
              </div>

              <div className="overflow-x-auto border border-[#e8eee9] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f4f7f5] text-[#4d5f56] text-xs font-bold uppercase tracking-wider border-b border-[#e8eee9]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Shared By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f0]">
                    {combinedEvents.length === 0 ? (
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
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                e.eventCategory === 'Upcoming'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {e.eventCategory}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#182620]">{e.title}</td>
                          <td className="py-3 px-4 text-xs text-[#5a6c63]">{e.sharedBy || 'WTS Team'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                to="/projects"
                                className="p-1.5 rounded-lg text-[#5a6c63] hover:text-[#0b2518] hover:bg-[#eef3f0] transition-all"
                                title="View in feed"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteEvent(e.id, e.title)}
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
                  Published Field Notes ({approvedNotes.length})
                </span>
                <Link
                  to="/add-field-note"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0b2518] hover:bg-[#16402b] px-4 py-2 rounded-lg transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Write Field Note</span>
                </Link>
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
                    {approvedNotes.length === 0 ? (
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
        </div>
      </div>
    </div>
  );
}
