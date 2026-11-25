/**
 * @file AddTuskerSighting.jsx
 * @description Admin form interface for adding verified chronological sighting encounters
 * with photographic evidence, GPS coordinates, location names, and health condition notes.
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, MapPin, Activity, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { useSightingForm } from '../../controllers/useTusker';
import { THREAT_LEVELS } from '../../models/TuskerModel';
import ImageUploadBox from '../components/ImageUploadBox';
import LocationSearchInput from '../components/LocationSearchInput';
import { todayLocalISO } from '../../utils/localDate';

const INPUT_CLASS =
  'w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12';

const SELECT_CLASS =
  'w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 appearance-none bg-[url(\'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px] pr-10 cursor-pointer';

export default function AddTuskerSighting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, initialTusker, error, handleChange, handleImagesChange, submitSighting } = useSightingForm(id);

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | Add Sighting for ${id.toUpperCase()}`;
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitSighting();
    if (success) {
      navigate(`/tuskers/${id.toLowerCase()}`);
    }
  };

  const tuskerDisplayName = initialTusker
    ? `${initialTusker.id} - ${initialTusker.name}`
    : id.toUpperCase();

  const isDeceased = initialTusker?.livingStatus === 'Deceased';
  const deathLimit = initialTusker?.deathDate || (initialTusker?.deathYear ? `${initialTusker.deathYear}-12-31` : null);
  const maxCaptureDate = deathLimit && deathLimit < todayLocalISO() ? deathLimit : todayLocalISO();

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[840px] mx-auto px-4 sm:px-6 md:px-8">
        <button
          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-6 sm:mb-8 transition-colors hover:text-accent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back to Tusker
        </button>

        <div className="bg-white border-1.5 border-[#e8e8e8] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-7 md:p-10">
          <div className="text-center flex flex-col items-center gap-2 mb-8 pb-6 border-b border-[#eeeeee]">
            <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-[12px] bg-accent/12 text-accent flex items-center justify-center mb-1 shrink-0 aspect-square">
              <ImageIcon size={20} />
            </div>
            <h1 className="font-sans text-lg sm:text-[1.45rem] font-bold text-[#111111] m-0 whitespace-nowrap truncate max-w-full">
              Add Photo / Sighting for {tuskerDisplayName}
            </h1>
            <p className="font-sans text-xs sm:text-[0.88rem] text-[#777777] max-w-[540px] leading-relaxed m-0">
              Upload new sighting photos and record latest field observations. Sighting updates will refresh the tusker's current status and location while preserving the original registration record.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">
                {error}
              </div>
            )}

            {/* ── SECTION 1: PHOTO & BASIC SIGHTING DETAILS ── */}
            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-[0.95rem] font-bold text-[#111111] m-0 flex items-center gap-2">
                <ImageIcon size={16} className="text-accent" />
                <span>Sighting Photography &amp; Date</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Photo Upload Box */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <ImageUploadBox
                    label="Tusker Sighting Photos"
                    required
                    folder="sightings"
                    multiple
                    value={formData.imageUrls && formData.imageUrls.length > 0 ? formData.imageUrls : (formData.imageUrl ? [formData.imageUrl] : [])}
                    onChange={handleImagesChange}
                    aspectClass="aspect-[16/10]"
                  />
                </div>

                {/* Capture Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                    Capture Date<span className="text-[#e53e3e]"> *</span>
                  </label>
                  <input
                    type="date"
                    name="captureDate"
                    required
                    max={maxCaptureDate}
                    className={INPUT_CLASS}
                    value={formData.captureDate}
                    onChange={handleChange}
                  />
                  {isDeceased && (initialTusker?.deathYear || initialTusker?.deathDate) && (
                    <span className="text-[0.72rem] text-rose-600 font-medium leading-snug">
                      Deceased record ({initialTusker.deathYear || initialTusker.deathDate}). Sighting date must be before or during his lifetime.
                    </span>
                  )}
                </div>

                {/* Recorded / Sighted By */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                    Recorded / Sighted By
                  </label>
                  <input
                    type="text"
                    name="author"
                    placeholder="e.g. WTS Admin"
                    className={INPUT_CLASS}
                    value={formData.author}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#f0f0f0] my-1" />

            {/* ── SECTION 2: CURRENT STATUS & REGIONAL UPDATES ── */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-sans text-[0.95rem] font-bold text-[#111111] m-0 flex items-center gap-2">
                  <Activity size={16} className="text-accent" />
                  <span>Current Field Observations &amp; Profile Updates</span>
                </h3>
                <p className="font-sans text-[0.78rem] text-[#888888] m-0 mt-1">
                  These details will update the tusker's public status (Last Seen Area, Health Condition, Threat Level) while keeping the original baseline recorder untouched.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Sighting Area / Location */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <MapPin size={13} className="text-accent" />
                    <span>Sighting Area / Location</span>
                  </label>
                  <LocationSearchInput
                    name="lastSeenArea"
                    placeholder="e.g. Kumana / Panama"
                    className={INPUT_CLASS}
                    value={formData.lastSeenArea}
                    onChange={handleChange}
                  />
                </div>

                {/* Health Condition */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <Activity size={13} className="text-accent" />
                    <span>Health Condition</span>
                  </label>
                  <input
                    type="text"
                    name="healthCondition"
                    placeholder="e.g. Good"
                    className={INPUT_CLASS}
                    value={formData.healthCondition}
                    onChange={handleChange}
                  />
                </div>

                {/* Life Threat Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-accent" />
                    <span>Life Threat Level</span>
                  </label>
                  <select
                    name="threatLevel"
                    className={SELECT_CLASS}
                    value={formData.threatLevel}
                    onChange={handleChange}
                  >
                    <option value="">- Not set -</option>
                    {THREAT_LEVELS.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Special Marks */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent" />
                    <span>Special Marks</span>
                  </label>
                  <input
                    type="text"
                    name="specialMarks"
                    placeholder="e.g. V-shaped notch on right ear"
                    className={INPUT_CLASS}
                    value={formData.specialMarks}
                    onChange={handleChange}
                  />
                </div>

                {/* Wounds Observed */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-accent" />
                    <span>Wounds</span>
                  </label>
                  <input
                    type="text"
                    name="specialWounds"
                    placeholder="e.g. Healed gunshot mark"
                    className={INPUT_CLASS}
                    value={formData.specialWounds}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#f0f0f0] my-1" />

            {/* ── SECTION 3: NOTES & REMARKS ── */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                Sighting Notes / Remarks
              </label>
              <textarea
                name="note"
                className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 resize-y leading-6"
                rows="4"
                placeholder="Where did you see him? Any notable herd behavior or physical observations?"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col-reverse portrait:flex-col-reverse landscape:sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button
                type="button"
                className="w-full portrait:w-full landscape:sm:w-auto bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-6 py-2.5 sm:py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all text-center justify-center"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full portrait:w-full landscape:sm:w-auto bg-primary text-white border-none font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-7 py-2.5 sm:py-3 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all text-center"
              >
                <Save size={16} />
                <span>Save Sighting</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
