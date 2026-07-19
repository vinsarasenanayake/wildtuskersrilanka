import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTuskers, addTusker, updateTusker } from '../utils/tuskersStore';
import { ArrowLeft, Save, PlusCircle, Sparkles } from 'lucide-react';
import './TuskerForm.css';

const LOCATIONS = ['Kaudulla', 'Minneriya', 'Sinharaja', 'Udawalawe', 'Wilpattu', 'Yala'];

export default function TuskerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sinhala: '',
    location: LOCATIONS[0],
    listedDate: '',
    recordedBy: '',
    description: '',
    specialMarks: '',
    specialWounds: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    if (isEditMode) {
      const tuskers = getTuskers();
      const existing = tuskers.find(t => t.id.toLowerCase() === id.toLowerCase());
      if (existing) {
        setFormData({
          id: existing.id,
          name: existing.name,
          sinhala: existing.sinhala,
          location: existing.location || LOCATIONS[0],
          listedDate: existing.listedDate || '',
          recordedBy: existing.recordedBy || '',
          description: existing.description || '',
          specialMarks: existing.specialMarks || '',
          specialWounds: existing.specialWounds || ''
        });
      } else {
        setError('Tusker not found for editing.');
      }
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { id: tuskerId, name, sinhala, location, listedDate, recordedBy, description, specialMarks, specialWounds } = formData;

    if (!tuskerId || !name || !sinhala || !listedDate) {
      setError('Please fill in all required fields (ID, Name, Sinhala Name, First Recorded Date).');
      return;
    }

    // Format ID to uppercase
    const formattedId = tuskerId.toUpperCase().trim();

    if (isEditMode) {
      updateTusker(id, {
        name,
        sinhala,
        location,
        listedDate,
        recordedBy,
        description,
        specialMarks,
        specialWounds
      });
      navigate(`/tuskers/${formattedId.toLowerCase()}`);
    } else {
      // Check if ID already exists
      const tuskers = getTuskers();
      if (tuskers.some(t => t.id.toUpperCase() === formattedId)) {
        setError(`Tusker with ID ${formattedId} already exists.`);
        return;
      }

      addTusker({
        id: formattedId,
        name,
        sinhala,
        location,
        listedDate,
        recordedBy,
        description,
        specialMarks,
        specialWounds,
        photos: [null] // default slot
      });
      navigate('/tuskers');
    }
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
              {isEditMode ? <Sparkles size={20} /> : <PlusCircle size={20} />}
            </div>
            <h1 className="form-title">{isEditMode ? `Edit Tusker Profile` : 'Add New Tusker'}</h1>
            <p className="form-subtitle">
              {isEditMode ? `Updating information for ${formData.id}` : 'Create a new documented profile in the WTS registry'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="tusker-admin-form">
            {error && <div className="form-error-msg">{error}</div>}

            <div className="form-grid">
              {/* ID */}
              <div className="form-group">
                <label className="form-label required">Tusker ID</label>
                <input
                  type="text"
                  name="id"
                  className="form-input"
                  placeholder="e.g. T305"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={isEditMode}
                />
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label required">Tusker Name (English)</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Nero"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Sinhala Name */}
              <div className="form-group">
                <label className="form-label required">Sinhala Name</label>
                <input
                  type="text"
                  name="sinhala"
                  className="form-input"
                  placeholder="e.g. නීරෝ"
                  value={formData.sinhala}
                  onChange={handleChange}
                />
              </div>

              {/* Location Dropdown */}
              <div className="form-group">
                <label className="form-label">Location</label>
                <select
                  name="location"
                  className="form-input form-select"
                  value={formData.location}
                  onChange={handleChange}
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Date Calendar Picker */}
              <div className="form-group">
                <label className="form-label required">First Recorded Date</label>
                <input
                  type="date"
                  name="listedDate"
                  className="form-input"
                  value={formData.listedDate}
                  onChange={handleChange}
                />
              </div>

              {/* Recorded By */}
              <div className="form-group">
                <label className="form-label">Recorded By</label>
                <input
                  type="text"
                  name="recordedBy"
                  className="form-input"
                  placeholder="e.g. WTS Team"
                  value={formData.recordedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width-field">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows="4"
                placeholder="Describe the tusker's behaviour, usual habitat, musth cycles, and physical presence..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid">
              {/* Special Marks */}
              <div className="form-group">
                <label className="form-label">Special Marks</label>
                <input
                  type="text"
                  name="specialMarks"
                  className="form-input"
                  placeholder="e.g. V-shaped notch on right ear"
                  value={formData.specialMarks}
                  onChange={handleChange}
                />
              </div>

              {/* Special Wounds */}
              <div className="form-group">
                <label className="form-label">Special Wounds</label>
                <input
                  type="text"
                  name="specialWounds"
                  className="form-input"
                  placeholder="e.g. Healed gunshot mark"
                  value={formData.specialWounds}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
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
