import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import wtsLogo from '../assets/images/wtslogo.png';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Admin';
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Dummy login validation
    if (email === 'admin@wildtuskers.lk' && password === 'admin123') {
      setError('');
      localStorage.setItem('isAdmin', 'true');
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Link to="/" className="login-logo-link" title="Back to Home">
              <img src={wtsLogo} alt="WTS Logo" className="login-logo-img" />
            </Link>
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Sign in to manage wild tuskers documentation and projects</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error-msg">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="admin@wildtuskers.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Sign In</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
