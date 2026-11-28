/**
 * @file TuskerForm.jsx
 * @description Admin form interface for creating new wild tusker profiles or editing
 * existing registry records. Handles biometrics, geographical tagging, conservation zones,
 * living status, photographic uploads, and navigation history management.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Sparkles } from 'lucide-react';
import { useTuskerForm } from '../../controllers/useTusker';
import { useAuth } from '../../controllers/useAuth';
import {
  LIVING_STATUSES,
  THREAT_LEVELS,
  ZONES,
  AGE_RANGES,
} from '../../models/TuskerModel';
import ImageUploadBox from '../components/ImageUploadBox';
import LocationSearchInput from '../components/LocationSearchInput';
import DistrictMultiSelect from '../components/DistrictMultiSelect';
import { getProvincesForDistricts, parseDistricts } from '../../utils/districtUtils';
import { getLocationDistricts } from '../../utils/locationDistricts';
import { todayLocalISO } from '../../utils/localDate';

/* ── Shared field styling ───────────────────────────────────── */
const INPUT_CLASS = 'w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 disabled:opacity-60';
const SELECT_CLASS = INPUT_CLASS + " appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23888888%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px] pr-10 cursor-pointer";

function Field({ label, required, wide, children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
        {label}{required && <span className="text-[#e53e3e]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="font-sans text-[0.95rem] font-bold text-[#111111] m-0 pt-6 mt-2 border-t border-[#f0f0f0] first:border-t-0 first:pt-0 first:mt-0">
      {children}
    </h2>
  );
}

export default function TuskerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    formData,
    error,
    saving,
    handleChange,
    handlePhotosChange,
    saveProfile,
    isEditMode,
  } = useTuskerForm(id);
  const { isAdmin, authLoading } = useAuth();
  const [exactDeathDateKnown, setExactDeathDateKnown] = useState(false);
  const [exactLastSeenKnown, setExactLastSeenKnown] = useState(false);

  useEffect(() => {
    if (formData.deathDate) {
      const s = String(formData.deathDate).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const parts = s.split('-');
        if (parts[2] !== '01') {
          setExactDeathDateKnown(true);
        }
      }
    }
  }, [formData.deathDate]);

  useEffect(() => {
    if (formData.lastSeen) {
      const s = String(formData.lastSeen).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const parts = s.split('-');
        if (parts[2] !== '01') {
          setExactLastSeenKnown(true);
        }
      }
    }
  }, [formData.lastSeen]);

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEditMode ? 'Edit Tusker' : 'Add New Tusker'}`;
  }, [isEditMode]);

  useEffect(() => {
    // Admin check inside view
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  const calculatedAge = useMemo(() => {
    const birth = Number(formData.proximateBirthYear || formData.birthYear);
    if (!birth || isNaN(birth) || birth < 1900) return null;
    const isDeceased = formData.livingStatus === 'Deceased';
    const endYear = (isDeceased && formData.deathYear && !isNaN(Number(formData.deathYear)))
      ? Number(formData.deathYear)
      : new Date().getFullYear();
    const age = Math.max(0, endYear - birth);
    return `${age} years${isDeceased ? ' (at death)' : ''}`;
  }, [formData.proximateBirthYear, formData.birthYear, formData.livingStatus, formData.deathYear]);

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    handleChange(e);
    const distList = parseDistricts(val);
    const derivedProvinces = getProvincesForDistricts(distList);
    if (derivedProvinces) {
      handleChange({ target: { name: 'province', value: derivedProvinces } });
    }
  };

  const handleAutoDetectRegion = () => {
    const rawTokens = [
      ...String(formData.location || '').split(/[/,;]/),
      ...String(formData.lastSeenArea || '').split(/[/,;]/)
    ].map(s => s.trim()).filter(Boolean);

    const foundDistricts = new Set();
    rawTokens.forEach(token => {
      const dists = getLocationDistricts(token);
      dists.forEach(d => foundDistricts.add(d));
    });

    if (foundDistricts.size > 0) {
      const distList = Array.from(foundDistricts).sort();
      const distStr = distList.join(' / ');
      const provStr = getProvincesForDistricts(distList);
      handleChange({ target: { name: 'district', value: distStr } });
      if (provStr) {
        handleChange({ target: { name: 'province', value: provStr } });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedId = await saveProfile();
    if (savedId) {
      if (isEditMode) {
        if (location.state?.fromProfile) {
          // Returning to profile: navigate(-1) pops edit form from history
          // so clicking Back on profile returns to the list/admin instead of edit form.
          navigate(-1);
        } else {
          navigate(`/tuskers/${savedId.toLowerCase()}`, {
            replace: true,
            state: { from: location.state?.from || '/admin' },
          });
        }
      } else {
        navigate(`/tuskers/${savedId.toLowerCase()}`, {
          replace: true,
          state: { from: '/tuskers' },
        });
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8">
        <button className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-6 sm:mb-8 transition-colors hover:text-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border-1.5 border-[#e8e8e8] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-7 md:p-10">
          <div className="text-center flex flex-col items-center gap-2 mb-8 sm:mb-10 pb-6 border-b border-[#eeeeee]">
            <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-[12px] bg-accent/12 text-accent flex items-center justify-center mb-1 shrink-0 aspect-square">
              {isEditMode ? <Sparkles size={20} /> : <PlusCircle size={20} />}
            </div>
            <h1 className="font-sans text-lg sm:text-[1.5rem] font-bold text-[#111111] m-0 whitespace-nowrap">{isEditMode ? `Edit Tusker Profile` : 'Add New Tusker'}</h1>
            <p className="font-sans text-xs sm:text-[0.88rem] text-[#777777] max-w-[480px] leading-relaxed m-0">
              {isEditMode ? `Updating information for ${formData.id}` : 'Create a new documented profile in the WTS registry'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">{error}</div>}

            <SectionTitle>Identity</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <Field label="Tusker ID" required>
                <input type="text" name="id" className={INPUT_CLASS} placeholder="e.g. T001" value={formData.id} onChange={handleChange} disabled={isEditMode} />
              </Field>
              <Field label="Tusker Name (English)" required>
                <input type="text" name="name" className={INPUT_CLASS} placeholder="e.g. Panama Puttuwa" value={formData.name} onChange={handleChange} />
              </Field>
              <Field label="Sinhala Name">
                <input type="text" name="sinhala" className={INPUT_CLASS} placeholder="e.g. පානම පුට්ටුව" value={formData.sinhala} onChange={handleChange} />
              </Field>
              <Field label="Nickname Suggested By">
                <input type="text" name="nicknameGivenBy" className={INPUT_CLASS} placeholder="e.g. WTS Admin / Contributor" value={formData.nicknameGivenBy} onChange={handleChange} />
              </Field>
              <Field label="Home Range" wide>
                <LocationSearchInput
                  name="location"
                  multi={true}
                  placeholder="Search & add location…"
                  value={formData.location}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </Field>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-sans text-[0.75rem] sm:text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                    {formData.exactFirstRecordDate ? 'First Recorded Date' : 'First Recorded Year'}
                  </label>
                  <label className="inline-flex items-center gap-1.5 font-sans text-[0.74rem] font-semibold text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="exactFirstRecordDate"
                      checked={Boolean(formData.exactFirstRecordDate)}
                      onChange={handleChange}
                      className="w-3.5 h-3.5 accent-primary cursor-pointer rounded"
                    />
                    <span>Know exact date</span>
                  </label>
                </div>
                {formData.exactFirstRecordDate ? (
                  <input
                    type="date"
                    name="listedDate"
                    max={todayLocalISO()}
                    className={INPUT_CLASS}
                    placeholder="DD/MM/YYYY"
                    value={formData.listedDate || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type="number"
                    name="listedDate"
                    min="1900"
                    max={new Date().getFullYear()}
                    step="1"
                    className={INPUT_CLASS}
                    placeholder="e.g. 2026 (Year only)"
                    value={formData.listedDate || ''}
                    onChange={handleChange}
                  />
                )}
              </div>
              <Field label="First Recorded Location">
                <LocationSearchInput
                  name="firstRecordedLocation"
                  placeholder="e.g. Okanda, Kumana"
                  value={formData.firstRecordedLocation}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Recorded By" wide>
                <input type="text" name="recordedBy" className={INPUT_CLASS} placeholder="e.g. WTS Admin / Field Observers" value={formData.recordedBy} onChange={handleChange} />
              </Field>
            </div>

            <SectionTitle>Tusker Photos &amp; Field Records</SectionTitle>
            <div className="w-full">
              <ImageUploadBox
                label="Profile &amp; Field Photos"
                folder="tuskers"
                multiple
                allowCrop
                cropTitle="Crop Tusker Photo"
                cropSubtitle="Drag the crop box or handles to frame the tusker cleanly."
                value={formData.photos && formData.photos.length > 0 ? formData.photos : (formData.photo ? [formData.photo] : [])}
                onChange={handlePhotosChange}
                aspectClass="aspect-[16/10]"
              />
            </div>

            <SectionTitle>Status &amp; Last Sighting</SectionTitle>
            {formData.livingStatus === 'Deceased' ? (
              <div className="flex flex-col gap-5 sm:gap-6">
                {/* Row 1: Living Status & Cause of Death */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <Field label="Living Status">
                    <select name="livingStatus" className={SELECT_CLASS} value={formData.livingStatus} onChange={handleChange}>
                      {LIVING_STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Cause of Death">
                    <input
                      type="text"
                      name="deathReason"
                      className={INPUT_CLASS}
                      placeholder="e.g. Gunshot, Electrocution, Natural Cause"
                      value={formData.deathReason}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                {/* Row 2: BOTH DATES SIDE-BY-SIDE with separate checkboxes & month/date calendars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Field 1: Date / Year of Death */}
                  <Field
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span>Date / Year of Death</span>
                        <label className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[#555555] hover:text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exactDeathDateKnown}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setExactDeathDateKnown(checked);
                              if (!checked && formData.deathDate && formData.deathDate.length > 7) {
                                const mVal = formData.deathDate.slice(0, 7);
                                handleChange({ target: { name: 'deathDate', value: mVal } });
                                handleChange({ target: { name: 'deathYear', value: mVal.slice(0, 4) } });
                              }
                            }}
                            className="rounded border-[#cccccc] text-accent focus:ring-accent cursor-pointer"
                          />
                          <span>Know exact date</span>
                        </label>
                      </div>
                    }
                  >
                    {exactDeathDateKnown ? (
                      <input
                        type="date"
                        name="deathDate"
                        placeholder="DD/MM/YYYY"
                        max={todayLocalISO()}
                        className={INPUT_CLASS}
                        value={formData.deathDate ? (formData.deathDate.length === 7 ? `${formData.deathDate}-01` : formData.deathDate.slice(0, 10)) : ''}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value) {
                            handleChange({ target: { name: 'deathYear', value: e.target.value.slice(0, 4) } });
                          }
                        }}
                      />
                    ) : (
                      <input
                        type="month"
                        name="deathDate"
                        className={INPUT_CLASS}
                        value={formData.deathDate ? formData.deathDate.slice(0, 7) : (formData.deathYear && formData.deathYear.length === 4 ? `${formData.deathYear}-01` : '')}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value) {
                            handleChange({ target: { name: 'deathYear', value: e.target.value.slice(0, 4) } });
                          }
                        }}
                      />
                    )}
                    <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                      {exactDeathDateKnown ? 'Select exact day, month, and year of death.' : 'Select month and year of death, or check "Know exact date" for a specific day.'}
                    </p>
                  </Field>

                  {/* Field 2: Final Spotted Date / Year */}
                  <Field
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span>Final Spotted Date / Year</span>
                        <label className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[#555555] hover:text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exactLastSeenKnown}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setExactLastSeenKnown(checked);
                              if (!checked && formData.lastSeen && formData.lastSeen.length > 7) {
                                handleChange({ target: { name: 'lastSeen', value: formData.lastSeen.slice(0, 7) } });
                              }
                            }}
                            className="rounded border-[#cccccc] text-accent focus:ring-accent cursor-pointer"
                          />
                          <span>Know exact date</span>
                        </label>
                      </div>
                    }
                  >
                    {exactLastSeenKnown ? (
                      <input
                        type="date"
                        name="lastSeen"
                        placeholder="DD/MM/YYYY"
                        max={todayLocalISO()}
                        className={INPUT_CLASS}
                        value={formData.lastSeen ? (formData.lastSeen.length === 7 ? `${formData.lastSeen}-01` : formData.lastSeen.slice(0, 10)) : ''}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="month"
                        name="lastSeen"
                        className={INPUT_CLASS}
                        value={formData.lastSeen ? formData.lastSeen.slice(0, 7) : ''}
                        onChange={handleChange}
                      />
                    )}
                    <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                      {exactLastSeenKnown ? 'Select exact day, month, and year final spotted.' : 'Select month and year final spotted, or check "Know exact date" for a specific day.'}
                    </p>
                  </Field>
                </div>

                {/* Row 3: Final Spotted Location (Full width) */}
                <Field label="Final Spotted Location">
                  <LocationSearchInput
                    name="lastSeenArea"
                    placeholder="e.g. Okanda, Kumana"
                    value={formData.lastSeenArea}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </Field>

                {/* Row 4: Birth Year & Estimated Age Range (at death) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <Field label="Proximate Birth Year">
                    <input
                      type="number"
                      name="proximateBirthYear"
                      className={INPUT_CLASS}
                      placeholder="e.g. 1985"
                      value={formData.proximateBirthYear || formData.birthYear || ''}
                      onChange={handleChange}
                      min="1920"
                      max={new Date().getFullYear()}
                    />
                    {calculatedAge && (
                      <p className="text-[0.78rem] text-accent font-semibold mt-1.5 m-0">
                        Calculated Age: ~{calculatedAge}
                      </p>
                    )}
                  </Field>
                  <Field label="Estimated Age Range (at death)">
                    <select name="ageRange" className={SELECT_CLASS} value={formData.ageRange} onChange={handleChange}>
                      <option value="">- Not set -</option>
                      {AGE_RANGES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                      Optional range if exact birth year is unknown.
                    </p>
                  </Field>
                </div>
              </div>
            ) : (
              /* Living / Actively Monitored Tusker */
              <div className="flex flex-col gap-5 sm:gap-6">
                {/* Row 1: Living Status, Threat Level, Health Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                  <Field label="Living Status">
                    <select name="livingStatus" className={SELECT_CLASS} value={formData.livingStatus} onChange={handleChange}>
                      {LIVING_STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Life Threat Level">
                    <select name="threatLevel" className={SELECT_CLASS} value={formData.threatLevel} onChange={handleChange}>
                      <option value="">- Not set -</option>
                      {THREAT_LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Health Condition">
                    <input
                      type="text"
                      name="healthCondition"
                      className={INPUT_CLASS}
                      placeholder="e.g. Good, Healthy"
                      value={formData.healthCondition}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                {/* Row 2: Last Seen Area & Last Seen Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <Field label="Last Seen Area">
                    <LocationSearchInput
                      name="lastSeenArea"
                      placeholder="e.g. Galgamuwa, Yala"
                      value={formData.lastSeenArea}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span>Last Seen Date / Year</span>
                        <label className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[#555555] hover:text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exactLastSeenKnown}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setExactLastSeenKnown(checked);
                              if (!checked && formData.lastSeen && formData.lastSeen.length > 7) {
                                handleChange({ target: { name: 'lastSeen', value: formData.lastSeen.slice(0, 7) } });
                              }
                            }}
                            className="rounded border-[#cccccc] text-accent focus:ring-accent cursor-pointer"
                          />
                          <span>Know exact date</span>
                        </label>
                      </div>
                    }
                  >
                    {exactLastSeenKnown ? (
                      <input
                        type="date"
                        name="lastSeen"
                        placeholder="DD/MM/YYYY"
                        max={todayLocalISO()}
                        className={INPUT_CLASS}
                        value={formData.lastSeen ? (formData.lastSeen.length === 7 ? `${formData.lastSeen}-01` : formData.lastSeen.slice(0, 10)) : ''}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="month"
                        name="lastSeen"
                        className={INPUT_CLASS}
                        value={formData.lastSeen ? formData.lastSeen.slice(0, 7) : ''}
                        onChange={handleChange}
                      />
                    )}
                    <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                      {exactLastSeenKnown ? 'Select exact day, month, and year.' : 'Select month and year, or check "Know exact date" for a specific day.'}
                    </p>
                  </Field>
                </div>

                {/* Row 3: Proximate Birth Year & Age Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <Field label="Proximate Birth Year">
                    <input
                      type="number"
                      name="proximateBirthYear"
                      className={INPUT_CLASS}
                      placeholder="e.g. 1985"
                      value={formData.proximateBirthYear || formData.birthYear || ''}
                      onChange={handleChange}
                      min="1920"
                      max={new Date().getFullYear()}
                    />
                    {calculatedAge && (
                      <p className="text-[0.78rem] text-accent font-semibold mt-1.5 m-0">
                        Calculated Age: ~{calculatedAge}
                      </p>
                    )}
                  </Field>
                  <Field label="Age Range">
                    <select name="ageRange" className={SELECT_CLASS} value={formData.ageRange} onChange={handleChange}>
                      <option value="">- Not set -</option>
                      {AGE_RANGES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                      Optional range if exact birth year is unknown.
                    </p>
                  </Field>
                </div>
              </div>
            )}

            <SectionTitle>Region</SectionTitle>
            <div className="flex flex-col gap-5">
              {/* District: Spanning full width for clean horizontal tags and comfortable interaction */}
              <Field
                label={
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <span>Administrative District(s)</span>
                    <button
                      type="button"
                      onClick={handleAutoDetectRegion}
                      title="Auto-detect districts from home range and sighting locations"
                      className="inline-flex items-center gap-1.5 text-[0.72rem] sm:text-[0.74rem] font-semibold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-2.5 py-0.5 rounded-full border border-accent/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles size={11} className="text-accent" />
                      <span>Auto-detect from Home Range</span>
                    </button>
                  </div>
                }
              >
                <DistrictMultiSelect
                  name="district"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  onProvincesChange={(provs) => {
                    handleChange({ target: { name: 'province', value: provs } });
                  }}
                  placeholder="Search & select administrative districts (e.g. Hambantota, Monaragala)..."
                />
                <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                  Supports multiple administrative districts separated by <span className="font-semibold text-[#555555]">/</span> (e.g. Hambantota / Monaragala).
                </p>
              </Field>

              {/* Conservation Zone & Province: Balanced 2-column row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <Field label="Conservation Zone">
                  <select name="zone" className={SELECT_CLASS} value={formData.zone} onChange={handleChange}>
                    <option value="">- Not set -</option>
                    {ZONES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                    Strategic WTS conservation landscape zone (Zone 1 - 4).
                  </p>
                </Field>

                <Field label="Province(s)">
                  <input
                    type="text"
                    name="province"
                    className={INPUT_CLASS}
                    placeholder="Auto-derived from districts"
                    value={formData.province}
                    onChange={handleChange}
                  />
                  <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                    Automatically derived from district(s). Can be manually adjusted if needed.
                  </p>
                </Field>
              </div>
            </div>

            <SectionTitle>Description &amp; Markings</SectionTitle>
            <Field label="Description">
              <textarea name="description" className={INPUT_CLASS + ' resize-y leading-6'} rows="4" placeholder="Describe the tusker's behaviour, usual habitat, musth cycles, and physical presence..." value={formData.description} onChange={handleChange} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <Field label="Special Marks">
                <input type="text" name="specialMarks" className={INPUT_CLASS} placeholder="e.g. V-shaped notch on right ear" value={formData.specialMarks} onChange={handleChange} />
              </Field>
              <Field label="Wounds">
                <input type="text" name="specialWounds" className={INPUT_CLASS} placeholder="e.g. Healed gunshot mark" value={formData.specialWounds} onChange={handleChange} />
              </Field>
              {formData.livingStatus !== 'Deceased' && (
                <>
                  <Field label="Risk Score">
                    <input type="text" name="riskScore" className={INPUT_CLASS} placeholder="e.g. 7.5 / 10 (High)" value={formData.riskScore} onChange={handleChange} />
                  </Field>
                  <Field label="Risk Assessment Link">
                    <input
                      type="text"
                      name="riskLink"
                      className={INPUT_CLASS}
                      placeholder="#risk-assessment or https://…"
                      value={formData.riskLink}
                      onChange={handleChange}
                    />
                    <p className="text-[0.75rem] text-[#777777] mt-1.5 m-0 font-normal leading-normal">
                      Defaults to <code>#risk-assessment</code> (opens the built-in WTS Risk Assessment modal). Leave as is or enter an external URL (https://...) for a custom report.
                    </p>
                  </Field>
                </>
              )}
            </div>
            <Field label="Remarks">
              <textarea name="remarks" className={INPUT_CLASS + ' resize-y leading-6'} rows="3" placeholder="e.g. Lost his right tusk due to an accident" value={formData.remarks} onChange={handleChange} />
            </Field>

            <div className="flex flex-col-reverse portrait:flex-col-reverse landscape:sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button type="button" className="w-full portrait:w-full landscape:sm:w-auto bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-6 py-2.5 sm:py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all text-center justify-center" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="w-full portrait:w-full landscape:sm:w-auto disabled:opacity-60 disabled:cursor-wait bg-primary text-white border-none font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-7 py-2.5 sm:py-3 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all text-center">
                <Save size={16} />
                <span>{saving ? 'Saving…' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
