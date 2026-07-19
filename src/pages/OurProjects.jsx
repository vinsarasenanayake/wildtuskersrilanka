import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../utils/projectsStore';
import { Calendar, ChevronRight } from 'lucide-react';
import './OurProjects.css';

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

export default function OurProjects() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Load events dynamically from store
  const { upcoming: upcomingEvents, past: pastEvents } = useMemo(() => getEvents(), []);

  return (
    <div className="projects-page">
      <div className="projects-inner">

        {/* Page Title */}
        <div className="projects-page-header">
          <h1 className="projects-page-title">Our Projects</h1>
          <p className="projects-page-subtitle">Events, expeditions, and outreach efforts by the Wild Tuskers Sri Lanka team</p>
        </div>

        {/* Upcoming Events Card */}
        <section className="events-card">
          <div className="events-card-header">
            <h2 className="events-section-title">Upcoming Events</h2>
            {isAdmin && (
              <div className="events-header-actions">
                <button className="btn-create" onClick={() => navigate('/admin/create-event')}>
                  + Create Event
                </button>
              </div>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="events-empty">
              <div className="events-empty-icon">
                <Calendar size={56} strokeWidth={1.2} />
              </div>
              <p className="events-empty-text">No upcoming events.</p>
            </div>
          ) : (
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="past-event-item">
                  <div className="past-event-thumb">
                    <div className="past-event-thumb-placeholder" style={{ backgroundColor: '#faf5ec', color: '#c69b55' }}>
                      <Calendar size={28} strokeWidth={1.2} />
                    </div>
                  </div>
                  <div className="past-event-info">
                    <p className="past-event-date">{formatEventDate(event.date)}</p>
                    <h3 className="past-event-title">{event.title}</h3>
                    <p className="past-event-desc">{event.description}</p>
                    <p className="past-event-shared">
                      Organized by <strong>{event.sharedBy}</strong>
                    </p>
                  </div>
                  <button className="past-event-more" aria-label="More options">
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Events Card */}
        <section className="events-card">
          <div className="events-card-header">
            <h2 className="events-section-title">Past Events</h2>
          </div>

          <div className="events-list">
            {pastEvents.map(event => (
              <div key={event.id} className="past-event-item">
                {/* Thumbnail */}
                <div className="past-event-thumb">
                  {event.image
                    ? <img src={event.image} alt={event.title} />
                    : <div className="past-event-thumb-placeholder">
                        <Calendar size={28} strokeWidth={1.2} />
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="past-event-info">
                  <p className="past-event-date">{formatEventDate(event.date)}</p>
                  <h3 className="past-event-title">{event.title}</h3>
                  <p className="past-event-desc">{event.description}</p>
                  <p className="past-event-shared">
                    Shared by <strong>{event.sharedBy}</strong>
                  </p>
                </div>

                <button className="past-event-more" aria-label="More options">
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
