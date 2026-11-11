import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Binoculars, Image as ImageIcon } from 'lucide-react';
import { useSpecialObservationForm } from '../../controllers/useSpecialObservations';
import { getTuskers } from '../../models/TuskerModel';

export default function SpecialObservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, error, handleChange, saveObservation, isEditMode } =
    useSpecialObservationForm(id);

  const tuskersList = getTuskers();

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEditMode ? 'Edit' : 'Add'} Special Observation`;
  }, [isEditMode]);

  useEffect(() => {
    // Admin protection
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = saveObservation();
    if (success) {
      navigate('/observations');
    }
  };

  const imagesArray = formData.images
    ? formData.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[820px] mx-auto px-8">
        <button
          className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-8 transition-colors hover:text-accent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border-1.5 border-[#e8e8e8] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-7 sm:p-10">
          <div className="text-center flex flex-col items-center gap-2.5 mb-10 pb-6 border-b border-[#eeeeee]">
            <div className="w-[50px] h-[50px] rounded-[12px] bg-accent/12 text-accent flex items-center justify-center mb-1">
              <Binoculars size={22} />
            </div>
            <h1 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">
              {isEditMode ? 'Edit Special Observation' : 'Add Special Observation'}
            </h1>
            <p className="font-sans text-[0.88rem] text-[#777777] max-w-[480px] leading-6 m-0">
              Record special observations of individual tuskers over the year, including behavioral milestones, musth cycles, and physical developments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Tusker Name / Code */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Tusker Name & Code<span className="text-[#e53e3e]"> *</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="tuskerName"
                    list="tuskers-datalist"
                    className="flex-1 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                    placeholder="e.g. T299 - Arya"
                    value={formData.tuskerName}
                    onChange={handleChange}
                  />
                  <datalist id="tuskers-datalist">
                    {tuskersList.map((t) => (
                      <option key={t.id} value={`${t.id} - ${t.name}`} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Observation Date<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="date"
                  name="date"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Location / National Park
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Yala National Park - Block 1"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Observation Headline / Title<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Rare Musth Encounter & Territorial Dominance"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Detailed Description<span className="text-[#e53e3e]"> *</span>
                </label>
                <textarea
                  name="description"
                  rows="6"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 leading-relaxed resize-y"
                  placeholder="Describe the sighting, time of day, elephant's physical condition, tusk dimensions, interactions with other elephants, health status, and unusual observations..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Images */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center justify-between">
                  <span>Image URLs (Comma-separated)</span>
                  <span className="text-[0.75rem] text-[#999999] normal-case font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  name="images"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  value={formData.images}
                  onChange={handleChange}
                />
                <span className="text-[0.75rem] text-[#888888]">
                  Paste one or more direct image links separated by commas.
                </span>

                {/* Live Preview */}
                {imagesArray.length > 0 && (
                  <div className="mt-3 p-3 bg-[#f8f9fa] rounded-xl border border-[#eeeeee]">
                    <span className="text-[0.75rem] font-bold text-[#666666] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <ImageIcon size={13} />
                      Image Previews ({imagesArray.length})
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {imagesArray.map((url, i) => (
                        <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-black/5 border border-[#dddddd]">
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Author / Recorded By */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Recorded By / Admin Name
                </label>
                <input
                  type="text"
                  name="author"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Priyanjana Dilmith (WTS Research Team)"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button
                type="button"
                className="bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-[0.88rem] font-semibold rounded-[10px] px-6 py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white border-none font-sans text-[0.88rem] font-semibold rounded-[10px] px-7 py-3 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all"
              >
                <Save size={16} />
                <span>{isEditMode ? 'Update Observation' : 'Save Observation'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
