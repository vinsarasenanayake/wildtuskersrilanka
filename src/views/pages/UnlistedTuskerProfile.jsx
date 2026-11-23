/**
 * @file UnlistedTuskerProfile.jsx
 * @description Dossier view for an unlisted tusker under monitoring.
 * Features photo comparison galleries, ear-notch milestones, notes, and admin record controls.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  User,
  UserCheck,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  Camera,
  Maximize2,
  X,
  Trash2,
  Scan,
  ShieldCheck,
  Edit3,
  Save
} from 'lucide-react';
import { getUnlistedTuskerById, deleteUnlistedTusker, updateUnlistedTusker } from '../../models/UnlistedTuskersModel';
import { getTuskerComparison, getTuskerEarComparison } from '../../models/TuskerModel';
import { useAuth } from '../../controllers/useAuth';
import { getCachedAspect, setCachedAspect, probeImageAspect } from '../../utils/photoAspectCache';
import ImageUploadBox from '../components/ImageUploadBox';
import LocationSearchInput from '../components/LocationSearchInput';
import PhotoWatermarkBadge from '../components/PhotoWatermarkBadge';

/* ── Photo Slideshow Component ───────────────────────────────── */
function PhotoSlideshow({ photos = [], id, current, prev, next, setCurrent }) {
  const photoList = photos && photos.length > 0 ? photos : [null];
  const currentPhoto = photoList[current];
  const [isPortrait, setIsPortrait] = useState(() => {
    const cached = getCachedAspect(currentPhoto);
    return cached !== null ? cached : false;
  });
  const imgRef = useRef(null);

  useEffect(() => {
    if (!currentPhoto) {
      setIsPortrait(false);
      return;
    }

    const cached = getCachedAspect(currentPhoto);
    if (cached !== null) {
      setIsPortrait(cached);
      return;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0 && imgRef.current.naturalHeight > 0) {
      const portrait = imgRef.current.naturalHeight > imgRef.current.naturalWidth;
      setCachedAspect(currentPhoto, portrait);
      setIsPortrait(portrait);
      return;
    }

    probeImageAspect(currentPhoto, (portrait) => {
      setIsPortrait(portrait);
    });
  }, [currentPhoto]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const portrait = naturalHeight > naturalWidth;
      setCachedAspect(currentPhoto, portrait);
      setIsPortrait(portrait);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-[820px]:sticky min-[820px]:top-[calc(80px+1.5rem)]">
      <div
        className={`relative w-full rounded-[14px] overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm ${
          !currentPhoto
            ? 'aspect-[4/3] bg-[#eef1ee] border border-[#e2e8e3]'
            : isPortrait
              ? 'aspect-[3/4] bg-[#eef1ee] border border-[#e2e8e3]'
              : 'aspect-[4/3] bg-[#eef1ee] border border-[#e2e8e3]'
        }`}
      >
        {currentPhoto ? (
          <img
            ref={(el) => {
              imgRef.current = el;
              if (el && el.complete && el.naturalWidth > 0 && el.naturalHeight > 0) {
                const portrait = el.naturalHeight > el.naturalWidth;
                setCachedAspect(currentPhoto, portrait);
                setIsPortrait((prev) => (prev !== portrait ? portrait : prev));
              }
            }}
            src={currentPhoto}
            alt={`${id} photo ${current + 1}`}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover object-center rounded-[14px]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0b2518]/10 text-[#0b2518] flex items-center justify-center mb-2.5">
              <Camera size={28} className="opacity-70" />
            </div>
            <span className="font-sans text-[1.4rem] font-bold text-[#444444] tracking-wider mb-1">
              {id}
            </span>
            <span className="font-sans text-[0.82rem] text-[#888888]">
              Provisional photographic record
            </span>
          </div>
        )}

        {/* Top-Left WTS Brand Watermark */}
        {currentPhoto && <PhotoWatermarkBadge size="md" />}

        {photoList.length > 1 && (
          <>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] left-3 border-none"
              onClick={() => prev(photoList.length)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] right-3 border-none"
              onClick={() => next(photoList.length)}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3.5 bg-black/55 text-white font-sans text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-full z-[2]">
          {current + 1} / {photoList.length}
        </span>
      </div>

      {/* Dot navigation */}
      {photoList.length > 1 && (
        <div className="flex justify-center gap-2">
          {photoList.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full bg-[#dddddd] transition-all hover:bg-[#bbbbbb] p-0 border-none outline-none ${
                i === current ? 'bg-accent! scale-130' : ''
              }`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Detail Row Component ────────────────────────────────────── */
function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-[34px] h-[34px] rounded-[8px] bg-[#faf5ec] flex items-center justify-center text-accent shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-[0.75rem] font-semibold text-[#aaaaaa] uppercase tracking-[0.6px]">
          {label}
        </span>
        <span className="font-sans text-[0.92rem] font-medium text-[#222222] leading-6">
          {value}
        </span>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

/* ── Main Unlisted Profile Page ──────────────────────────────── */
export default function UnlistedTuskerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, authLoading } = useAuth();

  const [tusker, setTusker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedComparisonImg, setSelectedComparisonImg] = useState(null);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    let active = true;
    setLoading(true);
    getUnlistedTuskerById(id)
      .then(data => {
        if (!active) return;
        setTusker(data);
        if (data) {
          document.title = `Wild Tuskers Sri Lanka | ${data.id}`;
        }
      })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, authLoading, isAdmin]);

  const prevPhoto = (count) => {
    setCurrentPhotoIndex(p => (p === 0 ? count - 1 : p - 1));
  };

  const nextPhoto = (count) => {
    setCurrentPhotoIndex(p => (p === count - 1 ? 0 : p + 1));
  };

  const comparisonList = useMemo(() => {
    if (!tusker) return [];
    return getTuskerComparison(tusker);
  }, [tusker]);

  const earComparisonList = useMemo(() => {
    if (!tusker) return [];
    return getTuskerEarComparison(tusker);
  }, [tusker]);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFormData, setEditFormData] = useState({
    location: '',
    listedDate: '',
    recordedBy: '',
    specialMarks: '',
    description: '',
    photos: []
  });

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.location.trim()) {
      setEditError('Please enter a location.');
      return;
    }
    setSavingEdit(true);
    setEditError('');
    try {
      const updated = await updateUnlistedTusker(tusker.id, {
        location: editFormData.location.trim(),
        listedDate: editFormData.listedDate,
        recordedBy: editFormData.recordedBy.trim(),
        specialMarks: editFormData.specialMarks.trim(),
        description: editFormData.description.trim(),
        photos: editFormData.photos || []
      });
      if (updated) {
        setTusker(updated);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      setEditError(err.message || 'Failed to update record.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${tusker.id} from Unlisted Monitoring?`)) {
      try {
        await deleteUnlistedTusker(tusker.id);
        navigate('/unlisted');
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  // Admin access protection
  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="w-full min-h-[70vh] pt-[calc(80px+4rem)] flex items-center justify-center font-sans text-[#888888]">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-[800px] mx-auto pt-[calc(80px+4rem)] pb-20 px-8 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/30">
          <ShieldAlert size={32} />
        </div>
        <h1 className="font-sans text-[2rem] font-bold text-[#111111] mb-2">Admin Access Required</h1>
        <p className="font-sans text-[#666666] max-w-[480px] mb-8 text-[0.95rem] leading-relaxed">
          Unlisted Monitoring profiles are internal administrative records and are not available for public view.
        </p>
        <Link
          to="/login"
          className="bg-primary hover:bg-primary-light text-white font-semibold text-[0.92rem] px-7 py-3 rounded-[8px] transition-all shadow-md"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  if (!tusker) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 font-sans text-[#888888] pt-[80px]">
        <h2 className="text-xl font-bold text-[#333333]">Unlisted Tusker record not found</h2>
        <button
          className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-8 transition-colors hover:text-accent"
          onClick={() => navigate('/unlisted')}
        >
          <ArrowLeft size={16} /> Back to Unlisted Monitoring
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Top Bar: Back & Actions */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 transition-colors hover:text-accent"
            onClick={() => navigate('/unlisted')}
          >
            <ArrowLeft size={16} /> Back to Unlisted Monitoring
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                setEditFormData({
                  location: tusker.location || '',
                  listedDate: tusker.listedDate || '',
                  recordedBy: tusker.recordedBy || '',
                  specialMarks: tusker.specialMarks || '',
                  description: tusker.description || '',
                  photos: tusker.photos || []
                });
                setEditError('');
                setShowEditModal(true);
              }}
              className="bg-primary text-white font-sans text-xs sm:text-[0.85rem] font-semibold rounded-[8px] px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-xs hover:bg-primary-light transition-all cursor-pointer inline-flex items-center gap-1.5 border-none"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleDelete}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans text-xs sm:text-[0.85rem] font-semibold rounded-[8px] px-3.5 sm:px-4 py-1.5 sm:py-2 border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Record</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Slideshow, Right Detail Card */}
        <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-8 min-[820px]:gap-14 items-start">

          {/* LEFT - Slideshow */}
          <div>
            <PhotoSlideshow
              photos={tusker.photos}
              id={tusker.id}
              current={currentPhotoIndex}
              prev={prevPhoto}
              next={nextPhoto}
              setCurrent={setCurrentPhotoIndex}
            />
          </div>

          {/* RIGHT - Info */}
          <div className="flex flex-col gap-5">

            {/* Unlisted ID Title Block (NO tusker name, NO sinhala name) */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-[0.75rem] tracking-wider uppercase mb-2">
                <Scan size={12} />
                <span>Provisional Field Record</span>
              </div>
              <h1 className="font-sans text-[1.65rem] sm:text-[2rem] min-[820px]:text-[2.4rem] font-extrabold text-[#111111] leading-tight m-0">
                {tusker.id}
              </h1>
            </div>

            <div className="h-px bg-[#f0f0f0]" />

            {/* Detail rows */}
            <div className="flex flex-col gap-4">
              <DetailRow
                icon={<MapPin size={16} />}
                label="Location"
                value={tusker.location}
              />
              <DetailRow
                icon={<User size={16} />}
                label="First Recorded By"
                value={tusker.recordedBy || 'WTS Admin'}
              />
              {/* Nickname Suggested By: Always 'Unlisted' as requested */}
              <DetailRow
                icon={<UserCheck size={16} />}
                label="Nickname Suggested By"
                value="Unlisted"
              />
              <DetailRow
                icon={<Calendar size={16} />}
                label="First Recorded Date"
                value={formatDate(tusker.listedDate)}
              />
              <DetailRow
                icon={<Tag size={16} />}
                label="Special Marks"
                value={
                  <div className="flex flex-col gap-1">
                    <span>{tusker.specialMarks || 'Under field monitoring.'}</span>
                    {tusker.specialWounds && tusker.specialWounds !== 'None recorded.' && (
                      <span className="text-[0.88rem] text-[#555555]">
                        <strong className="text-[#222222] font-semibold">Wounds: </strong>
                        {tusker.specialWounds}
                      </span>
                    )}
                  </div>
                }
              />
              <DetailRow
                icon={<ShieldCheck size={16} />}
                label="Monitoring Status"
                value="Unlisted • Active Observation Registry"
              />
            </div>
          </div>
        </div>

        {/* PHOTOGRAPHIC COMPARISON (3x1 Horizontal Collage) */}
        {comparisonList && comparisonList.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#eeeeee]">
            <div className="mb-8">
              <h2 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">
                Photographic Comparison
              </h2>
              <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[760px] leading-relaxed">
                Sequential photo comparison tracking baseline identification against observations over 3-5 year intervals to monitor tusk growth, breakages, ear tears, and distinct physical changes.
              </p>
            </div>

            {/* 3x1 Collage in One Horizontal Row - All 3 boxes identical */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-white border-b border-[#f0f0f0] flex items-center justify-between">
                    <span className="font-sans text-[0.82rem] font-bold text-[#555555]">
                      {item.stage || `Stage ${index + 1}`}
                    </span>
                    <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{item.year}</span>
                    </span>
                  </div>

                  {/* Photo Card */}
                  <div
                    onClick={() => item.photo && setSelectedComparisonImg(item)}
                    className={`relative w-full aspect-[4/3] bg-[#eef1ee] overflow-hidden flex items-center justify-center ${
                      item.photo ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {item.photo ? (
                      <>
                        <img
                          src={item.photo}
                          alt={`${tusker.id} ${item.year}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-sans text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>Click to Enlarge</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8faf9] to-[#edf3ef]">
                        <div className="w-12 h-12 rounded-full bg-[#0b2518]/10 text-[#0b2518] flex items-center justify-center mb-2">
                          <Camera size={22} className="opacity-70" />
                        </div>
                        <span className="font-sans text-xs font-bold text-[#2d4036] uppercase tracking-wider mb-1">
                          {tusker.id} • {item.year}
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#6b7c73] max-w-[200px] leading-tight">
                          {item.stage} Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sentence Below the Photo */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="font-sans text-[0.85rem] text-[#2c3330] leading-[1.65] m-0 font-medium">
                      {item.sentence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EAR COMPARISON COLLAGE */}
        {earComparisonList && earComparisonList.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#eeeeee]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
              <div>
                <h2 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">
                  Ear Margin & Biometric Comparison
                </h2>
                <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[760px] leading-relaxed">
                  High-resolution ear venation, tears, notch contours, and lobe folding diagnostics used as permanent biometric field identification markers.
                </p>
              </div>
            </div>

            {/* Ear Diagnostic Cards (2 boxes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earComparisonList.slice(0, 2).map((earItem, earIdx) => (
                <div
                  key={earIdx}
                  className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all"
                >
                  <div className="px-4 py-3 bg-white border-b border-[#f0f0f0] flex items-center justify-between">
                    <span className="font-sans text-[0.88rem] font-bold text-[#222222] flex items-center gap-2">
                      <Scan size={15} className="text-accent" />
                      <span>{earItem.title}</span>
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Diagnostic Profile
                    </span>
                  </div>

                  <div
                    onClick={() => earItem.photo && setSelectedComparisonImg({ photo: earItem.photo, year: earItem.title, sentence: earItem.summary })}
                    className={`relative w-full aspect-[16/10] bg-[#eef1ee] overflow-hidden flex items-center justify-center ${
                      earItem.photo ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {earItem.photo ? (
                      <>
                        <img
                          src={earItem.photo}
                          alt={`${tusker.id} ${earItem.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-sans text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>Click to Enlarge</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8faf9] to-[#edf3ef]">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-2">
                          <Scan size={22} className="opacity-70" />
                        </div>
                        <span className="font-sans text-xs font-bold text-[#2d4036] uppercase tracking-wider mb-1">
                          {tusker.id} • {earItem.title}
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#6b7c73] max-w-[240px] leading-tight">
                          Ear pinna & vascular profile diagnostic
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <p className="font-sans text-[0.85rem] font-semibold text-[#111111] mb-1">
                        Diagnostic Markers:
                      </p>
                      <p className="font-sans text-[0.82rem] text-[#555555] leading-relaxed m-0">
                        {earItem.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f5f5f5] flex items-center justify-between text-[0.75rem] text-[#888888]">
                      <span>Biometric Reliability: High</span>
                      <span className="text-emerald-700 font-semibold">Stable ID Feature</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for enlarged comparison photo */}
        {selectedComparisonImg && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in select-none"
            onClick={() => setSelectedComparisonImg(null)}
          >
            <div
              className="relative max-w-[900px] w-full bg-[#111111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl my-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-black/60 flex items-center justify-between text-white border-b border-white/10">
                <span className="font-sans text-sm font-bold text-accent">
                  {tusker.id} • {selectedComparisonImg.year}
                </span>
                <button
                  onClick={() => setSelectedComparisonImg(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center bg-black lightbox-mobile-landscape-inner">
                <img
                  src={selectedComparisonImg.photo}
                  alt={tusker.id}
                  className="max-h-[70vh] w-auto max-w-full object-contain lightbox-mobile-landscape-img"
                />
              </div>

              {selectedComparisonImg.sentence && (
                <div className="p-4 bg-[#181818] text-white/90 text-sm border-t border-white/10">
                  <p className="m-0 leading-relaxed font-sans">{selectedComparisonImg.sentence}</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

        {/* Modal for Editing Unlisted Tusker Profile */}
        {showEditModal && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="bg-white rounded-[20px] max-w-[620px] w-full p-6 sm:p-7 shadow-2xl border border-[#e8e8e8] flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
                <div className="min-w-0 flex-1 mr-2">
                  <h3 className="font-sans text-[1.05rem] sm:text-[1.25rem] font-bold text-[#111111] m-0 whitespace-nowrap truncate">Edit Unlisted Profile</h3>
                  <p className="font-sans text-[0.74rem] sm:text-[0.82rem] text-[#888888] m-0 mt-0.5 whitespace-nowrap truncate">{tusker.id} • Active Observation</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full border-none bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#555555] cursor-pointer flex items-center justify-center transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Roaming Location *</label>
                    <LocationSearchInput
                      required
                      value={editFormData.location}
                      onChange={(e, val) => setEditFormData({ ...editFormData, location: val || e.target.value })}
                      placeholder="e.g. Yala Block 3"
                      className="border border-[#dde6e1] rounded-xl py-2.5 text-sm text-[#111111] focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Recorded Date</label>
                    <input
                      type="date"
                      value={editFormData.listedDate}
                      onChange={(e) => setEditFormData({ ...editFormData, listedDate: e.target.value })}
                      className="border border-[#dde6e1] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Recorded By</label>
                    <input
                      type="text"
                      value={editFormData.recordedBy}
                      onChange={(e) => setEditFormData({ ...editFormData, recordedBy: e.target.value })}
                      placeholder="e.g. WTS Admin"
                      className="border border-[#dde6e1] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Special Marks</label>
                    <input
                      type="text"
                      value={editFormData.specialMarks}
                      onChange={(e) => setEditFormData({ ...editFormData, specialMarks: e.target.value })}
                      placeholder="e.g. V-shaped notch on left ear"
                      className="border border-[#dde6e1] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Description & Sighting Details</label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Enter observation notes, tusker characteristics, behavior..."
                    className="border border-[#dde6e1] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-accent resize-y"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">Field Photos</label>
                  <ImageUploadBox
                    folder="unlisted"
                    multiple={true}
                    value={editFormData.photos || []}
                    onChange={(urls) => setEditFormData({ ...editFormData, photos: urls })}
                  />
                </div>

                <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#dde6e1] text-sm font-semibold text-[#555555] hover:bg-[#f7f7f8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-light cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Save size={15} />
                    <span>{savingEdit ? 'Saving…' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}
