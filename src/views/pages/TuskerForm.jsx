import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Sparkles } from 'lucide-react';
import { useTuskerForm } from '../../controllers/useTusker';

const LOCATIONS = ['Kaudulla', 'Minneriya', 'Sinharaja', 'Udawalawe', 'Wilpattu', 'Yala'];

export default function TuskerForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    formData,
    error,
    handleChange,
    saveProfile,
    isEditMode,
  } = useTuskerForm(id, LOCATIONS);

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEditMode ? 'Edit Tusker' : 'Add New Tusker'}`;
  }, [isEditMode]);

  useEffect(() => {
    // Admin check inside view
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const savedId = saveProfile();
    if (savedId) {
      if (isEditMode) {
        navigate(`/tuskers/${savedId.toLowerCase()}`);
      } else {
        navigate('/tuskers');
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* ID */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Tusker ID<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="id"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. T305"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={isEditMode}
                />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Tusker Name (English)<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Nero"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Sinhala Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Sinhala Name<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="sinhala"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. නීරෝ"
                  value={formData.sinhala}
                  onChange={handleChange}
                />
              </div>

              {/* Location Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Location</label>
                <select
                  name="location"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23888888%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px] pr-10 cursor-pointer"
                  value={formData.location}
                  onChange={handleChange}
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Date Calendar Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  First Recorded Date<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="date"
                  name="listedDate"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  value={formData.listedDate}
                  onChange={handleChange}
                />
              </div>

              {/* Recorded By */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Recorded By</label>
                <input
                  type="text"
                  name="recordedBy"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. WTS Team"
                  value={formData.recordedBy}
                  onChange={handleChange}
                />
              </div>

              {/* Nickname Suggested By */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Nickname Suggested By</label>
                <input
                  type="text"
                  name="nicknameGivenBy"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Priyanjana Dilmith"
                  value={formData.nicknameGivenBy || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Description</label>
              <textarea
                name="description"
                className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 resize-y leading-6"
                rows="4"
                placeholder="Describe the tusker's behaviour, usual habitat, musth cycles, and physical presence..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Special Marks */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Special Marks</label>
                <input
                  type="text"
                  name="specialMarks"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. V-shaped notch on right ear"
                  value={formData.specialMarks}
                  onChange={handleChange}
                />
              </div>

              {/* Special Wounds */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Wounds</label>
                <input
                  type="text"
                  name="specialWounds"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Healed gunshot mark"
                  value={formData.specialWounds}
                  onChange={handleChange}
                />
              </div>

              {/* Risk Score */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Risk Score</label>
                <input
                  type="text"
                  name="riskScore"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. 7.5 / 10 (High)"
                  value={formData.riskScore || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Risk Link */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Risk Assessment Link</label>
                <input
                  type="text"
                  name="riskLink"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. #risk-assessment or https://..."
                  value={formData.riskLink || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button type="button" className="bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-[0.88rem] font-semibold rounded-[10px] px-6 py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="bg-primary text-white border-none font-sans text-[0.88rem] font-semibold rounded-[10px] px-7 py-3 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all">
                <Save size={16} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
