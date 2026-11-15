import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { useSightingForm } from '../../controllers/useTusker';
import ImageUploadBox from '../components/ImageUploadBox';

export default function AddTuskerSighting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, error, handleChange, handleImagesChange, submitSighting } = useSightingForm(id);

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
              <ImageIcon size={20} />
            </div>
            <h1 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">
              Add Photo / Sighting for {id.toUpperCase()}
            </h1>
            <p className="font-sans text-[0.88rem] text-[#777777] max-w-[480px] leading-6 m-0">
              Contribute to this tusker's profile by adding your own sightings and photos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Direct Photo Upload */}
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
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  value={formData.captureDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                Note / Description (Optional)
              </label>
              <textarea
                name="note"
                className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 resize-y leading-6"
                rows="4"
                placeholder="Where did you see him? Was he with other elephants?"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button type="button" className="bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-[0.88rem] font-semibold rounded-[10px] px-6 py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="bg-primary text-white border-none font-sans text-[0.88rem] font-semibold rounded-[10px] px-7 py-3 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all">
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
