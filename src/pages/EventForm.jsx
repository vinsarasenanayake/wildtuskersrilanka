import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../utils/projectsStore';
import { ArrowLeft, Save, CalendarPlus } from 'lucide-react';
import './TuskerForm.css'; // Reuse form stylesheet for consistency

export default function EventForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'upcoming', // 'upcoming' or 'past'
    description: '',
    sharedBy: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Create Event';
  }, []);

  useEffect(() => {
    // Admin route protection
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, date, type, description, sharedBy } = formData;

    if (!title || !date || !description || !sharedBy) {
      setError('Please fill in all required fields.');
      return;
    }

    addEvent({
      title,
      date,
      description,
      sharedBy,
      image: null
    }, type);

    navigate('/projects');
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="form-card">
          <div className="form-header">
            <div className="form-header-badge">
              <CalendarPlus size={20} />
            </div>
            <h1 className="form-title">Create New Event</h1>
            <p className="form-subtitle">Add a past or upcoming event to the WTS projects timeline</p>
          </div>

          <form onSubmit={handleSubmit} className="tusker-admin-form">
            {error && <div className="form-error-msg">{error}</div>}

            <div className="form-grid">
              {/* Title */}
              <div className="form-group full-width-field">
                <label className="form-label required">Event Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. WNPS Monthly Lecture series"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label required">Event Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              {/* Event Type */}
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select
                  name="type"
                  className="form-input form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="upcoming">Upcoming Event</option>
                  <option value="past">Past Event</option>
                </select>
              </div>

              {/* Shared By */}
              <div className="form-group full-width-field">
                <label className="form-label required">Organizer / Shared By</label>
                <input
                  type="text"
                  name="sharedBy"
                  className="form-input"
                  placeholder="e.g. WTS Team or Namal Kamalgoda"
                  value={formData.sharedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width-field">
              <label className="form-label required">Event Description</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows="4"
                placeholder="Give details about the event, what topics will be covered, who can attend, or wrap-up notes..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                <Save size={16} />
                <span>Create Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
