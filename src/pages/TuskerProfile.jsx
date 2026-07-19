import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, User, Calendar, AlertTriangle, Tag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import './TuskerProfile.css';


/* ── Slideshow Component ─────────────────────────────────────── */
function PhotoSlideshow({ photos, name }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(p => (p === 0 ? photos.length - 1 : p - 1));
  const next = () => setCurrent(p => (p === photos.length - 1 ? 0 : p + 1));

  return (
    <div className="slideshow">
      <div className="slide-frame">
        {photos[current]
          ? <img src={photos[current]} alt={`${name} photo ${current + 1}`} className="slide-img" />
          : <div className="slide-placeholder">
              <span className="slide-placeholder-text">{name}</span>
              <span className="slide-placeholder-num">Photo {current + 1}</span>
            </div>
        }

        {photos.length > 1 && (
          <>
            <button className="slide-btn slide-prev" onClick={prev} aria-label="Previous photo">
              <ChevronLeft size={22} />
            </button>
            <button className="slide-btn slide-next" onClick={next} aria-label="Next photo">
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <span className="slide-counter">{current + 1} / {photos.length}</span>
      </div>

      {/* Dot navigation */}
      {photos.length > 1 && (
        <div className="slide-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`slide-dot ${i === current ? 'active' : ''}`}
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
    <div className="detail-row">
      <div className="detail-icon">{icon}</div>
      <div className="detail-body">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
      </div>
    </div>
  );
}

import { getTuskers } from '../utils/tuskersStore';

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
  
  const tuskers = getTuskers();
  const tusker = tuskers.find(t => t.id.toLowerCase() === id?.toLowerCase());
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!tusker) {
    return (
      <div className="profile-not-found">
        <h2>Tusker not found</h2>
        <button className="back-btn" onClick={() => navigate('/tuskers')}>
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Back and Edit Bar */}
        <div className="profile-top-bar">
          <button className="back-btn" onClick={() => navigate('/tuskers')}>
            <ArrowLeft size={16} /> Back to List
          </button>
          {isAdmin && (
            <button
              className="btn-edit-profile"
              onClick={() => navigate(`/admin/edit-tusker/${tusker.id.toLowerCase()}`)}
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-layout">

          {/* LEFT — Slideshow */}
          <div className="profile-left">
            <PhotoSlideshow photos={tusker.photos} name={tusker.name} />
          </div>

          {/* RIGHT — Info */}
          <div className="profile-right">

            {/* Name block */}
            <div className="profile-name-block">
              <span className="profile-id-tag">{tusker.id}</span>
              <h1 className="profile-name">
                {tusker.name} <span className="profile-sinhala-inline">({tusker.sinhala})</span>
              </h1>
            </div>

            {/* Description */}
            <p className="profile-description">{tusker.description}</p>

            <div className="profile-divider" />

            {/* Detail rows */}
            <div className="profile-details">
              <DetailRow
                icon={<MapPin size={16} />}
                label="Location"
                value={tusker.location}
              />
              <DetailRow
                icon={<User size={16} />}
                label="Recorded By"
                value={tusker.recordedBy}
              />
              <DetailRow
                icon={<Calendar size={16} />}
                label="First Recorded Date"
                value={formatDate(tusker.listedDate)}
              />
              <DetailRow
                icon={<Tag size={16} />}
                label="Special Marks"
                value={tusker.specialMarks}
              />
              <DetailRow
                icon={<AlertTriangle size={16} />}
                label="Special Wounds"
                value={tusker.specialWounds}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
