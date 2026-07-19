import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResearch } from '../utils/researchStore';
import { BookOpen, ChevronRight } from 'lucide-react';
import './OurProjects.css'; // Reuses projects stylesheet for perfect layout consistency

function formatResearchDate(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const options = { month: 'short', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

export default function OurResearch() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Our Research';
  }, []);

  // Fetch from store
  const { active: activeResearch, past: pastResearch } = useMemo(() => getResearch(), []);

  return (
    <div className="projects-page">
      <div className="projects-inner">

        {/* Page Header */}
        <div className="projects-page-header">
          <h1 className="projects-page-title">Our Research</h1>
          <p className="projects-page-subtitle">Scientific studies, tracking reports, and field insights from the WTS team</p>
        </div>

        {/* Active Research Card */}
        <section className="events-card">
          <div className="events-card-header">
            <h2 className="events-section-title">Active Studies</h2>
            {isAdmin && (
              <div className="events-header-actions">
                <button className="btn-create" onClick={() => navigate('/admin/create-research')}>
                  + Create Entry
                </button>
              </div>
            )}
          </div>

          {activeResearch.length === 0 ? (
            <div className="events-empty">
              <div className="events-empty-icon">
                <BookOpen size={56} strokeWidth={1.2} />
              </div>
              <p className="events-empty-text">No active research studies at this moment.</p>
            </div>
          ) : (
            <div className="events-list">
              {activeResearch.map(item => (
                <div key={item.id} className="past-event-item">
                  <div className="past-event-thumb">
                    <div className="past-event-thumb-placeholder" style={{ backgroundColor: '#faf5ec', color: '#c69b55' }}>
                      <BookOpen size={28} strokeWidth={1.2} />
                    </div>
                  </div>
                  <div className="past-event-info">
                    <p className="past-event-date">{formatResearchDate(item.date)}</p>
                    <h3 className="past-event-title">{item.title}</h3>
                    <p className="past-event-desc">{item.description}</p>
                    <p className="past-event-shared">
                      Led by <strong>{item.author}</strong>
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

        {/* Publications Card */}
        <section className="events-card">
          <div className="events-card-header">
            <h2 className="events-section-title">Completed Publications</h2>
          </div>

          {pastResearch.length === 0 ? (
            <div className="events-empty">
              <div className="events-empty-icon">
                <BookOpen size={56} strokeWidth={1.2} />
              </div>
              <p className="events-empty-text">No research entries published yet.</p>
            </div>
          ) : (
            <div className="events-list">
              {pastResearch.map(item => (
                <div key={item.id} className="past-event-item">
                  {/* Thumbnail */}
                  <div className="past-event-thumb">
                    {item.image
                      ? <img src={item.image} alt={item.title} />
                      : <div className="past-event-thumb-placeholder">
                          <BookOpen size={28} strokeWidth={1.2} />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="past-event-info">
                    <p className="past-event-date">{formatResearchDate(item.date)}</p>
                    <h3 className="past-event-title">{item.title}</h3>
                    <p className="past-event-desc">{item.description}</p>
                    <p className="past-event-shared">
                      Published by <strong>{item.author}</strong>
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

      </div>
    </div>
  );
}
