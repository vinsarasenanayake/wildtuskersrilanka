import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addResearchEntry } from '../utils/researchStore';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import './TuskerForm.css'; // Reuse form stylesheet for consistency

export default function ResearchForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'past', // 'active' or 'past'
    description: '',
    author: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Admin route protection
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Create Research Entry';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, date, type, description, author } = formData;

    if (!title || !date || !description || !author) {
      setError('Please fill in all required fields.');
      return;
    }

    addResearchEntry({
      title,
      date,
      description,
      author,
      image: null
    }, type);

    navigate('/research');
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
              <BookOpen size={20} />
            </div>
            <h1 className="form-title">Create Research Entry</h1>
            <p className="form-subtitle">Add a scientific publication, field report, or active study</p>
          </div>

          <form onSubmit={handleSubmit} className="tusker-admin-form">
            {error && <div className="form-error-msg">{error}</div>}

            <div className="form-grid">
              {/* Title */}
              <div className="form-group full-width-field">
                <label className="form-label required">Study / Paper Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Analysis of Human-Elephant Conflict in corridors"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label required">Publication Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              {/* Research Type */}
              <div className="form-group">
                <label className="form-label">Research Type</label>
                <select
                  name="type"
                  className="form-input form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="past">Completed Publication</option>
                  <option value="active">Active/Ongoing Study</option>
                </select>
              </div>

              {/* Author */}
              <div className="form-group full-width-field">
                <label className="form-label required">Author / Researcher</label>
                <input
                  type="text"
                  name="author"
                  className="form-input"
                  placeholder="e.g. Dr. Sadeepa Gunawardana"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width-field">
              <label className="form-label required">Abstract / Description</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows="4"
                placeholder="Write a brief abstract or summary of the findings, methodology, and scope..."
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
                <span>Create Entry</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
