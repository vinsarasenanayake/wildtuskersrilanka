import React, { useEffect } from 'react';
import wtsLogo from '../../assets/images/wtslogo.png';
import heroBg from '../../assets/images/hero-bg.jpg';

export default function Home() {
  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Home';
  }, []);

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen text-white bg-[#0b120e] overflow-x-hidden lg:overflow-hidden flex flex-col justify-center items-center">
      {/* Full-screen fixed background image eliminating any white bar or gap */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Reduced dark overlay for vibrant background visibility */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60" />
      </div>

      {/* Main Home Content fitted inside viewport */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-[70px] pb-4 flex flex-col items-center justify-center text-center gap-4 sm:gap-5 lg:gap-6 my-auto">
        
        {/* Logo */}
        <div className="flex justify-center items-center">
          <img
            src={wtsLogo}
            alt="Wild Tusker Sri Lanka"
            className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[580px] xl:max-w-[600px] h-auto object-contain drop-shadow-[0_18px_46px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Mission Statement */}
        <p className="font-sans text-[0.95rem] sm:text-[1.05rem] text-[#f2f6f4] max-w-[760px] leading-[1.7] font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] m-0">
          Wild Tuskers Sri Lanka is a dedicated team of wildlife researchers and conservationists
          committed to identifying and protecting the rare tusked elephants of Sri Lanka,
          guardians of one of Asia's most endangered natural treasures.
        </p>

        {/* Compact Glassy Container for Population Counts */}
        <div className="w-full max-w-[820px] rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 px-3 py-3 sm:px-5 sm:py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 lg:divide-x lg:divide-white/10">
            
            {/* 1. Total Recorded */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1 sm:px-3 sm:py-1.5">
              <span className="font-sans text-[1.75rem] sm:text-[1.95rem] font-extrabold text-white leading-none">
                322
              </span>
              <p className="font-sans text-[0.82rem] sm:text-[0.85rem] font-semibold text-[#cbd5e1] leading-tight m-0 mt-1.5">
                Total Recorded
              </p>
            </div>

            {/* 2. Living */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1 sm:px-3 sm:py-1.5">
              <span className="font-sans text-[1.75rem] sm:text-[1.95rem] font-extrabold text-white leading-none">
                276
              </span>
              <p className="font-sans text-[0.82rem] sm:text-[0.85rem] font-semibold text-[#cbd5e1] leading-tight m-0 mt-1.5">
                Living
              </p>
            </div>

            {/* 3. Missing */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1 sm:px-3 sm:py-1.5">
              <span className="font-sans text-[1.75rem] sm:text-[1.95rem] font-extrabold text-white leading-none">
                172
              </span>
              <p className="font-sans text-[0.82rem] sm:text-[0.85rem] font-semibold text-[#cbd5e1] leading-tight m-0 mt-1.5">
                Missing
              </p>
              <p className="font-sans text-[0.68rem] sm:text-[0.7rem] text-[#94a3b8] leading-tight m-0 mt-0.5 whitespace-nowrap">
                (no records for last two years)
              </p>
            </div>

            {/* 4. Deceased Tuskers */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1 sm:px-3 sm:py-1.5">
              <span className="font-sans text-[1.75rem] sm:text-[1.95rem] font-extrabold text-white leading-none">
                46
              </span>
              <p className="font-sans text-[0.82rem] sm:text-[0.85rem] font-semibold text-[#cbd5e1] leading-tight m-0 mt-1.5">
                Deceased Tuskers
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
