/**
 * @file Home.jsx
 * @description Wild Tuskers Sri Lanka homepage. Features full-screen responsive
 * photographic hero backdrop, mission overview, real-time registry statistics,
 * and quick-access navigation pillars.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SITE_ASSETS } from '../../constants/siteAssets';
import hero960 from '../../assets/images/hero-bg-960.webp';
import hero1600 from '../../assets/images/hero-bg-1600.webp';
import hero2400 from '../../assets/images/hero-bg-2400.webp';
import heroMobileBarana from '../../assets/images/hero-mobile-barana.jpg';
import { getTuskers } from '../../models/TuskerModel';

const wtsLogo = SITE_ASSETS.wtsLogo;

export default function Home() {
  const [stats, setStats] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wts_home_stats');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Home';
    let active = true;

    // Lock document scroll on Home in portrait to completely prevent any bounce/scrolling
    const updateScrollLock = () => {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      if (isPortrait) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      }
    };
    updateScrollLock();
    window.addEventListener('resize', updateScrollLock);
    window.addEventListener('orientationchange', updateScrollLock);

    getTuskers()
      .then((tuskers) => {
        if (!active || !tuskers || tuskers.length === 0) return;
        const total = tuskers.length;
        const living = tuskers.filter((t) => t.livingStatus === 'Alive').length;
        const missing = tuskers.filter((t) => t.livingStatus === 'No Recent Record').length;
        const deceased = tuskers.filter((t) => t.livingStatus === 'Deceased').length;
        const nextStats = { total, living, missing, deceased };
        setStats(nextStats);
        try {
          sessionStorage.setItem('wts_home_stats', JSON.stringify(nextStats));
        } catch {
          // ignore
        }
      })
      .catch((err) => console.warn('[Home] Could not load dynamic counts:', err));

    return () => {
      active = false;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      window.removeEventListener('resize', updateScrollLock);
      window.removeEventListener('orientationchange', updateScrollLock);
    };
  }, []);

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] text-white bg-[#0b120e] overflow-hidden landscape:max-h-[500px]:overflow-y-auto flex flex-col justify-between select-none portrait:overscroll-none">
      {/* Full-screen fixed background image eliminating any white bar or gap */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Portrait Orientation Hero Image: Barana centered (Mobile phones & Tablets in portrait) */}
        <img
          src={heroMobileBarana}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="portrait:block landscape:hidden absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        {/* Landscape Orientation Hero Image: Barana on left (Desktops, laptops, landscape tablets/phones) */}
        <img
          src={hero1600}
          srcSet={`${hero960} 960w, ${hero1600} 1600w, ${hero2400} 2400w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="hidden landscape:block absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay for vibrant background visibility with right-side contrast */}
        <div className="absolute inset-0 bg-black/20" />
        {/* Portrait: dark shade at top for logo, clear middle for tusker, dark shade at bottom for text & counts */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 via-20% via-transparent via-45% to-black/95 portrait:block landscape:hidden" />
        {/* Landscape: right-side gradient for content stack */}
        <div className="hidden landscape:block absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-transparent" />
        <div className="hidden landscape:block absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      {/* Main Home Content: Top Logo & Bottom Info in Portrait; Right-aligned stack in Landscape */}
      <div className="home-hero-landscape-wrap relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex flex-col justify-between portrait:justify-between portrait:items-center landscape:justify-center landscape:items-end pt-[68px] sm:pt-[76px] pb-4 sm:pb-8 lg:pb-6">

        {/* 1. TOP / LOGO */}
        <div className="home-hero-landscape-logo-box w-full max-w-[620px] portrait:mx-auto flex justify-center pt-1 sm:pt-2 landscape:pt-0">
          <h1 className="flex justify-center items-center m-0 p-0 text-[0px] leading-none">
            <img
              src={wtsLogo}
              alt="Wild Tuskers Sri Lanka"
              className="home-hero-landscape-logo-img w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[620px] max-h-[145px] sm:max-h-[180px] lg:max-h-[min(300px,34vh)] h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
            />
          </h1>
        </div>

        {/* Transparent middle space on portrait so Barana's face, eyes, and tusks are completely visible */}
        <div className="home-hero-landscape-middle-space flex-1 portrait:block landscape:hidden pointer-events-none min-h-[30px]" />

        {/* 2. BOTTOM / RIGHT: Mission Statement & Compact Frosted Glass Population Counts Box */}
        <div className="home-hero-landscape-bottom-stack w-full max-w-[620px] portrait:mx-auto flex flex-col items-center gap-2.5 sm:gap-3 landscape:mt-2.5 mb-1">

          {/* Mission Statement */}
          <div className="text-center w-full m-0 px-2 flex flex-col gap-1 sm:gap-1.5">
            <p className="home-hero-landscape-mission-text font-sans text-[0.84rem] sm:text-[0.96rem] md:text-[1.08rem] text-[#f2f6f4] leading-[1.55] font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] m-0 text-center">
              <span className="font-semibold text-white">Guardians of a Rare Legacy.</span> Wild Tuskers Sri Lanka unites passionate wildlife enthusiasts and conservationists in a shared mission to identify, protect, and preserve Sri Lanka's magnificent tusked elephants.
            </p>
            <p className="home-hero-landscape-sub-text font-sans text-[0.76rem] sm:text-[0.88rem] md:text-[0.96rem] text-[#e6c687] font-semibold tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] m-0">
              Stand with us. Protect the giants. Preserve the legacy
            </p>
          </div>

          {/* Compact Frosted Glass Population Counts Box - Clickable Stat Links to Registry */}
          <div className="home-hero-landscape-counts-box w-full rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-white/20">

              {/* 1. Total Recorded */}
              <Link
                to="/tuskers"
                state={{ filterStatus: 'ALL' }}
                title="View All Tuskers in Registry"
                className="home-hero-landscape-stat-cell flex flex-col items-center justify-center text-center py-2 sm:py-3 px-1 sm:px-2 min-h-[72px] sm:min-h-[88px] no-underline hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="home-hero-landscape-stat-num font-sans text-[1.4rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:text-accent transition-colors">
                  {stats?.total ?? '-'}
                </span>
                <p className="home-hero-landscape-stat-label font-sans text-[0.54rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 group-hover:text-white uppercase tracking-wider mt-1 whitespace-nowrap m-0 transition-colors">
                  Total Recorded
                </p>
              </Link>

              {/* 2. Living */}
              <Link
                to="/tuskers"
                state={{ filterStatus: 'Alive' }}
                title="View Living Tuskers in Registry"
                className="home-hero-landscape-stat-cell flex flex-col items-center justify-center text-center py-2 sm:py-3 px-1 sm:px-2 min-h-[72px] sm:min-h-[88px] no-underline hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="home-hero-landscape-stat-num font-sans text-[1.4rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:text-accent transition-colors">
                  {stats?.living ?? '-'}
                </span>
                <p className="home-hero-landscape-stat-label font-sans text-[0.54rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 group-hover:text-white uppercase tracking-wider mt-1 whitespace-nowrap m-0 transition-colors">
                  Living
                </p>
              </Link>

              {/* 3. No Recent Record */}
              <Link
                to="/tuskers"
                state={{ filterStatus: 'No Recent Record' }}
                title="View Tuskers with No Recent Record"
                className="home-hero-landscape-stat-cell flex flex-col items-center justify-center text-center py-2 sm:py-3 px-1 sm:px-2 min-h-[72px] sm:min-h-[88px] no-underline hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="home-hero-landscape-stat-num font-sans text-[1.4rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:text-accent transition-colors">
                  {stats?.missing ?? '-'}
                </span>
                <p className="home-hero-landscape-stat-label font-sans text-[0.54rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 group-hover:text-white uppercase tracking-wider mt-1 whitespace-nowrap m-0 transition-colors">
                  No Recent Record
                </p>
              </Link>

              {/* 4. Deceased */}
              <Link
                to="/tuskers"
                state={{ filterStatus: 'Deceased' }}
                title="View Deceased Tuskers in Registry"
                className="home-hero-landscape-stat-cell flex flex-col items-center justify-center text-center py-2 sm:py-3 px-1 sm:px-2 min-h-[72px] sm:min-h-[88px] no-underline hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="home-hero-landscape-stat-num font-sans text-[1.4rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:text-accent transition-colors">
                  {stats?.deceased ?? '-'}
                </span>
                <p className="home-hero-landscape-stat-label font-sans text-[0.54rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 group-hover:text-white uppercase tracking-wider mt-1 whitespace-nowrap m-0 transition-colors">
                  Deceased
                </p>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
