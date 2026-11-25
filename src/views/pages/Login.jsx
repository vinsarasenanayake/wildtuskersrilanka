/**
 * @file Login.jsx
 * @description Administrator authentication interface. Validates credentials with Supabase
 * auth and handles redirects for authenticated administrative users.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { SITE_ASSETS } from '../../constants/siteAssets';
import { useAuth } from '../../controllers/useAuth';

const wtsLogo = SITE_ASSETS.wtsLogo;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login, isAdmin, authLoading } = useAuth();

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Admin Login';
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin');
    }
  }, [authLoading, isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const errMsg = await login(email, password);
    setSubmitting(false);
    if (errMsg) {
      setError(errMsg);
    } else {
      setError('');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b2518] flex flex-col lg:flex-row items-center justify-center p-3.5 sm:p-6 lg:p-12 gap-3 sm:gap-6 lg:gap-24 relative overflow-x-hidden">
      {/* Back to Home Link */}
      <div className="absolute top-3.5 left-3.5 sm:top-8 sm:left-8 z-20">
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer no-underline bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-xs"
        >
          <ChevronLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Brand & Mission Side */}
      <div className="w-full max-w-[500px] flex flex-col items-center text-center mt-9 sm:mt-12 lg:mt-0 shrink-0">
        <Link
          to="/"
          className="inline-block hover:opacity-90 hover:scale-[1.02] transition-all duration-300 mb-1.5 sm:mb-6"
        >
          <img
            src={wtsLogo}
            alt="Wild Tuskers Sri Lanka"
            className="h-[8.8rem] sm:h-[9.5rem] md:h-[11rem] lg:h-[14rem] mx-auto filter drop-shadow-lg object-contain"
          />
        </Link>
        <p className="hidden sm:block font-sans text-xs sm:text-[1.02rem] text-[#b0c9bd] max-w-[480px] leading-relaxed font-normal m-0 px-2">
          Wild Tuskers Sri Lanka is dedicated to identifying, documenting, and safeguarding
          the rare tusked elephants of Sri Lanka, guardians of our natural heritage.
        </p>
      </div>

      {/* Admin Login Portal Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[1.25rem] sm:rounded-[2rem] p-4 sm:p-7 md:px-10 md:py-9 shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-1 sm:mb-0">
        <div className="text-center mb-3 sm:mb-6 flex flex-col items-center">
          <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0b2518]/8 text-[#c69b55] flex items-center justify-center mb-1.5 sm:mb-3 border border-[#0b2518]/10 shadow-sm">
            <Shield size={18} className="sm:w-7 sm:h-7" />
          </div>
          <h1 className="font-serif text-lg sm:text-[1.8rem] font-bold text-[#0b2518] mb-0.5 sm:mb-1.5 leading-tight">
            Admin Portal
          </h1>
          <p className="text-[#5c6c64] text-[0.76rem] sm:text-[0.88rem] max-w-[340px] leading-relaxed m-0">
            Sign in with authorized administrator credentials to manage records, notes, and observations.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.78rem] sm:text-[0.82rem] font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <label className="text-[0.76rem] sm:text-[0.82rem] font-semibold text-[#1f2824] uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-[#889990] pointer-events-none" />
              <input
                type="email"
                required
                placeholder="admin@wildtuskers.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-[#e3ece8] focus:border-[#c69b55] focus:outline-none focus:ring-2 focus:ring-[#c69b55]/20 transition-all bg-[#faf8f5] text-[#1f2824] placeholder:text-[#9aa8a1] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <label className="text-[0.76rem] sm:text-[0.82rem] font-semibold text-[#1f2824] uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-[#889990] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#e3ece8] focus:border-[#c69b55] focus:outline-none focus:ring-2 focus:ring-[#c69b55]/20 transition-all bg-[#faf8f5] text-[#1f2824] placeholder:text-[#9aa8a1] text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 bg-none border-none cursor-pointer text-[#889990] hover:text-[#1f2824] p-0 flex items-center transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="disabled:opacity-60 disabled:cursor-wait w-full bg-[#0b2518] text-white py-3 sm:py-3.5 rounded-xl font-bold hover:bg-[#16402b] hover:-translate-y-[0.5px] hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all cursor-pointer mt-1.5 sm:mt-3 text-xs sm:text-[0.95rem] flex items-center justify-center gap-2 border-none shadow-md"
          >
            <span>{submitting ? 'Signing in…' : 'Sign In to Admin Portal'}</span>
            <ArrowRight size={16} />
          </button>

          {import.meta.env.DEV && (
            <button
              type="button"
              id="dev-test-login-btn"
              onClick={() => {
                if (window.__setAdminForTesting) {
                  window.__setAdminForTesting(true);
                } else {
                  sessionStorage.setItem('wts_qa_admin', 'true');
                }
                navigate('/admin');
              }}
              className="w-full mt-2 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Developer Bypass: Login as Test Admin
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
