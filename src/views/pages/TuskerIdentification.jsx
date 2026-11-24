/**
 * @file TuskerIdentification.jsx
 * @description Educational scientific guide on individual wild tusker identification.
 * Formatted with rich typography and structured sections matching the About Us page,
 * documenting the core morphological identification methodology established by
 * T. N. C. Vidya, Deepika Prasad and Arjun Ghosh (JNCASR).
 */

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ZoomIn,
  Info
} from 'lucide-react';
import ImageLightboxModal from '../components/ImageLightboxModal';

// High-resolution local diagram assets
import earFoldsImg from '../../assets/images/identification/ear-folds.png';
import earMarksImg from '../../assets/images/identification/ear-marks.png';
import backShapesImg from '../../assets/images/identification/back-shapes.png';
import tailBrushImg from '../../assets/images/identification/tail-brush.png';
import tuskShapesImg from '../../assets/images/identification/tusk-shapes.png';

const IDENTIFICATION_DIAGRAMS = [
  { id: 'ear-folds', imageUrl: earFoldsImg, title: 'Ear Folds Classification Diagram', bgWhite: true },
  { id: 'ear-marks', imageUrl: earMarksImg, title: 'Ear Depigmentation & Ear Marks Diagram', bgWhite: true },
  { id: 'back-shapes', imageUrl: backShapesImg, title: 'Back Shapes Classification Diagram', bgWhite: true },
  { id: 'tail-brush', imageUrl: tailBrushImg, title: 'Tail Brush & Conformation Diagram', bgWhite: true },
  { id: 'tusk-shapes', imageUrl: tuskShapesImg, title: 'Shape of Tusks Classification Diagram', bgWhite: true },
];

const IMPORTANCE_POINTS = [
  {
    num: 1,
    title: 'Monitor Individuals Over Time',
    desc: 'Assess health, physical development, musth cycles, and long-term survival in the wild across years and decades.',
  },
  {
    num: 2,
    title: 'Improve Population & Demographic Estimates',
    desc: 'Establish accurate population baselines by avoiding double-counting individuals across overlapping home ranges and seasonal movements.',
  },
  {
    num: 3,
    title: 'Understand Social & Dominance Dynamics',
    desc: 'Study social interactions, movement patterns, temporary bull groupings, and dominance hierarchies among wild tuskers.',
  },
  {
    num: 4,
    title: 'Support Targeted Conservation & Anti-Poaching',
    desc: 'Enable field rangers, researchers, and wildlife authorities to deploy focused protection for high-value tusked bulls.',
  },
  {
    num: 5,
    title: 'Manage Human-Elephant Coexistence',
    desc: 'Identify specific individuals involved in agricultural conflict to deploy tailored, non-lethal deterrents and mitigation strategies.',
  },
];

const CITATION_TEXT = 'Source: Individual Identification in Asian Elephants - T. N. C. Vidya*, Deepika Prasad and Arjun Ghosh. Evolutionary and Organismal Biology Unit, Jawaharlal Nehru Centre for Advanced Scientific Research (JNCASR), Bangalore, India.';

