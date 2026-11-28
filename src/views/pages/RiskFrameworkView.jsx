/**
 * @file RiskFrameworkView.jsx
 * @description Educational presentation of the WTS Multi-Factorial Risk Assessment Framework.
 * Details the normalized mathematical model, the five weighted evaluation dimensions,
 * the rationale for reversed surveillance uncertainty, the 5 management posture bands,
 * and the institutional governance boundary.
 */

import React from 'react';
import {
  ShieldAlert,
  Scale,
  Activity,
  EyeOff,
  Info,
  Layers
} from 'lucide-react';
import { RISK_BANDS } from '../../utils/riskFramework';

export default function RiskFrameworkView() {
  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-fade-in font-sans">
      
      {/* ── 1. Hero Overview & Core Objective ── */}
      <div
        id="risk-framework-hero"
        className="bg-gradient-to-br from-[#0b2518] via-[#123824] to-[#0b2518] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-white/10 relative overflow-hidden scroll-mt-24"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert size={14} />
            <span>Conservation Prioritization Model</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white m-0 tracking-tight leading-tight">
            WTS Multi-Factorial Risk Evaluation Framework
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-4 max-w-3xl text-justify">
            Sri Lanka’s wild tuskers represent less than two percent of the island&apos;s total wild elephant population. 
            To effectively protect these rare genetic flagships amid escalating Human-Elephant Conflict (HEC), 
            Wild Tuskers Sri Lanka (WTS) developed an evidence-based risk prioritization index. 
            This quantitative methodology eliminates subjective bias, systematically evaluates field vulnerability, 
            and directs monitoring patrols and conflict mitigation to where interventions are most critically required.
          </p>
        </div>
      </div>

      {/* ── 2. The Mathematical Normalization Formula ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e7eb] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f0f2f1]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1">
              <Scale size={14} />
              <span>Mathematical Formulation</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#111827] m-0">
              The Composite Risk Calculation Formula
            </h3>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#faf5ec] text-[#a16207] border border-[#fef08a] font-semibold self-start md:self-auto">
            Scale: 0.0 to 100.0 Points
          </span>
        </div>

        <div className="my-6 p-4 sm:p-6 rounded-2xl bg-[#0b2518] text-white flex flex-col items-center shadow-inner border border-emerald-900/40 w-full max-w-full min-w-0">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-accent font-semibold mb-3 text-center">
            Weighted Linear Combination Model
          </span>

          {/* Dedicated Formula Scroll Container with Left-Aligned Mobile Safe Scroll */}
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain py-2 px-1 scrollbar-thin scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
            <div className="inline-flex min-w-full items-center justify-start sm:justify-center font-mono text-sm sm:text-base md:text-lg font-bold text-white tracking-wide whitespace-nowrap px-2 gap-1.5">
              <span className="text-gray-300 font-sans font-semibold mr-1">Risk Score =</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[#c69b55] shadow-xs">(B / 7 × 25)</span>
              <span className="text-gray-400 font-normal">+</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[#f97316] shadow-xs">(H / 6 × 20)</span>
              <span className="text-gray-400 font-normal">+</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[#ef4444] shadow-xs">(C / 6 × 15)</span>
              <span className="text-gray-400 font-normal">+</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[#818cf8] shadow-xs">(S / 6 × 10)</span>
              <span className="text-gray-400 font-normal">+</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[#eab308] shadow-xs">(R / 7 × 30)</span>
            </div>
          </div>

          {/* Mobile Scroll Indicator Hint */}
          <div className="sm:hidden text-[10px] text-gray-400 mt-1 flex items-center justify-center gap-1 select-none">
            <span>↔ Scroll horizontally to view full formula</span>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-400 mt-3 max-w-xl text-center leading-relaxed m-0">
            Each evaluated parameter is scaled against its individual domain maximum, multiplied by its designated weight percentage, and summed into a standardized 100-point composite score.
          </p>
        </div>

        {/* Legend of Variables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#c69b55]">R (Specimen Rarity)</span>
              <span className="text-xs font-bold text-gray-700">30%</span>
            </div>
            <span className="text-xs text-gray-500">Max scale: 7 points</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#ef4444]">B (Behaviour Risk)</span>
              <span className="text-xs font-bold text-gray-700">25%</span>
            </div>
            <span className="text-xs text-gray-500">Max scale: 7 points</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#f97316]">H (Settlement Overlap)</span>
              <span className="text-xs font-bold text-gray-700">20%</span>
            </div>
            <span className="text-xs text-gray-500">Max scale: 6 points</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#dc2626]">C (Conflict Intensity)</span>
              <span className="text-xs font-bold text-gray-700">15%</span>
            </div>
            <span className="text-xs text-gray-500">Max scale: 6 points</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#6366f1]">S (Sighting Uncertainty)</span>
              <span className="text-xs font-bold text-gray-700">10%</span>
            </div>
            <span className="text-xs text-gray-500">Max scale: 6 points (Reversed)</span>
          </div>
        </div>
      </div>

      {/* ── 3. The Five Core Evaluated Dimensions ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-accent" />
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] m-0">
            The Five Core Evaluated Dimensions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Dimension 1: Specimen Rarity */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Weight: 30%
                </span>
                <span className="font-mono text-xs font-semibold text-gray-500">Scale: 1 to 7</span>
              </div>
              <h4 className="text-base font-bold text-[#111827] m-0 mb-1.5">
                1. Specimen Rarity (R)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed m-0 mb-3">
                Assesses phenotypic uniqueness, genetic prominence, and morphological characteristics of the tusks (such as iconic symmetry, exceptional length, splayed or crossed formations, or rare physiological traits).
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <strong>Objective:</strong> Prioritizes irreplaceable biological flagships whose loss would critically impair regional genetic diversity.
            </div>
          </div>

          {/* Dimension 2: Behaviour Risk */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-red-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                  Weight: 25%
                </span>
                <span className="font-mono text-xs font-semibold text-gray-500">Scale: 1 to 7</span>
              </div>
              <h4 className="text-base font-bold text-[#111827] m-0 mb-1.5">
                2. Behaviour Risk (B)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed m-0 mb-3">
                Evaluates documented behavioral temperament, level of habituation to human settlements and transit roads, aggression thresholds during musth cycles, and habitual raiding of seasonal paddy or crop cultivation.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <strong>Objective:</strong> Identifies individuals exhibiting high human-proximity bold behaviors that trigger immediate escalation.
            </div>
          </div>

          {/* Dimension 3: Settlement Overlap */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-orange-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                  Weight: 20%
                </span>
                <span className="font-mono text-xs font-semibold text-gray-500">Scale: 1 to 6</span>
              </div>
              <h4 className="text-base font-bold text-[#111827] m-0 mb-1.5">
                3. Settlement Overlap (H)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed m-0 mb-3">
                Measures spatial proximity to human habitations, frequent traversal through village corridors, crossing of active railway lines or highways, and continuous movement along agricultural fencing boundaries.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <strong>Objective:</strong> Quantifies spatial interface and likelihood of encounters between the tusker and rural community residences.
            </div>
          </div>

          {/* Dimension 4: Conflict Intensity */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  Weight: 15%
                </span>
                <span className="font-mono text-xs font-semibold text-gray-500">Scale: 1 to 6</span>
              </div>
              <h4 className="text-base font-bold text-[#111827] m-0 mb-1.5">
                4. Conflict Intensity (C)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed m-0 mb-3">
                Records the historical recurrence of Human-Elephant Conflict incidents, property damage records, retaliatory threats from local communities, and prior injuries (such as gunshot wounds, wire snares, or jaw bombs).
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <strong>Objective:</strong> Determines exposure to retaliatory poaching hazards and immediate physical survival threats.
            </div>
          </div>

          {/* Dimension 5: Sighting Uncertainty (Reversed) */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Weight: 10% (Reversed Metric)
                </span>
                <span className="font-mono text-xs font-semibold text-gray-500">Scale: 1 to 6</span>
              </div>
              <h4 className="text-base font-bold text-[#111827] m-0 mb-1.5">
                5. Sighting Frequency Risk (S)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed m-0 mb-3">
                Measures observation frequency and uncertainty. Frequently observed tuskers provide regular behavioral updates, health status, and corridor tracking. Conversely, individuals rarely sighted in the field introduce substantial monitoring gaps and elevated uncertainty regarding health, snare entrapment, or unmonitored human interaction.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-indigo-700 bg-indigo-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl flex items-start gap-2">
              <EyeOff size={14} className="shrink-0 mt-0.5 text-indigo-600" />
              <span>
                <strong>Methodological Rationale:</strong> Fewer sightings yield a <em>higher</em> uncertainty score. A lack of recent sightings constitutes an elevated surveillance alert rather than low risk.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. Normalized Risk Bands & Required Management Postures ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e7eb] shadow-sm flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1">
            <Activity size={14} />
            <span>Operational Response Protocols</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] m-0">
            Risk Score Bands and Management Postures
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 m-0 mt-1">
            Each normalized score maps into a defined posture category, dictating the intensity of field observation and early-warning preparedness.
          </p>
        </div>

        {/* Visual Continuous Gauge */}
        <div className="flex flex-col gap-2">
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 flex gap-1 border border-gray-200">
            {RISK_BANDS.map((b) => (
              <div
                key={b.key}
                className="h-full flex-1 rounded-full transition-all"
                style={{ backgroundColor: b.color }}
                title={`${b.label}: ${b.min}–${b.max} pts`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-gray-500 px-1">
            <span>0 Very Low</span>
            <span>20 Low</span>
            <span>40 Medium</span>
            <span>60 High</span>
            <span>80 Critical 100</span>
          </div>
        </div>

        {/* The 5 Posture Detail Cards */}
        <div className="grid grid-cols-1 gap-3.5">
          {RISK_BANDS.map((band) => (
            <div
              key={band.key}
              className="p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              style={{
                backgroundColor: band.bgColor,
                borderColor: band.borderColor,
              }}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0"
                  style={{ backgroundColor: band.color }}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#111827]">
                      {band.label}
                    </span>
                    <span
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: '#ffffff',
                        color: band.textColor,
                        border: `1px solid ${band.borderColor}`,
                      }}
                    >
                      Score: {band.min === 0 ? '0–20' : `${band.min + 1}–${band.max}`}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1" style={{ color: band.textColor }}>
                    Management Posture: {band.posture}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-700 sm:max-w-md sm:text-right leading-relaxed">
                {band.actionText}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Institutional Decision Boundary & Governance ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#fafaf9] border border-[#e5e7eb] flex items-start gap-3.5 text-xs text-gray-600 leading-relaxed shadow-xs">
        <Info size={20} className="text-[#a16207] shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900 block text-sm mb-1">
            Institutional Decision Boundary &amp; Governance Mandate
          </strong>
          <p className="m-0 text-gray-600">
            The WTS Normalized Risk Index is an objective, evidence-based prioritization tool intended strictly for scientific field surveillance, early-warning alerts, and non-invasive monitoring coordination. 
            It does <strong>not</strong> constitute an automated directive or authorization for physical wildlife interventions (such as chemical sedation, capture, translocation, or satellite radio-collaring). 
            All physical management actions and protective interventions remain strictly and exclusively under the statutory authority of the Department of Wildlife Conservation (DWC) Sri Lanka and certified wildlife veterinary specialists.
          </p>
        </div>
      </div>

    </div>
  );
}
