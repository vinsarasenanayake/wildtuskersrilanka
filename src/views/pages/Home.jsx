/**
 * @file Home.jsx
 * @description Wild Tuskers Sri Lanka homepage. Features full-screen responsive
 * photographic hero backdrop, mission overview, real-time registry statistics,
 * and quick-access navigation pillars.
 */

import React, { useState, useEffect } from 'react';
import { SITE_ASSETS } from '../../constants/siteAssets';
import hero960 from '../../assets/images/hero-bg-960.webp';
import hero1600 from '../../assets/images/hero-bg-1600.webp';
import hero2400 from '../../assets/images/hero-bg-2400.webp';
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
    };
  }, []);

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen text-white bg-[#0b120e] overflow-x-hidden lg:overflow-hidden flex flex-col justify-center">
      {/* Full-screen fixed background image eliminating any white bar or gap */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Responsive hero: each screen downloads only the size it needs (~60–330 KB instead of 1 MB) */}
        <img
          src={hero1600}
          srcSet={`${hero960} 960w, ${hero1600} 1600w, ${hero2400} 2400w`}
          sizes="(orientation: portrait) 150vh, 100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay for vibrant background visibility with right-side contrast */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/45 lg:via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      {/* Main Home Content: Right-aligned vertical stack (Logo, Mission, Population Counts, AI Box) */}
      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-[70px] sm:pt-[74px] lg:pt-[76px] pb-3 sm:pb-5 flex justify-end text-left my-auto">
        <div className="w-full max-w-[620px] flex flex-col items-center gap-2.5 sm:gap-3 lg:gap-3.5 ml-auto">
          
          {/* 1. Logo (Enlarged to fill space above and below) */}
          <h1 className="flex justify-center items-center w-full m-0 p-0 text-[0px] leading-none">
            <img
              src={wtsLogo}
              alt="Wild Tuskers Sri Lanka"
              className="w-full max-w-[480px] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[620px] max-h-[260px] sm:max-h-[290px] lg:max-h-[330px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            />
          </h1>

          {/* 2. Mission Statement (Enlarged and center-aligned) */}
          <div className="text-center w-full m-0 px-1 flex flex-col gap-2">
            <p className="font-sans text-[0.98rem] sm:text-[1.06rem] md:text-[1.12rem] text-[#f2f6f4] leading-[1.65] font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] m-0">
              <span className="font-semibold text-white">Guardians of a Rare Legacy.</span> Wild Tuskers Sri Lanka unites passionate wildlife enthusiasts and conservationists in a shared mission to identify, protect, and preserve Sri Lanka's magnificent tusked elephants, one of Asia's most extraordinary and endangered wildlife treasures.
            </p>
            <p className="font-sans text-[0.88rem] sm:text-[0.94rem] md:text-[0.98rem] text-[#e6c687] font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] m-0">
              Stand with us. Protect the giants. Preserve the legacy
            </p>
          </div>

          {/* 3. Compact Frosted Glass Population Counts Box */}
          <div className="w-full rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-white/20">
              
              {/* 1. Total Recorded */}
              <div className="flex flex-col items-center justify-center text-center py-2.5 sm:py-3 px-1.5 sm:px-2 min-h-[80px] sm:min-h-[88px]">
                <span className="font-sans text-[1.65rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {stats?.total ?? '—'}
                </span>
                <p className="font-sans text-[0.6rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 uppercase tracking-wider mt-1 whitespace-nowrap m-0">
                  Total Recorded
                </p>
              </div>

              {/* 2. Living */}
              <div className="flex flex-col items-center justify-center text-center py-2.5 sm:py-3 px-1.5 sm:px-2 min-h-[80px] sm:min-h-[88px]">
                <span className="font-sans text-[1.65rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {stats?.living ?? '—'}
                </span>
                <p className="font-sans text-[0.6rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 uppercase tracking-wider mt-1 whitespace-nowrap m-0">
                  Living
                </p>
              </div>

              {/* 3. Missing */}
              <div className="flex flex-col items-center justify-center text-center py-2.5 sm:py-3 px-1.5 sm:px-2 min-h-[80px] sm:min-h-[88px]">
                <span className="font-sans text-[1.65rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {stats?.missing ?? '—'}
                </span>
                <p className="font-sans text-[0.6rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 uppercase tracking-wider mt-1 whitespace-nowrap m-0">
                  Missing
                </p>
              </div>

              {/* 4. Deceased */}
              <div className="flex flex-col items-center justify-center text-center py-2.5 sm:py-3 px-1.5 sm:px-2 min-h-[80px] sm:min-h-[88px]">
                <span className="font-sans text-[1.65rem] sm:text-[1.9rem] md:text-[2.15rem] font-semibold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {stats?.deceased ?? '—'}
                </span>
                <p className="font-sans text-[0.6rem] sm:text-[0.68rem] md:text-[0.7rem] font-normal text-white/75 uppercase tracking-wider mt-1 whitespace-nowrap m-0">
                  Deceased
                </p>
              </div>

            </div>
          </div>

          {/* 4. AI Wild Tusker Identification Box temporarily hidden until standalone app launch */}

        </div>
      </div>
    </div>
  );
}