export default function TuskerIdentification({ embedded = false }) {
  const [activeZoomImg, setActiveZoomImg] = useState(null);

  useEffect(() => {
    if (!embedded) {
      document.title = 'Wild Tuskers Sri Lanka | How to Identify Tuskers';
    }
  }, [embedded]);

  return (
    <div className={embedded ? "w-full max-w-[1040px] mx-auto flex flex-col gap-10 sm:gap-14" : "w-full max-w-[1040px] mx-auto pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-24 px-4 sm:px-6 md:px-8 min-h-screen bg-white flex flex-col gap-10 sm:gap-14"}>

      {/* ── Page Header / Introduction (Slide 1) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs">
        <div className="flex flex-col gap-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-primary text-xs font-bold tracking-wide uppercase w-fit">
            <BookOpen size={15} className="text-accent" />
            <span>Scientific Identification Methodology</span>
          </div>

          <h1 className="font-sans text-2xl sm:text-[2.15rem] md:text-[2.45rem] font-bold text-[#111111] m-0 tracking-tight leading-tight">
            How to Identify Tuskers
          </h1>

          <div className="font-sans text-sm sm:text-[0.98rem] md:text-[1.02rem] text-[#374151] leading-[1.8] flex flex-col gap-4 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            <p className="m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              The approach to identifying individual wild tuskers comes from <strong>T. N. C. Vidya, Deepika Prasad and Arjun Ghosh</strong>, whose paper <em>&ldquo;Individual Identification in Asian Elephants&rdquo;</em> provides the scientific foundation for distinguishing wild Asian elephants in their natural habitats.
            </p>
            <p className="m-0 text-[#4b5563] text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              Each identified tusker is assigned a unique reference code beginning with &ldquo;T&rdquo; and a distinctive name that celebrates its individuality. This system ensures accurate identification while making it easier for researchers, conservationists, and wildlife enthusiasts to recognize and remember each elephant. For example, <strong>T075 - Kawantissa</strong>.
            </p>
          </div>

          {/* Citation Banner */}
          <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed] flex items-start gap-3">
            <Info size={18} className="text-accent shrink-0 mt-0.5" />
            <p className="font-sans text-[0.82rem] sm:text-[0.84rem] text-[#6b7280] leading-relaxed m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {CITATION_TEXT}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section: Importance of Identification (Slide 7) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs">
        <div className="mb-6 pb-3 border-b-2 border-[#f0f0f0]">
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Importance of Identification
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            Why systematic photographic and biometric tracking is crucial for Sri Lanka's wild tuskers:
          </p>
        </div>

        <div className="flex flex-col gap-3.5 sm:gap-4">
          {IMPORTANCE_POINTS.map((obj) => (
            <div
              key={obj.num}
              className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-xl bg-[#fafbfa] border border-[#edf0ed] transition-colors hover:bg-white hover:border-[#c69b55]/40 hover:shadow-xs"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {obj.num}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-sans text-[0.98rem] sm:text-[1.05rem] font-bold text-[#111111] m-0">
                  {obj.title}
                </h3>
                <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#555555] leading-[1.65] m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                  {obj.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 1: Ear Folds (Slide 2) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs flex flex-col gap-6">
        <div className="pb-3 border-b-2 border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <span>Biometric Feature 01</span>
          </div>
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Ear Folds (Ears)
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            The top and side folds of the ear pinna develop distinct, permanent orientations as an elephant matures.
          </p>
        </div>

        {/* Diagram Image */}
        <div
          onClick={() => setActiveZoomImg(IDENTIFICATION_DIAGRAMS[0])}
          className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer group shadow-2xs hover:shadow-md transition-all"
          title="Click to view full diagram"
        >
          <img
            src={earFoldsImg}
            alt="Ear folds classification in Asian elephants"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <ZoomIn size={14} />
            <span className="hidden sm:inline">Click to enlarge</span>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1">Top Fold Variations:</span>
            <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>a)</strong> Not folded</li>
              <li><strong>b)</strong> Slightly folded forward</li>
              <li><strong>c) and h)</strong> Pointing forward</li>
              <li><strong>d) and g)</strong> Pointing backward</li>
              <li><strong>e)</strong> Folded forward in a rolling fold</li>
              <li><strong>f)</strong> Folded forward in a flat fold</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed] flex flex-col justify-between">
            <div>
              <span className="font-bold text-primary text-xs sm:text-sm block mb-1">Side Fold Variations:</span>
              <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
                <li><strong>h)</strong> Folded forward</li>
                <li>Side fold degree and curvature provide immediate field verification when viewed in profile.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-[#edf0ed] text-[0.78rem] text-[#6b7280] italic text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {CITATION_TEXT}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Ear Depigmentation & Ear Marks (Slide 3) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs flex flex-col gap-6">
        <div className="pb-3 border-b-2 border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <span>Biometric Feature 02</span>
          </div>
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Ear Depigmentation and Ear Marks
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            Holes, notches, tears, and depigmentation patches serve as permanent biometric fingerprints unique to each elephant.
          </p>
        </div>

        {/* Diagram Image */}
        <div
          onClick={() => setActiveZoomImg(IDENTIFICATION_DIAGRAMS[1])}
          className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer group shadow-2xs hover:shadow-md transition-all"
          title="Click to view full diagram"
        >
          <img
            src={earMarksImg}
            alt="Ear depigmentation and ear marks in Asian elephants"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <ZoomIn size={14} />
            <span className="hidden sm:inline">Click to enlarge</span>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
          <span className="font-bold text-primary text-xs sm:text-sm block mb-2">Key Diagnostic Features Identified:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-[0.9rem] text-[#4b5563] leading-relaxed">
            <div>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>a)</strong> A tiny hole (marked by arrow) before the side fold</p>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>b)</strong> A large hole before the side fold</p>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>c)</strong> Marked depigmentation and tears, including a missing semi-circular section, before the side fold</p>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>d)</strong> Tears with finger-like projections before, at and after the side fold</p>
            </div>
            <div>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>e)</strong> A tear on the top fold</p>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>f)</strong> A tear at the side fold, with a large part of the ear missing</p>
              <p className="m-0 mb-1.5 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}><strong>g)</strong> A tear at the side fold, plus nicks before and after it</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#edf0ed] text-[0.78rem] text-[#6b7280] italic text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            {CITATION_TEXT}
          </div>
        </div>
      </section>

      {/* ── Section 3: Back Shapes (Slide 4) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs flex flex-col gap-6">
        <div className="pb-3 border-b-2 border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <span>Biometric Feature 03</span>
          </div>
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Back Shapes
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            The dorsal spinal profile and vertebral curvature classify individual silhouettes from distance in field conditions.
          </p>
        </div>

        {/* Diagram Image */}
        <div
          onClick={() => setActiveZoomImg(IDENTIFICATION_DIAGRAMS[2])}
          className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer group shadow-2xs hover:shadow-md transition-all"
          title="Click to view full diagram"
        >
          <img
            src={backShapesImg}
            alt="Back shapes classification in Asian elephants"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <ZoomIn size={14} />
            <span className="hidden sm:inline">Click to enlarge</span>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Standard Curvature Profiles:</span>
            <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>a)</strong> Concave</li>
              <li><strong>b)</strong> Flat</li>
              <li><strong>c)</strong> Broken</li>
              <li><strong>d)</strong> Flat and broken</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed] flex flex-col justify-between">
            <div>
              <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Elevated & Irregular Profiles:</span>
              <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
                <li><strong>e) and f)</strong> Humped</li>
                <li><strong>g)</strong> Wavy</li>
                <li><strong>h)</strong> Humped and sloping</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-[#edf0ed] text-[0.78rem] text-[#6b7280] italic text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {CITATION_TEXT}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Tail Brush (Slide 5) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs flex flex-col gap-6">
        <div className="pb-3 border-b-2 border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <span>Biometric Feature 04</span>
          </div>
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Tail Brush & Tail Conformation
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            Tail hair distribution, kinks, vertebrae breaks, and curvature provide reliable secondary markers for positive confirmation.
          </p>
        </div>

        {/* Diagram Image */}
        <div
          onClick={() => setActiveZoomImg(IDENTIFICATION_DIAGRAMS[3])}
          className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer group shadow-2xs hover:shadow-md transition-all"
          title="Click to view full diagram"
        >
          <img
            src={tailBrushImg}
            alt="Tail brush and tail curvature classification"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <ZoomIn size={14} />
            <span className="hidden sm:inline">Click to enlarge</span>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Tail Brush Hair Distribution:</span>
            <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>a)</strong> No hair</li>
              <li><strong>b) and c)</strong> Short at front and back</li>
              <li><strong>d)</strong> Short at back</li>
              <li><strong>e)</strong> Normal at front</li>
              <li><strong>f)</strong> Normal at back</li>
              <li><strong>g) to j)</strong> Normal full brush</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed] flex flex-col justify-between">
            <div>
              <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Tail Kink & Curvature:</span>
              <ul className="text-xs sm:text-[0.9rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
                <li><strong>g) and i)</strong> Kinked</li>
                <li><strong>c), h) and j)</strong> Curved</li>
                <li><strong>k)</strong> Curved and twisted (side view)</li>
                <li><strong>l)</strong> Same tail as in k (rear view)</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-[#edf0ed] text-[0.78rem] text-[#6b7280] italic text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {CITATION_TEXT}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Shape of Tusks (Slide 6) ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e5e7eb] shadow-xs flex flex-col gap-6">
        <div className="pb-3 border-b-2 border-[#f0f0f0]">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <span>Biometric Feature 05</span>
          </div>
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Shape of Tusks
          </h2>
          <p className="font-sans text-[0.85rem] sm:text-[0.92rem] text-[#666666] mt-1.5 m-0 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
            Tusk direction, length, angle, and asymmetrical growth patterns define the iconic front profile of every wild tusker.
          </p>
        </div>

        {/* Diagram Image */}
        <div
          onClick={() => setActiveZoomImg(IDENTIFICATION_DIAGRAMS[4])}
          className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer group shadow-2xs hover:shadow-md transition-all"
          title="Click to view full diagram"
        >
          <img
            src={tuskShapesImg}
            alt="Shape and conformation of tusks in Asian elephants"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <ZoomIn size={14} />
            <span className="hidden sm:inline">Click to enlarge</span>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Tusk Direction:</span>
            <ul className="text-xs sm:text-[0.88rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>a)</strong> Parallel</li>
              <li><strong>b)</strong> Divergent</li>
              <li><strong>f)</strong> Convergent</li>
              <li><strong>g)</strong> Divergent & Convergent (right tusk convergent, left divergent)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Tusk Length & Angle:</span>
            <ul className="text-xs sm:text-[0.88rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>c)</strong> Medium length</li>
              <li><strong>i)</strong> Long length</li>
              <li><strong>c)</strong> Horizontal angle</li>
              <li><strong>i)</strong> Intermediate angle</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed]">
            <span className="font-bold text-primary text-xs sm:text-sm block mb-1.5">Tusk Asymmetry:</span>
            <ul className="text-xs sm:text-[0.88rem] text-[#4b5563] space-y-1.5 pl-4 m-0 leading-relaxed list-disc">
              <li><strong>c) and e)</strong> Left tusk higher</li>
              <li><strong>i)</strong> Right tusk longer</li>
              <li><strong>d)</strong> Left crosses over right</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#fafbfa] border border-[#edf0ed] text-[0.78rem] text-[#6b7280] italic text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
          {CITATION_TEXT}
        </div>
      </section>

      {/* ── High-Resolution Zoom Lightbox Modal ── */}
      {activeZoomImg && (
        <ImageLightboxModal
          photo={activeZoomImg}
          allPhotos={IDENTIFICATION_DIAGRAMS}
          onNavigatePhoto={(nextPhoto) => setActiveZoomImg(nextPhoto)}
          onClose={() => setActiveZoomImg(null)}
          fromPath={embedded ? '/special-observations?tab=identification' : '/special-observations?tab=identification'}
        />
      )}

    </div>
  );
}
