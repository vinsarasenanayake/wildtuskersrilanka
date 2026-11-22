/**
 * @file FieldNotes.jsx
 * @description Field Notes portal documenting on-the-ground encounters with Sri Lanka's wild tuskers.
 * Features community submissions, year-by-year archives, admin pending review & approval,
 * photo lightbox integration, and direct tusker profile links.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Clock,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';
import { useFieldNotesFeed } from '../../controllers/useFieldNotes';
import ImageLightboxModal from '../components/ImageLightboxModal';

export default function FieldNotes() {
  const navigate = useNavigate();
  const {
    notesByYear,
    availableYears,
    pendingNotes,
    isAdmin,
    approveNote,
    rejectNote,
    deleteNote
  } = useFieldNotesFeed();

  // Active view: either a specific year or 'pending' for admin review
  const [activeTab, setActiveTab] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Field Notes';
  }, []);

  // Set default active tab
  useEffect(() => {
    if (!activeTab) {
      if (isAdmin && pendingNotes.length > 0) {
        // Automatically default admin to review tab if there are pending notes
        setActiveTab('pending');
      } else if (availableYears.length > 0) {
        setActiveTab(availableYears[0]);
      }
    }
  }, [availableYears, activeTab, isAdmin, pendingNotes.length]);

  const handleApprove = (note) => {
    approveNote(note.id);
    setActionNotice({
      type: 'success',
      message: `"${note.title}" has been accepted and is now published publicly!`
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReject = (note) => {
    if (window.confirm(`Are you sure you want to delete this submission from "${note.author}"?`)) {
      rejectNote(note.id);
      setActionNotice({
        type: 'info',
        message: `Submission declined.`
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleDeleteApproved = (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNote(note.id);
      setActionNotice({
        type: 'info',
        message: `Field note deleted.`
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const isPendingView = activeTab === 'pending';
  const activeYearNotes = !isPendingView && activeTab ? notesByYear[activeTab] || [] : [];

  return (
    <div className="bg-[#f0f2f5] min-h-screen pt-[calc(80px+2.5rem)] pb-20">
      <div className="max-w-[1100px] mx-auto px-6 flex flex-col gap-6">

        {/* Action Notice Toast */}
        {actionNotice && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-gray-100 text-gray-800 border border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2.5 font-sans text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-5 text-left">
          <div className="flex-1">
            <h1 className="font-sans text-[1.8rem] font-bold text-[#111111] mb-2 tracking-wide">
              Field Notes On Wild Tuskers Sri Lanka
            </h1>
            <p className="font-sans text-[0.92rem] text-[#555555] leading-relaxed max-w-[760px] m-0">
              A <strong>Field Note</strong> documents an authentic, on-the-ground encounter with a wild tusker in its natural habitat, capturing details such as location, behavior, physical condition, and herd interactions. Anyone, including wildlife photographers, safari guides, researchers, and everyday visitors, can submit sightings and photos here. Once reviewed by our team, approved field notes are published to help monitor and safeguard Sri Lanka’s rare tuskers.
            </p>
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-3 flex-shrink-0 self-start">
              <button
                onClick={() => navigate('/add-field-note')}
                className="bg-accent text-primary font-semibold text-[0.88rem] px-5 py-2.5 rounded-[6px] inline-flex items-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap"
              >
                <PlusCircle size={16} />
                <span>Submit Field Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Admin Pending Review Banner (if on public tabs but pending notes exist) */}
        {isAdmin && pendingNotes.length > 0 && !isPendingView && (
          <div className="bg-amber-50 border border-amber-300 rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-200/80 flex items-center justify-center text-amber-800 flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-sans font-bold text-sm m-0">
                  {pendingNotes.length} Field Note{pendingNotes.length > 1 ? 's' : ''} Awaiting Your Review
                </p>
                <p className="font-sans text-xs text-amber-800/90 m-0">
                  Community submissions are hidden from the public until you review and accept them.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer border-none transition-colors whitespace-nowrap shadow-sm"
            >
              Review Now ({pendingNotes.length})
            </button>
          </div>
        )}

        {/* Tabs Bar - Only rendered when tabs exist */}
        {(availableYears.length > 0 || (isAdmin && pendingNotes.length > 0)) && (
          <div className="bg-white p-2 rounded-t-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.1)] flex flex-wrap items-center gap-1 border-b-[3px] border-[#d1d5db]">
            
            {/* Admin Review & Accept Tab */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('pending')}
                className={`font-sans text-[0.92rem] font-bold py-2.5 px-5 rounded-t-[8px] transition-all cursor-pointer border-none outline-none flex items-center gap-2 ${
                  isPendingView
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Review & Accept</span>
                {pendingNotes.length > 0 && (
                  <span className={`text-[0.72rem] font-extrabold px-2 py-0.5 rounded-full ${
                    isPendingView ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'
                  }`}>
                    {pendingNotes.length}
                  </span>
                )}
              </button>
            )}

            {/* Year Tabs */}
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setActiveTab(year)}
                className={`font-sans text-[0.95rem] font-bold py-2.5 px-6 rounded-t-[8px] transition-colors cursor-pointer border-none outline-none ${
                  activeTab === year
                    ? 'bg-[#f3f4f6] text-[#111111]' // Highlighted tab
                    : 'bg-[#4b5563] text-white hover:bg-[#374151]' // Gray tab
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}

        {/* 1. ADMIN REVIEW & ACCEPT VIEW */}
        {isPendingView ? (
          <div className="bg-[#f9fafb] rounded-b-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-10 -mt-6 border border-amber-200">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
              <div>
                <h2 className="font-sans text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
                  <ShieldCheck className="text-amber-600" size={24} />
                  Pending Submissions Awaiting Approval
                </h2>
                <p className="font-sans text-sm text-gray-600 mt-1 mb-0">
                  Accept submissions to publish them to the public field notes timeline. Rejected submissions will be discarded.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                {pendingNotes.length} Pending
              </span>
            </div>

            {pendingNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-sans text-lg font-bold text-gray-800 m-0">All Submissions Reviewed!</h3>
                <p className="font-sans text-sm text-gray-500 max-w-[420px] m-0">
                  There are no pending field notes waiting for admin review. New submissions will appear here automatically.
                </p>
                {availableYears.length > 0 && (
                  <button
                    onClick={() => setActiveTab(availableYears[0])}
                    className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-sans text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer border-none transition-colors"
                  >
                    View Published Field Notes ({availableYears[0]})
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {pendingNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white border-2 border-amber-200/80 rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Top Status Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-100 text-amber-800 font-sans text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          <Clock size={13} />
                          Awaiting Review
                        </span>
                        <span className="font-sans text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={13} />
                          Trip Date: <strong>{note.date}{note.time ? ` at ${note.time}` : ''}</strong>
                        </span>
                      </div>

                      {/* Submitter Info */}
                      <div className="flex items-center gap-3 font-sans text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <User size={13} className="text-gray-400" />
                          {note.author || 'Guest'}
                        </span>
                        {note.authorContact && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Mail size={13} className="text-gray-400" />
                            {note.authorContact}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3 className="font-sans text-lg font-bold text-gray-900 m-0 leading-snug">
                      {note.title}
                    </h3>

                    {/* Note Description */}
                    <div className="text-[#333333] font-sans text-[0.95rem] leading-[1.8] whitespace-pre-wrap bg-[#fbfbfb] p-4 rounded-lg border border-gray-100">
                      {note.description}
                    </div>

                    {/* Observed Tuskers */}
                    {note.specialNote && (
                      <div className="text-sm font-sans text-amber-900 bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg flex items-center gap-1.5">
                        <strong>Tuskers Observed:</strong>
                        <span>{note.specialNote}</span>
                      </div>
                    )}

                    {/* Photos */}
                    {note.images && note.images.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Submitted Photos ({note.images.length})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {note.images.map((img, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                setActiveLightboxPhoto({
                                  imageUrl: img,
                                  title: note.title,
                                  tuskerName: note.specialNote || note.title,
                                  specialNote: note.specialNote,
                                  description: note.description,
                                  location: note.location,
                                  date: note.date,
                                  author: note.author,
                                  status: 'pending',
                                  id: note.id,
                                  note: note,
                                })
                              }
                              className="rounded-lg overflow-hidden aspect-[4/3] bg-black/5 cursor-pointer group relative border border-gray-200"
                            >
                              <img
                                src={img}
                                alt={`Submission Photo ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ExternalLink size={18} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Actions Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                      <button
                        onClick={() => handleReject(note)}
                        className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-sans text-xs font-semibold px-4 py-2.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Decline & Discard</span>
                      </button>
                      <button
                        onClick={() => handleApprove(note)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold px-5 py-2.5 rounded-lg inline-flex items-center gap-2 cursor-pointer border-none shadow-sm transition-all hover:shadow"
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept & Publish to {new Date(note.date).getFullYear()}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 2. PUBLIC APPROVED NOTES TIMELINE VIEW */
          activeTab && (
            <div className="bg-[#f3f4f6] rounded-b-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-10 -mt-6">
              {activeYearNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 gap-4 bg-white rounded-[12px]">
                  <div className="text-[#aaaaaa]">
                    <FileText size={56} strokeWidth={1.2} />
                  </div>
                  <p className="font-sans text-[0.95rem] text-[#888888] m-0">
                    No approved field notes available for {activeTab}.
                  </p>
                </div>
              ) : (
                activeYearNotes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`flex flex-col gap-4 ${index !== 0 ? 'mt-10 pt-10 border-t border-[#d1d5db]' : ''}`}
                  >
                    
                    {/* Header with Title and Admin Delete */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#111111] font-bold mt-1.5 text-[0.7rem]">&#9679;</span>
                        <div>
                          <h2 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0 leading-relaxed">
                            {note.title}
                          </h2>
                          <div className="flex items-center gap-3 mt-1 font-sans text-xs text-gray-500">
                            <span>Date: <strong>{note.date}{note.time ? ` at ${note.time}` : ''}</strong></span>
                            <span>•</span>
                            <span>Recorded by: <strong className="text-gray-700">{note.author || 'WTS Admin'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Delete Action on Approved Notes */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteApproved(note)}
                          title="Delete Note"
                          className="text-gray-400 hover:text-rose-600 bg-none border-none p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <div className="pl-5 text-[#222222] font-sans text-[0.95rem] leading-[1.8] whitespace-pre-wrap">
                      {note.description}
                    </div>

                    {/* Observed Tuskers */}
                    {note.specialNote && (
                      <div className="pl-5 mt-1 text-[#222222] font-sans text-[0.92rem] leading-[1.7] bg-[#faf5ec]/70 p-3 rounded-lg border-l-3 border-accent">
                        <strong className="text-accent font-bold">Tuskers Observed: </strong>
                        <span>{note.specialNote}</span>
                      </div>
                    )}

                    {/* Images */}
                    {note.images && note.images.length > 0 && (
                      <div className="pl-5 mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {note.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() =>
                              setActiveLightboxPhoto({
                                imageUrl: img,
                                title: note.title,
                                tuskerName: note.specialNote || note.title,
                                specialNote: note.specialNote,
                                description: note.description,
                                location: note.location,
                                date: note.date,
                                author: note.author,
                                id: note.id,
                                note: note,
                              })
                            }
                            className="rounded-[6px] overflow-hidden aspect-[4/3] bg-black/5 cursor-pointer group relative shadow-sm"
                          >
                            <img
                              src={img}
                              alt={`Field Note ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ExternalLink size={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                  </div>
                ))
              )}
            </div>
          )
        )}

        {/* Empty overall fallback */}
        {!isPendingView && availableYears.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 bg-white rounded-[12px] shadow-sm text-center">
            <div className="text-[#aaaaaa]">
              <FileText size={56} strokeWidth={1.2} />
            </div>
            <h3 className="font-sans text-lg font-bold text-gray-800 m-0">No Field Notes Published Yet</h3>
            <p className="font-sans text-[0.95rem] text-[#888888] max-w-[420px] m-0">
              {isAdmin
                ? 'Community submissions will appear here once submitted and approved by admin.'
                : 'Be the first to submit a field note observation! Anyone can submit and reports will appear here after admin review.'}
            </p>
            {!isAdmin && (
              <button
                onClick={() => navigate('/add-field-note')}
                className="mt-2 bg-accent text-primary font-semibold text-[0.88rem] px-5 py-2.5 rounded-[6px] inline-flex items-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors"
              >
                <PlusCircle size={16} />
                <span>Submit First Field Note</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Image Lightbox Modal with Zoom, Admin Moderation & Tusker Profiles */}
      {activeLightboxPhoto && (
        <ImageLightboxModal
          photo={activeLightboxPhoto}
          isAdmin={isAdmin}
          onApprove={
            activeLightboxPhoto.status === 'pending'
              ? () => {
                  const noteToApprove = activeLightboxPhoto.note;
                  setActiveLightboxPhoto(null);
                  handleApprove(noteToApprove);
                }
              : undefined
          }
          onDelete={() => {
            const noteObj = activeLightboxPhoto.note;
            const noteId = activeLightboxPhoto.id;
            setActiveLightboxPhoto(null);
            if (activeLightboxPhoto.status === 'pending') {
              rejectNote(noteId);
            } else {
              handleDeleteApproved(noteObj);
            }
          }}
          onClose={() => setActiveLightboxPhoto(null)}
          fromPath="/field-notes"
        />
      )}

    </div>
  );
}
