import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import wtsLogo from '../../assets/images/wtslogo.png';
import { useAuth } from '../../controllers/useAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@wildtuskers.lk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login } = useAuth();

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Admin Login';
    if (localStorage.getItem('isAdmin') === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const errMsg = login(email, password);
    if (errMsg) {
      setError(errMsg);
    } else {
      setError('');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b2518] flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-10 lg:gap-24 relative overflow-hidden">
      {/* Back to Home Link */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Brand & Mission Side */}
      <div className="w-full max-w-[500px] flex flex-col items-center text-center mt-12 lg:mt-0">
        <Link
          to="/"
          className="inline-block hover:opacity-90 hover:scale-[1.02] transition-all duration-300 mb-6"
        >
          <img
            src={wtsLogo}
            alt="Wild Tuskers Sri Lanka"
            className="h-[9rem] md:h-[13rem] lg:h-[15rem] mx-auto filter drop-shadow-lg object-contain"
          />
        </Link>
        <p className="font-sans text-[1.02rem] text-[#b0c9bd] max-w-[480px] leading-[1.8rem] font-normal">
          Wild Tuskers Sri Lanka is dedicated to identifying, documenting, and safeguarding
          the rare tusked elephants of Sri Lanka, guardians of our natural heritage.
        </p>
      </div>

      {/* Admin Login Portal Card */}
      <div className="w-full max-w-[480px] bg-white rounded-[2rem] p-8 sm:px-10 sm:py-9 shadow-[0_20px_60px_rgba(0,0,0,0.3)] lg:mb-0 mb-12">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0b2518]/8 text-[#c69b55] flex items-center justify-center mb-3 border border-[#0b2518]/10 shadow-sm">
            <Shield size={28} />
          </div>
          <h1 className="font-serif text-[1.8rem] font-bold text-[#0b2518] mb-1.5 leading-tight">
            Admin Portal
          </h1>
          <p className="text-[#5c6c64] text-[0.88rem] max-w-[360px] leading-relaxed">
            Sign in with authorized administrator credentials to manage records, notes, and observations.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[10px] px-4 py-3 font-sans text-[0.82rem] font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-[#1f2824] uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-[#889990] pointer-events-none" />
              <input
                type="email"
                required
                placeholder="admin@wildtuskers.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e3ece8] focus:border-[#c69b55] focus:outline-none focus:ring-2 focus:ring-[#c69b55]/20 transition-all bg-[#faf8f5] text-[#1f2824] placeholder:text-[#9aa8a1] text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-[#1f2824] uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-[#889990] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#e3ece8] focus:border-[#c69b55] focus:outline-none focus:ring-2 focus:ring-[#c69b55]/20 transition-all bg-[#faf8f5] text-[#1f2824] placeholder:text-[#9aa8a1] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 bg-none border-none cursor-pointer text-[#889990] hover:text-[#1f2824] p-0 flex items-center transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#0b2518] text-white py-3.5 rounded-xl font-bold hover:bg-[#16402b] hover:-translate-y-[0.5px] hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all cursor-pointer mt-3 text-[0.95rem] flex items-center justify-center gap-2 border-none shadow-md"
          >
            <span>Sign In to Admin Portal</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
