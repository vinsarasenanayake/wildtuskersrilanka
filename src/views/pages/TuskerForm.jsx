/**
 * @file TuskerForm.jsx
 * @description Admin form interface for creating new wild tusker profiles or editing
 * existing registry records. Handles biometrics, geographical tagging, conservation zones,
 * living status, photographic uploads, and navigation history management.
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Sparkles } from 'lucide-react';
import { useTuskerForm } from '../../controllers/useTusker';
import { useAuth } from '../../controllers/useAuth';
import {
  LIVING_STATUSES,
  THREAT_LEVELS,
  ZONES,
  AGE_RANGES,
  PROVINCES,
  DISTRICTS,
  DISTRICT_TO_PROVINCE_MAP,
} from '../../models/TuskerModel';
import ImageUploadBox from '../components/ImageUploadBox';
import LocationSearchInput from '../components/LocationSearchInput';

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
    const selectedDist = e.target.value;
    handleChange(e);
    if (selectedDist && DISTRICT_TO_PROVINCE_MAP[selectedDist]) {
      handleChange({ target: { name: 'province', value: DISTRICT_TO_PROVINCE_MAP[selectedDist] } });
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
    <div className="w-full min-h-screen bg-white pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[820px] mx-auto px-8">
        <button className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-8 transition-colors hover:text-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border-1.5 border-[#e8e8e8] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-7 sm:p-10">
          <div className="text-center flex flex-col items-center gap-2.5 mb-10 pb-6 border-b border-[#eeeeee]">
            <div className="w-[50px] h-[50px] rounded-[12px] bg-accent/12 text-accent flex items-center justify-center mb-1">
              {isEditMode ? <Sparkles size={20} /> : <PlusCircle size={20} />}
            </div>
            <h1 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">{isEditMode ? `Edit Tusker Profile` : 'Add New Tusker'}</h1>
            <p className="font-sans text-[0.88rem] text-[#777777] max-w-[480px] leading-6 m-0">
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
              <Field label="Roaming Area">
                <LocationSearchInput
                  name="location"
                  multi={true}
                  placeholder="Search & add roaming area (e.g. Buttala, Wellawaya, Kumana)..."
                  value={formData.location}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="First Recorded Date">
                <input type="date" name="listedDate" className={INPUT_CLASS} placeholder="" value={formData.listedDate} onChange={handleChange} />
              </Field>
              <Field label="Recorded By">
                <input type="text" name="recordedBy" className={INPUT_CLASS} placeholder="e.g. WTS Admin" value={formData.recordedBy} onChange={handleChange} />
              </Field>
              <Field label="Nickname Suggested By" wide>
                <input type="text" name="nicknameGivenBy" className={INPUT_CLASS} placeholder="e.g. WTS Admin" value={formData.nicknameGivenBy} onChange={handleChange} />
              </Field>
            </div>

            <SectionTitle>Tusker Photos &amp; Field Records</SectionTitle>
            <div className="w-full">
              <ImageUploadBox
                label="Profile &amp; Field Photos"
                folder="tuskers"
                multiple
                value={formData.photos && formData.photos.length > 0 ? formData.photos : (formData.photo ? [formData.photo] : [])}
                onChange={handlePhotosChange}
                aspectClass="aspect-[16/10]"
              />
            </div>

            <SectionTitle>Status &amp; Last Sighting</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <Field label="Living Status">
                <select name="livingStatus" className={SELECT_CLASS} value={formData.livingStatus} onChange={handleChange}>
                  {LIVING_STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              {formData.livingStatus !== 'Deceased' && (
                <Field label="Life Threat Level">
                  <select name="threatLevel" className={SELECT_CLASS} value={formData.threatLevel} onChange={handleChange}>
                    <option value="">— Not set —</option>
                    {THREAT_LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              )}
              {formData.livingStatus === 'Deceased' && (
                <>
                  <Field label="Year of Death">
                    <input type="text" name="deathYear" className={INPUT_CLASS} placeholder="e.g. 2024" value={formData.deathYear} onChange={handleChange} inputMode="numeric" />
                  </Field>
                  <Field label="Cause of Death">
                    <input type="text" name="deathReason" className={INPUT_CLASS} placeholder="e.g. Electrocution" value={formData.deathReason} onChange={handleChange} />
                  </Field>
                </>
              )}
              <Field label={formData.livingStatus === 'Deceased' ? "Last Recorded Area" : "Last Seen Area"}>
                <LocationSearchInput
                  name="lastSeenArea"
                  placeholder="e.g. Galgamuwa, Yala, Wilpattu..."
                  value={formData.lastSeenArea}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label={formData.livingStatus === 'Deceased' ? "Last Recorded Month" : "Last Seen (Month)"}>
                <input type="month" name="lastSeen" className={INPUT_CLASS} placeholder="" value={formData.lastSeen} onChange={handleChange} />
              </Field>
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
              <Field label={formData.livingStatus === 'Deceased' ? "Estimated Age Range (at death)" : "Age Range"}>
                <select name="ageRange" className={SELECT_CLASS} value={formData.ageRange} onChange={handleChange}>
                  <option value="">— Not set —</option>
                  {AGE_RANGES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <p className="text-[0.72rem] text-[#888888] mt-1 m-0">
                  Optional range if exact birth year is unknown.
                </p>
              </Field>
              {formData.livingStatus !== 'Deceased' && (
                <Field label="Health Condition">
                  <input type="text" name="healthCondition" className={INPUT_CLASS} placeholder="e.g. Good" value={formData.healthCondition} onChange={handleChange} />
                </Field>
              )}
            </div>

            <SectionTitle>Region</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <Field label="Zone">
                <select name="zone" className={SELECT_CLASS} value={formData.zone} onChange={handleChange}>
                  <option value="">— Not set —</option>
                  {ZONES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="District">
                <select name="district" className={SELECT_CLASS} value={formData.district} onChange={handleDistrictChange}>
                  <option value="">— Not set —</option>
                  {formData.district && !DISTRICTS.includes(formData.district) && (
                    <option value={formData.district}>{formData.district}</option>
                  )}
                  {DISTRICTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Province">
                <select name="province" className={SELECT_CLASS} value={formData.province} onChange={handleChange}>
                  <option value="">— Not set —</option>
                  {formData.province && !PROVINCES.includes(formData.province) && (
                    <option value={formData.province}>{formData.province}</option>
                  )}
                  {PROVINCES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
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
                      placeholder="#risk-assessment (default) or https://..."
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

            <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button type="button" className="bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-[0.88rem] font-semibold rounded-[10px] px-6 py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="disabled:opacity-60 disabled:cursor-wait bg-primary text-white border-none font-sans text-[0.88rem] font-semibold rounded-[10px] px-7 py-3 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all">
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
