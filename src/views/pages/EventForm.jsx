import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CalendarPlus } from 'lucide-react';
import { useEventForm } from '../../controllers/useProjects';
import { useAuth } from '../../controllers/useAuth';
import ImageUploadBox from '../components/ImageUploadBox';

export default function EventForm() {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const isEdit = Boolean(eventId);

  const {
    formData,
    error,
    handleChange,
    handleImagesChange,
    createEvent,
    loadingEvent,
  } = useEventForm(eventId);
  const { isAdmin, authLoading } = useAuth();

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEdit ? 'Edit Event' : 'Create Event'}`;
  }, [isEdit]);

  useEffect(() => {
    // Admin check inside view
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createEvent();
    if (success) {
      navigate('/projects');
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
              <CalendarPlus size={20} />
            </div>
            <h1 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
            <p className="font-sans text-[0.88rem] text-[#777777] max-w-[480px] leading-6 m-0">Add a past or upcoming event to the WTS projects timeline</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Title */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Event Title<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. WTS Awareness Session"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Event Date<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="date"
                  name="date"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              {/* Event Type */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">Event Type</label>
                <select
                  name="type"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23888888%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px] pr-10 cursor-pointer"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="upcoming">Upcoming Event</option>
                  <option value="past">Past Event</option>
                </select>
              </div>

              {/* Shared By */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Organizer / Shared By<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="sharedBy"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. WTS Admin"
                  value={formData.sharedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                Event Description<span className="text-[#e53e3e]"> *</span>
              </label>
              <textarea
                name="description"
                className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 resize-y leading-6"
                rows="4"
                placeholder="Give details about the event, what topics will be covered, who can attend, or wrap-up notes..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Event Photo Upload */}
            <div className="sm:col-span-2">
              <ImageUploadBox
                label="Event / Project Photos (Optional)"
                folder="events"
                multiple
                value={formData.images && formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])}
                onChange={handleImagesChange}
                aspectClass="aspect-[16/9]"
              />
            </div>

            <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button type="button" className="bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-[0.88rem] font-semibold rounded-[10px] px-6 py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" disabled={loadingEvent} className="disabled:opacity-60 bg-primary text-white border-none font-sans text-[0.88rem] font-semibold rounded-[10px] px-7 py-3 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all">
                <Save size={16} />
                <span>{isEdit ? 'Save Changes' : 'Create Event'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
