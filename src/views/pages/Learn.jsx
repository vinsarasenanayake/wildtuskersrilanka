/**
 * @file Learn.jsx
 * @description Educational and field research hub for Sri Lanka's wild tuskers.
 * Features an introductory overview and interactive toggle between Special Observations
 * (annual field observations, musth cycles, health developments) and Tusker Identification
 * (morphological identification guides, ear biometrics, and presentations).
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Binoculars, Layers, ShieldAlert } from 'lucide-react';
import SpecialObservations from './SpecialObservations';
import TuskerIdentification from './TuskerIdentification';
import PublicConservationZones from './PublicConservationZones';
import RiskFrameworkView from './RiskFrameworkView';

export default function Learn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const validTabs = ['observations', 'identification', 'zones', 'risk-framework'];
  const activeTab = validTabs.includes(currentTab) ? currentTab : 'observations';

  useEffect(() => {
    const titles = {
      observations: 'Special Observations',
      identification: 'Tusker Identification',
      zones: 'WTS Conservation Zones',
      'risk-framework': 'WTS Risk Framework',
    };
    document.title = `Wild Tuskers Sri Lanka | ${titles[activeTab] || 'Research & Educational Hub'}`;
  }, [activeTab]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey }, { replace: true });
  };

  return (
    <div className={`bg-[#f7f8fa] min-h-screen pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] ${activeTab === 'zones' ? 'pb-4 sm:pb-8' : 'pb-24 sm:pb-32'} flex-1 flex flex-col font-sans w-full max-w-full overflow-x-hidden`}>
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 min-w-0">

        {/* ── Page Header ── */}
        <div className="flex flex-col items-center justify-center text-center pb-6 sm:pb-8 border-b border-[#e5e7eb] gap-3 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-primary text-xs font-bold tracking-wide uppercase">
            <GraduationCap size={15} className="text-accent" />
            <span>Research & Educational Hub</span>
          </div>

          <h1 className="font-sans text-[clamp(1.4rem,4.5vw,2.85rem)] font-bold text-[#111111] m-0 tracking-tight leading-tight text-center max-w-full">
            Learn about Sri Lankan Wild Tuskers
          </h1>

          <p className="font-sans text-sm sm:text-[0.98rem] md:text-[1.02rem] text-[#555555] leading-relaxed max-w-3xl mx-auto m-0 text-center">
            Explore rare tusker encounters, unique behaviours, and significant sightings documented by Wild Tuskers Sri Lanka over the past 13 years. Each observation contributes valuable knowledge towards understanding and conserving Sri Lanka’s rare tusked elephants. WTS will also share the key features and methodology used to identify individual tuskers. Uncover the knowledge, discoveries, and conservation stories shaping the future of Sri Lanka’s rare tusked elephants.
          </p>

          {/* ── Segmented Toggle (4 options) ── */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center w-full sm:w-auto p-1.5 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs mt-3 select-none gap-1.5 max-w-full sm:max-w-none">
            <button
              type="button"
              onClick={() => handleTabChange('observations')}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
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
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'identification'
                  ? 'bg-[#0b2518] text-accent shadow-sm'
                  : 'bg-transparent text-[#4b5563] hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <GraduationCap size={16} />
              <span>Tusker Identification</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('zones')}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'zones'
                  ? 'bg-[#0b2518] text-accent shadow-sm'
                  : 'bg-transparent text-[#4b5563] hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <Layers size={16} />
              <span>WTS Conservation Zones</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('risk-framework')}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'risk-framework'
                  ? 'bg-[#0b2518] text-accent shadow-sm'
                  : 'bg-transparent text-[#4b5563] hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <ShieldAlert size={16} />
              <span>WTS Risk Framework</span>
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
        <div className={activeTab === 'zones' ? 'w-full block animate-fade-in' : 'hidden'}>
          {activeTab === 'zones' && <PublicConservationZones isActive={true} />}
        </div>
        <div className={activeTab === 'risk-framework' ? 'w-full block animate-fade-in' : 'hidden'}>
          <RiskFrameworkView />
        </div>

      </div>
    </div>
  );
}
