import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, Info, Activity, Scale, EyeOff } from 'lucide-react';
import { getRiskBand, getTuskerRiskData, FRAMEWORK_DIMENSIONS, RISK_BANDS } from '../../utils/riskFramework';

export default function RiskAssessmentModal({ tusker, onClose }) {
  if (!tusker) return null;

  const scoreNum = parseFloat(tusker.riskScore);
  const band = getRiskBand(scoreNum);
  const riskDetail = getTuskerRiskData(tusker.id);

  // Dimension details (if recorded for this tusker)
  const dims = riskDetail?.dimensions || null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-modal-title"
    >
      <div
        className="bg-white rounded-[20px] max-w-[640px] w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e8ecea] relative my-auto overflow-hidden text-[#111111]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0b2518] to-[#123824] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#c69b55]/20 border border-[#c69b55]/40 flex items-center justify-center text-[#c69b55] shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0">
              <h2 id="risk-modal-title" className="font-sans text-[1.05rem] font-bold text-white m-0 tracking-tight truncate">
                Risk Calculation &amp; Prioritization Report
              </h2>
              <p className="font-sans text-[0.78rem] text-[#d1d5db] m-0 flex items-center gap-1.5 truncate">
                <span className="font-mono text-[#c69b55] font-bold">{tusker.id}</span>
                <span>•</span>
                <span className="text-white font-medium">{tusker.name}</span>
                {tusker.sinhala && <span className="text-[#d1d5db]">({tusker.sinhala})</span>}
                {riskDetail?.roamingArea && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px] text-[#9ca3af]">{riskDetail.roamingArea}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center justify-center transition-colors shrink-0 ml-3"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5 text-sm bg-white">
          {/* 1. Executive Summary & Score Banner */}
          <div
            className="rounded-2xl p-4.5 border flex flex-col gap-3.5 transition-all shadow-sm"
            style={{
              backgroundColor: band ? band.bgColor : '#f9fafb',
              borderColor: band ? band.borderColor : '#e5e7eb',
            }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[0.72rem] font-bold uppercase tracking-wider text-[#6b7280]">
                  WTS Normalized Risk Index (0–100)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span
                    className="text-3xl font-black font-sans tracking-tight"
                    style={{ color: band ? band.textColor : '#111827' }}
                  >
                    {tusker.riskScore || 'N/A'}
                  </span>
                  <span className="text-xs text-[#6b7280] font-medium">/ 100 points</span>
                </div>
              </div>

              {band && (
                <div className="flex flex-col items-end">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border"
                    style={{
                      backgroundColor: '#ffffff',
                      color: band.color,
                      borderColor: band.borderColor,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color }} />
                    {band.label}
                  </span>
                  <span className="text-[0.7rem] text-[#6b7280] mt-1 font-mono">
                    Band: {band.min === 0 ? '≤20' : band.max === 100 ? '>80' : `>${band.min}–${band.max}`}
                  </span>
                </div>
              )}
            </div>

            {/* Segmented Risk Gauge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[0.68rem] font-semibold text-[#6b7280]">
                <span>0 Very Low</span>
                <span>20 Low</span>
                <span>40 Med</span>
                <span>60 High</span>
                <span>80 Critical 100</span>
              </div>
              <div className="h-2.5 w-full bg-white/80 rounded-full overflow-hidden p-0.5 border border-black/5 flex gap-1">
                {RISK_BANDS.map((b) => {
                  const isCurrent = band?.key === b.key;
                  return (
                    <div
                      key={b.key}
                      className="h-full flex-1 rounded-sm transition-all"
                      style={{
                        backgroundColor: b.color,
                        opacity: isCurrent ? 1 : 0.35,
                      }}
                      title={`${b.label}: ${b.min}–${b.max}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Management Posture Callout */}
            {band && (
              <div className="pt-2 border-t border-black/5 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ color: band.color }}>
                  <Activity size={16} />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold mr-1.5" style={{ color: band.textColor }}>
                    Required Management Posture: {band.posture}
                  </span>
                  <p className="m-0 mt-0.5 text-[#4b5563]">{band.actionText}</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Five Weighted Dimensions Breakdown */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <h3 className="font-sans text-sm font-bold text-[#111827] m-0 flex items-center gap-1.5">
                <Scale size={15} className="text-[#c69b55]" />
                Five-Dimension Weighted Model Breakdown
              </h3>
              <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
                Score = (B/7×25) + (H/6×20) + (C/6×15) + (S/6×10) + (R/7×30)
              </span>
            </div>

            {dims ? (
              <div className="grid grid-cols-1 gap-2">
                {/* Dimension 1: Specimen Rarity */}
                <DimensionCard
                  name="Specimen Rarity (R)"
                  weight="30%"
                  raw={dims.specimenRarity.raw}
                  max={7}
                  points={dims.specimenRarity.points}
                  description={dims.specimenRarity.description}
                  color="#c69b55"
                />

                {/* Dimension 2: Behaviour Risk */}
                <DimensionCard
                  name="Behaviour Risk (B)"
                  weight="25%"
                  raw={dims.behaviourRisk.raw}
                  max={7}
                  points={dims.behaviourRisk.points}
                  description={dims.behaviourRisk.description}
                  color="#ef4444"
                />

                {/* Dimension 3: Settlement Overlap */}
                <DimensionCard
                  name="Settlement Overlap (H)"
                  weight="20%"
                  raw={dims.settlementOverlap.raw}
                  max={6}
                  points={dims.settlementOverlap.points}
                  description={dims.settlementOverlap.description}
                  color="#f97316"
                />

                {/* Dimension 4: Conflict Intensity */}
                <DimensionCard
                  name="Conflict Intensity (C)"
                  weight="15%"
                  raw={dims.conflictIntensity.raw}
                  max={6}
                  points={dims.conflictIntensity.points}
                  description={dims.conflictIntensity.description}
                  color="#dc2626"
                />

                {/* Dimension 5: Sighting Risk (Reversed) */}
                <DimensionCard
                  name="Sighting Frequency Risk (S)"
                  weight="10%"
                  raw={dims.sightingRisk.raw}
                  max={6}
                  points={dims.sightingRisk.points}
                  description={dims.sightingRisk.description}
                  color="#6366f1"
                  isReversed
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {FRAMEWORK_DIMENSIONS.map((d) => (
                  <div key={d.key} className="p-2.5 rounded-xl border border-[#e5e7eb] bg-[#fafaf9] flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#111827]">{d.name}</span>
                        <span className="text-[0.7rem] px-1.5 py-0.2 rounded bg-white border border-[#e5e7eb] font-bold text-[#c69b55]">
                          {d.unit}
                        </span>
                        <span className="text-[0.7rem] text-[#6b7280] font-mono">(Scale 1–{d.max})</span>
                      </div>
                      <p className="text-[0.75rem] text-[#4b5563] m-0 mt-0.5 leading-snug">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Methodological Callout: Why Sighting Frequency is Reversed */}
          <div className="rounded-xl p-3.5 bg-[#f8fafc] border border-[#e2e8f0] flex items-start gap-2.5 text-xs text-[#334155]">
            <EyeOff size={16} className="text-[#64748b] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#0f172a] block mb-0.5">Why Sighting Frequency is Reversed (10% Weight):</strong>
              The framework models sighting frequency as an uncertainty metric. Frequently observed tuskers provide continuous behavioral records.
              Infrequently sighted individuals introduce large surveillance gaps, higher positional uncertainty, and delayed detection of conflict or snare injuries.
            </div>
          </div>

          {/* 4. Institutional Governance Boundary */}
          <div className="rounded-xl p-3 bg-[#fbfbfa] border border-[#f0f0ed] flex items-start gap-2 text-[0.72rem] text-[#6b7280]">
            <Info size={14} className="text-[#9ca3af] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#374151]">Decision Boundary &amp; Governance:</strong> This index serves as an evidence-based conservation prioritization tool for field surveillance and resource allocation. It does not constitute an automated authorization for physical intervention (e.g. capture, sedation, or translocation). All actions remain strictly under Department of Wildlife Conservation (DWC) authority and professional veterinary protocols.
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3.5 bg-[#f9fafb] border-t border-[#eeeeee] flex items-center justify-between">
          <span className="text-[0.7rem] text-[#9ca3af]">
            WTS Executive Risk Assessment Framework
          </span>
          <button
            type="button"
            className="bg-[#0b2518] hover:bg-[#123824] text-white text-[0.82rem] font-semibold px-5 py-2 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
            onClick={onClose}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DimensionCard({ name, weight, raw, max, points, description, color, isReversed = false }) {
  const percentage = Math.min(100, Math.max(0, (raw / max) * 100));

  return (
    <div className="p-3 rounded-xl border border-[#e8ecea] bg-[#ffffff] hover:border-[#cbd5e1] transition-all flex flex-col gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-xs text-[#111827] truncate">{name}</span>
          <span className="text-[0.68rem] px-1.5 py-0.2 rounded font-bold bg-[#faf5ec] text-[#c69b55] border border-[#c69b55]/30">
            {weight}
          </span>
          {isReversed && (
            <span className="text-[0.65rem] px-1 rounded bg-[#f1f5f9] text-[#64748b] font-medium">
              Reversed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs text-[#6b7280]">
            Scale: <strong className="text-[#111827]">{raw}</strong>/{max}
          </span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[#111827]">
            {points} pts
          </span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>

      <p className="text-[0.72rem] text-[#64748b] m-0 leading-tight">
        {description}
      </p>
    </div>
  );
}
