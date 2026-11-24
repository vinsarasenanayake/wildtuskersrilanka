/**
 * @file Learn.jsx
 * @description Educational and field research hub for Sri Lanka's wild tuskers.
 * Features an introductory overview and interactive toggle between Special Observations
 * (annual field observations, musth cycles, health developments) and Tusker Identification
 * (morphological identification guides, ear biometrics, and presentations).
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Binoculars } from 'lucide-react';
import SpecialObservations from './SpecialObservations';
import TuskerIdentification from './TuskerIdentification';

export default function Learn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const activeTab = currentTab === 'identification' ? 'identification' : 'observations';

  useEffect(() => {
    const tabName = activeTab === 'identification' ? 'Tusker Identification' : 'Special Observations';
    document.title = `Wild Tuskers Sri Lanka | Learn - ${tabName}`;
  }, [activeTab]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey }, { replace: true });
  };

  return (
    <div className="bg-[#f7f8fa] min-h-screen pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-24 font-sans">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col items-center justify-center text-center pb-6 sm:pb-8 border-b border-[#e5e7eb] gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-primary text-xs font-bold tracking-wide uppercase">
            <GraduationCap size={15} className="text-accent" />
            <span>Research & Educational Hub</span>
          </div>

          <h1 className="font-sans text-[clamp(1.5rem,4.5vw,2.85rem)] font-bold text-[#111111] m-0 tracking-tight leading-tight text-center">
            Learn about Sri Lankan Wild Tuskers
          </h1>

          <p className="font-sans text-xs sm:text-[0.96rem] text-[#555555] leading-relaxed max-w-3xl mx-auto m-0 text-center">
            Explore comprehensive field research and educational materials documenting Sri Lanka's rare wild tuskers.
            Follow in-depth annual behavioral records, musth cycles, and physical developments, or study scientific guides
            on individual tusker identification, ear biometrics, and field classification standards.
          </p>

          {/* ── Segmented Toggle (Stacked on mobile portrait, side-by-side on tablet/desktop) ── */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto p-1.5 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs mt-3 select-none gap-1.5 max-w-md sm:max-w-none">
            <button
              type="button"
              onClick={() => handleTabChange('observations')}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-7 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'observations'
                  ? 'bg-[#0b2518] text-accent shadow-sm'
                  : 'bg-transparent text-[#4b5563] hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <Binoculars size={16} />
              <span>Special Observations</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('identification')}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-7 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'identification'
                  ? 'bg-[#0b2518] text-accent shadow-sm'
                  : 'bg-transparent text-[#4b5563] hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <GraduationCap size={16} />
              <span>Tusker Identification</span>
            </button>
          </div>
        </div>

        {/* ── Content Views (Kept mounted for 0ms instant switching and scroll preservation) ── */}
        <div className={activeTab === 'observations' ? 'w-full block animate-fade-in' : 'hidden'}>
          <SpecialObservations embedded />
        </div>
        <div className={activeTab === 'identification' ? 'w-full block animate-fade-in' : 'hidden'}>
          <TuskerIdentification embedded />
        </div>

      </div>
    </div>
  );
}
