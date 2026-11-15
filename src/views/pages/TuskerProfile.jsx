import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  User,
  UserCheck,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  ExternalLink,
  Camera,
  Maximize2,
  X,
  Eye,
  Map as MapIcon,
  HeartPulse,
  Hourglass,
  Skull,
  StickyNote,
} from 'lucide-react';
import { useTuskerProfile } from '../../controllers/useTusker';
import StatusBadge from '../components/StatusBadge';
import { getCachedAspect, setCachedAspect, probeImageAspect } from '../../utils/photoAspectCache';

/* ── Slideshow Component ─────────────────────────────────────── */
function PhotoSlideshow({ photos, name, current, prev, next, setCurrent }) {
  const currentPhoto = photos && photos[current];
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
            ? 'aspect-[4/3] bg-[#e8e8e8]'
            : isPortrait
              ? 'aspect-[3/4] bg-[#e8e8e8]'
              : 'aspect-[4/3] bg-[#e8e8e8]'
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
            alt={`${name} photo ${current + 1}`}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover object-center rounded-[14px]"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-8">
            <span className="font-sans text-[1.4rem] font-bold text-[#bbbbbb]">{name}</span>
            <span className="font-sans text-[0.82rem] text-[#cccccc]">Photo {current + 1}</span>
          </div>
        )}

        {photos && photos.length > 1 && (
          <>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] left-3"
              onClick={() => prev(photos.length)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] right-3"
              onClick={() => next(photos.length)}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {photos && photos.length > 0 && (
          <span className="absolute bottom-3 right-3.5 bg-black/55 text-white font-sans text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-full z-[2] backdrop-blur-xs">
            {current + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Dot navigation */}
      {photos && photos.length > 1 && (
        <div className="flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full bg-[#dddddd] transition-all hover:bg-[#bbbbbb] p-0 border-none outline-none ${i === current ? 'bg-accent! scale-130' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Detail Row ──────────────────────────────────────────────── */
function DetailRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3.5">
      <div className="w-[34px] h-[34px] rounded-[8px] bg-[#faf5ec] flex items-center justify-center text-accent shrink-0 mt-0.5">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-[0.75rem] font-semibold text-[#aaaaaa] uppercase tracking-[0.6px]">{label}</span>
        <span className="font-sans text-[0.92rem] font-medium text-[#222222] leading-6">{value}</span>
      </div>
    </div>
  );
}

/** "2026-05-01" → "May 2026" (last-seen dates are month precision). */
function formatMonth(dateStr) {
  if (!dateStr) return '';
  const [y, m] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = parseInt(m, 10) - 1;
  return idx >= 0 && idx < 12 ? `${months[idx]} ${y}` : dateStr;
}

const THREAT_STYLES = {
  Low: 'bg-[#e8f5ec] text-[#1f7a3d]',
  Medium: 'bg-[#fff6e5] text-[#9a6200]',
  High: 'bg-[#fdecea] text-[#c0392b]',
  Highest: 'bg-[#c0392b] text-white',
};

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

/* ── Main Profile Page ───────────────────────────────────────── */
export default function TuskerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tusker,
    loading,
    comparisonList,
    earComparisonList,
    isAdmin,
    canAddSighting,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    prevPhoto,
    nextPhoto,
  } = useTuskerProfile(id);

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedComparisonImg, setSelectedComparisonImg] = useState(null);

  useEffect(() => {
    if (tusker) {
      document.title = `Wild Tuskers Sri Lanka | ${tusker.name}`;
    }
  }, [tusker]);

  useEffect(() => {
    if (selectedComparisonImg || showRiskModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedComparisonImg, showRiskModal]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans text-[#888888] pt-[80px]">
        Loading tusker profile…
      </div>
    );
  }

  if (!tusker) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 font-sans text-[#888888] pt-[80px]">
        <h2>Tusker not found</h2>
        <button
          className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-8 transition-colors hover:text-accent"
          onClick={() => navigate('/tuskers')}
        >
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  const isDeceased = tusker.livingStatus === 'Deceased';

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[1100px] mx-auto px-8">

        {/* Back and Edit Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 transition-colors hover:text-accent"
            onClick={() => navigate('/tuskers')}
          >
            <ArrowLeft size={16} /> Back to List
          </button>
          <div className="flex items-center gap-3">
            {canAddSighting && (
              <button
                className="bg-accent text-primary font-sans text-[0.88rem] font-semibold rounded-[8px] px-5 py-2.5 shadow-[0_4px_10px_rgba(11,37,24,0.12)] hover:-translate-y-[0.5px] hover:bg-accent-hover transition-all cursor-pointer border-none"
                onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}/add-sighting`)}
              >
                Add Sighting/Photo
              </button>
            )}
            {isAdmin && (
              <button
                className="bg-primary text-white font-sans text-[0.88rem] font-semibold rounded-[8px] px-5 py-2.5 shadow-[0_4px_10px_rgba(11,37,24,0.12)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_15px_rgba(11,37,24,0.22)] transition-all cursor-pointer border-none"
                onClick={() => navigate(`/admin/edit-tusker/${tusker.id.toLowerCase()}`)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-8 min-[820px]:gap-14 items-start">

          {/* LEFT - Slideshow */}
          <div>
            <PhotoSlideshow
              photos={tusker.photos}
              name={tusker.name}
              current={currentPhotoIndex}
              prev={prevPhoto}
              next={nextPhoto}
              setCurrent={setCurrentPhotoIndex}
            />
          </div>

          {/* RIGHT - Info */}
          <div className="flex flex-col gap-5">

            {/* Name block */}
            <div>
              <h1 className="font-sans text-[1.9rem] min-[820px]:text-[2.4rem] font-extrabold text-[#111111] leading-tight m-0">
                {tusker.id ? `${tusker.id} - ` : ''}{tusker.name}
                {tusker.sinhala && (
                  <span className="font-sans text-[1.25rem] min-[820px]:text-[1.5rem] font-normal text-[#666666] ml-2.5">
                    ({tusker.sinhala})
                  </span>
                )}
              </h1>
              <StatusBadge
                status={tusker.livingStatus}
                deathYear={tusker.deathYear}
                className="mt-3 text-[0.8rem] px-3 py-1"
              />
            </div>

            {/* Description */}
            {tusker.description && (
              <p className="font-sans text-[0.95rem] leading-[1.75] text-[#444444] m-0">{tusker.description}</p>
            )}

            <div className="h-px bg-[#f0f0f0]" />

            {/* Detail rows */}
            <div className="flex flex-col gap-4">
              <DetailRow
                icon={<MapPin size={16} />}
                label="Location"
                value={tusker.location || 'Not Applicable'}
              />
              <DetailRow
                icon={<User size={16} />}
                label="First Recorded By"
                value={tusker.recordedBy || 'Not Applicable'}
              />
              <DetailRow
                icon={<UserCheck size={16} />}
                label="Nickname Suggested By"
                value={tusker.nicknameGivenBy || tusker.recordedBy || 'Not Applicable'}
              />
              <DetailRow
                icon={<Calendar size={16} />}
                label="First Recorded Date"
                value={formatDate(tusker.listedDate) || 'Not Applicable'}
              />
              {/* Special Marks (hide if Not Applicable and no wounds) */}
              {((tusker.specialMarks && tusker.specialMarks !== 'Not Applicable' && tusker.specialMarks !== 'None') || tusker.specialWounds || tusker.wounds) && (
                <DetailRow
                  icon={<Tag size={16} />}
                  label="Special Marks"
                  value={
                    <div className="flex flex-col gap-1">
                      {tusker.specialMarks && tusker.specialMarks !== 'Not Applicable' && (
                        <span>{tusker.specialMarks}</span>
                      )}
                      {((tusker.specialWounds && tusker.specialWounds !== 'None recorded.') || tusker.wounds) && (
                        <span className="text-[0.88rem] text-[#555555]">
                          <strong className="text-[#222222] font-semibold">Wounds: </strong>
                          {tusker.specialWounds || tusker.wounds}
                        </span>
                      )}
                    </div>
                  }
                />
              )}

              {/* Death Details (Prominently displayed for deceased tuskers) */}
              {isDeceased && (
                <DetailRow
                  icon={<Skull size={16} className="text-red-500" />}
                  label="Death Details"
                  value={
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-red-700">
                        {[tusker.deathYear ? `Year: ${tusker.deathYear}` : null, tusker.deathReason ? `Cause: ${tusker.deathReason}` : null].filter(Boolean).join(' · ') || 'Details not recorded'}
                      </span>
                    </div>
                  }
                />
              )}

              {/* Risk Score (Only for living / actively monitored tuskers) */}
              {!isDeceased && (tusker.riskScore || tusker.riskLink) && (
                <DetailRow
                  icon={<ShieldAlert size={16} />}
                  label="Risk Score"
                  value={
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-sans text-[0.92rem] font-bold text-[#111111]">
                        {tusker.riskScore || 'Not Applicable'}
                      </span>
                      {(tusker.riskLink || tusker.riskScore) && (
                        <a
                          href={tusker.riskLink && tusker.riskLink.startsWith('http') ? tusker.riskLink : '#risk-assessment'}
                          target={tusker.riskLink?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!tusker.riskLink || tusker.riskLink === '#' || tusker.riskLink === '#risk-assessment') {
                              e.preventDefault();
                              setShowRiskModal(true);
                            }
                          }}
                          className="inline-flex items-center gap-1 font-sans text-[0.82rem] font-semibold text-accent hover:text-accent-hover hover:underline transition-colors cursor-pointer"
                        >
                          View Risk Assessment <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  }
                />
              )}

              {/* Additional Official Registry Fields */}
              {tusker.ageRange && (
                <DetailRow
                  icon={<Hourglass size={16} />}
                  label={isDeceased ? "Estimated Age (at death)" : "Estimated Age"}
                  value={`${tusker.ageRange} years`}
                />
              )}

              {/* Health Condition (Hidden for deceased tuskers) */}
              {!isDeceased && tusker.healthCondition && (
                <DetailRow
                  icon={<HeartPulse size={16} />}
                  label="Health Condition"
                  value={tusker.healthCondition}
                />
              )}

              {/* Life Threat Level (Hidden for deceased tuskers) */}
              {!isDeceased && tusker.threatLevel && (
                <DetailRow
                  icon={<ShieldAlert size={16} />}
                  label="Life Threat Level"
                  value={
                    <span className={`inline-block font-sans text-[0.82rem] font-bold rounded-full px-3 py-0.5 ${THREAT_STYLES[tusker.threatLevel] || ''}`}>
                      {tusker.threatLevel}
                    </span>
                  }
                />
              )}

              {tusker.lastSeenArea && (
                <DetailRow
                  icon={<Eye size={16} />}
                  label={isDeceased ? "Last Documented Area" : "Last Seen"}
                  value={[tusker.lastSeenArea, formatMonth(tusker.lastSeen)].filter(Boolean).join(' · ')}
                />
              )}
              {(tusker.zone || tusker.district || tusker.province) && (
                <DetailRow
                  icon={<MapIcon size={16} />}
                  label="Region"
                  value={[tusker.zone, tusker.district, tusker.province].filter(Boolean).join(' · ')}
                />
              )}
              {tusker.remarks && (
                <DetailRow
                  icon={<StickyNote size={16} />}
                  label="Remarks"
                  value={tusker.remarks}
                />
              )}
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
                          alt={`${tusker.name} ${item.year}`}
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
                    <p className="font-sans text-[0.88rem] text-[#2c3330] leading-[1.65] m-0 font-medium">
                      {item.changeSentence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EAR BIOMETRIC COMPARISON (2 Boxes) */}
        {earComparisonList && earComparisonList.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#eeeeee]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
              <div>
                <h2 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0 flex items-center gap-2">
                  <span>Ear Biometric & Venation Comparison</span>
                </h2>
                <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[780px] leading-relaxed">
                  Identification panel comparing pinna edge contours, tears, V-notches, and vascular branching across monitoring intervals.
                </p>
              </div>
            </div>

            {/* 2-Column Horizontal Collage of Ears */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earComparisonList.slice(0, 2).map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#e0e5e2] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-[#fafbf9] border-b border-[#eeeeee] flex items-center justify-between">
                    <span className="font-sans text-[0.82rem] font-bold text-[#44554c]">
                      {item.stage || `Stage ${index + 1}`}
                    </span>
                    <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{item.year}</span>
                    </span>
                  </div>

                  {/* Ear Photo Card */}
                  <div
                    onClick={() => item.photo && setSelectedComparisonImg({ ...item, isEar: true })}
                    className={`relative w-full aspect-[4/3] bg-[#eef3f0] overflow-hidden flex items-center justify-center ${
                      item.photo ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {item.photo ? (
                      <>
                        <img
                          src={item.photo}
                          alt={`${tusker.name} Ear ${item.year}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-sans text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>View Ear Crop</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8faf8] to-[#edf4ef]">
                        <div className="w-12 h-12 rounded-full bg-[#0b2518]/10 text-[#0b2518] flex items-center justify-center mb-2">
                          <Camera size={22} className="opacity-70" />
                        </div>
                        <span className="font-sans text-xs font-bold text-[#1f3327] uppercase tracking-wider mb-1">
                          {tusker.id} : Ear Biometrics
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#55695d] max-w-[200px] leading-tight">
                          {item.stage} Record
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sentence Below the Photo */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="font-sans text-[0.88rem] text-[#2c3330] leading-[1.65] m-0 font-medium">
                      {item.changeSentence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM - Sightings / Community Contributions */}
        {tusker.sightings && tusker.sightings.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#eeeeee]">
            <h2 className="font-sans text-[1.5rem] font-bold text-[#111111] mb-6">Recorded Sightings & Community Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tusker.sightings.map(sighting => (
                <div key={sighting.id} className="bg-[#f9faf8] border border-[#eaeaea] rounded-[12px] overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] bg-black/5">
                    <img src={sighting.imageUrl} alt={`Sighting on ${sighting.captureDate}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[0.85rem] font-semibold text-[#888888]">{formatDate(sighting.captureDate)}</span>
                      <span className="font-sans text-[0.75rem] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-[4px]">{sighting.author}</span>
                    </div>
                    {sighting.note && (
                      <p className="font-sans text-[0.9rem] text-[#333333] leading-[1.6] m-0">{sighting.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment Modal */}
      {showRiskModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRiskModal(false)}
        >
          <div
            className="bg-white rounded-[16px] max-w-[500px] w-full p-6 shadow-2xl border border-[#e8e8e8] flex flex-col gap-4 relative my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#faf5ec] text-accent flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-[1.1rem] font-bold text-[#111111] m-0">Risk Assessment Report</h3>
                  <p className="font-sans text-[0.78rem] text-[#888888] m-0">{tusker.id} - {tusker.name}</p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full border-none bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#555555] cursor-pointer flex items-center justify-center transition-colors"
                onClick={() => setShowRiskModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-sans text-[0.9rem] text-[#444444]">
              <div className="flex justify-between items-center p-3 rounded-[10px] bg-[#f9faf8] border border-[#eeeeee]">
                <span className="font-medium text-[#666666]">Overall Risk Rating</span>
                <span className="font-bold text-[#111111] text-[1rem]">{tusker.riskScore || 'Not Applicable'}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <p className="m-0 leading-relaxed text-[#555555]">
                  The WTS Risk Score is an index calculated based on:
                </p>
                <ul className="m-0 pl-5 text-[0.85rem] text-[#666666] flex flex-col gap-1.5">
                  <li><strong className="text-[#222222]">Corridor Proximity:</strong> Frequency of movement across human settlements and farming areas in {tusker.location || 'Sri Lanka'}.</li>
                  <li><strong className="text-[#222222]">Physical Vulnerability:</strong> Tusk span attractiveness for illicit poaching and snare frequency.</li>
                  <li><strong className="text-[#222222]">Conflict & Injury History:</strong> {tusker.specialWounds && tusker.specialWounds !== 'None recorded.' ? tusker.specialWounds : 'No previous severe conflict injuries recorded.'}</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                className="bg-primary text-white text-[0.85rem] font-semibold px-5 py-2 rounded-[8px] border-none cursor-pointer hover:bg-primary-light transition-all"
                onClick={() => setShowRiskModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Comparison Image Lightbox Modal */}
      {selectedComparisonImg && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in select-none"
          onClick={() => setSelectedComparisonImg(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#0b2518] text-[#c69b55] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={12} />
                  {selectedComparisonImg.year}
                </span>
                <span className="font-sans text-sm font-bold text-gray-800">
                  {tusker.name} ({tusker.id}) : {selectedComparisonImg.stage}
                </span>
              </div>
              <button
                onClick={() => setSelectedComparisonImg(null)}
                className="text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer transition-colors p-0"
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full bg-[#0a0f0d] flex items-center justify-center min-h-[260px] max-h-[62vh] overflow-hidden shrink-0">
              <img
                src={selectedComparisonImg.photo}
                alt={`${tusker.name} ${selectedComparisonImg.year}`}
                className="w-full h-full max-h-[62vh] object-contain"
              />
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <p className="font-sans text-sm text-gray-800 leading-relaxed m-0 font-medium">
                {selectedComparisonImg.changeSentence}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
