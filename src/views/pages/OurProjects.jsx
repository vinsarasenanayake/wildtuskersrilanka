import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectFeed } from '../../controllers/useProjects';
import { Calendar, ChevronRight } from 'lucide-react';

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

export default function OurProjects() {
  const navigate = useNavigate();
  const { upcomingEvents, pastEvents, isAdmin } = useProjectFeed();

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Our Projects';
  }, []);

  return (
    <div className="bg-[#f0f2f5] min-h-screen pt-[calc(80px+2.5rem)] pb-20">
      <div className="max-w-[820px] mx-auto px-6 flex flex-col gap-6">

        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="font-sans text-[2rem] font-bold text-[#111111] mb-1.5">Our Projects</h1>
          <p className="font-sans text-[0.95rem] text-[#666666]">Events, expeditions, and outreach efforts by the Wild Tuskers Sri Lanka team</p>
        </div>

        {/* Upcoming Events Card */}
        <section className="bg-white rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.1)] p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0">Upcoming Events</h2>
            {isAdmin && (
              <div className="flex gap-2.5">
                <button className="px-4 py-2 bg-accent border-none rounded-[6px] font-sans text-[0.88rem] font-semibold text-white cursor-pointer hover:opacity-88 transition-opacity" onClick={() => navigate('/admin/create-event')}>
                  + Create Event
                </button>
              </div>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
              <div className="text-[#aaaaaa]">
                <Calendar size={56} strokeWidth={1.2} />
              </div>
              <p className="font-sans text-[0.95rem] text-[#888888] m-0">No upcoming events.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start gap-4 pt-5 border-t border-[#f0f0f0] first:pt-0 first:border-t-0">
                  <div className="w-[130px] h-[90px] rounded-[8px] overflow-hidden shrink-0 bg-[#e8e8e8]">
                    <div className="w-full h-full flex items-center justify-center text-[#aaaaaa]" style={{ backgroundColor: '#faf5ec', color: '#c69b55' }}>
                      <Calendar size={28} strokeWidth={1.2} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-sans text-[0.8rem] font-semibold text-accent m-0 uppercase tracking-[0.5px]">{formatEventDate(event.date)}</p>
                    <h3 className="font-sans text-[1.05rem] font-bold text-[#111111] m-0">{event.title}</h3>
                    <p className="font-sans text-[0.85rem] text-[#666666] m-0 leading-6">{event.description}</p>
                    <p className="font-sans text-[0.82rem] text-[#888888] mt-0.5">
                      Organized by <strong>{event.sharedBy}</strong>
                    </p>
                  </div>
                  <button className="bg-none border border-[#e0e0e0] rounded-[6px] px-2 py-1.5 text-[#888888] cursor-pointer shrink-0 hover:bg-[#f5f5f5] hover:text-[#333333] transition-colors self-center flex items-center justify-center" aria-label="More options">
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Events Card */}
        <section className="bg-white rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.1)] p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0">Past Events</h2>
          </div>

          {pastEvents.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-[#888888] m-0 py-6 text-center">
              No past events recorded yet.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {pastEvents.map(event => (
                <div key={event.id} className="flex items-start gap-4 pt-5 border-t border-[#f0f0f0] first:pt-0 first:border-t-0">
                  {/* Thumbnail */}
                  <div className="w-[130px] h-[90px] rounded-[8px] overflow-hidden shrink-0 bg-[#e8e8e8] relative">
                    {event.image ? (
                      (() => {
                        const imgList = event.image.includes(',')
                          ? event.image.split(',').map(s => s.trim()).filter(Boolean)
                          : [event.image];
                        return (
                          <>
                            <img src={imgList[0]} alt={event.title} className="w-full h-full object-cover" />
                            {imgList.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                +{imgList.length - 1} photos
                              </span>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#aaaaaa]">
                        <Calendar size={28} strokeWidth={1.2} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-sans text-[0.8rem] font-semibold text-accent m-0 uppercase tracking-[0.5px]">{formatEventDate(event.date)}</p>
                    <h3 className="font-sans text-[1.05rem] font-bold text-[#111111] m-0">{event.title}</h3>
                    <p className="font-sans text-[0.85rem] text-[#666666] m-0 leading-6">{event.description}</p>
                    <p className="font-sans text-[0.82rem] text-[#888888] mt-0.5">
                      Shared by <strong>{event.sharedBy}</strong>
                    </p>
                  </div>

                  <button className="bg-none border border-[#e0e0e0] rounded-[6px] px-2 py-1.5 text-[#888888] cursor-pointer shrink-0 hover:bg-[#f5f5f5] hover:text-[#333333] transition-colors self-center flex items-center justify-center" aria-label="More options">
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
