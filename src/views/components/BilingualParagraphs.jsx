/**
 * @file BilingualParagraphs.jsx
 * @description Renders justified bilingual (English / Sinhala) paragraphs with clear visual
 * spacing and a subtle divider whenever the text transitions between languages.
 */

import React from 'react';

function isSinhalaDominant(text) {
  if (!text) return false;
  const sinhalaChars = (text.match(/[\u0D80-\u0DFF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  if (sinhalaChars === 0) return false;
  return sinhalaChars >= 6 || sinhalaChars > englishChars;
}

const DIVIDER_RE = /^[━─=\-_]{6,}$/;

export default function BilingualParagraphs({
  paragraphs = [],
  className = 'font-sans text-xs sm:text-[0.93rem] text-[#374151] leading-[1.8] text-justify m-0',
}) {
  if (!paragraphs || paragraphs.length === 0) return null;

  const nodes = [];
  let prevLang = null;
  let justRenderedDivider = false;

  paragraphs.forEach((rawPara, idx) => {
    const para = typeof rawPara === 'string' ? rawPara.trim() : '';
    if (!para) return;

    if (DIVIDER_RE.test(para)) {
      if (!justRenderedDivider && nodes.length > 0) {
        nodes.push(
          <div
            key={`sep-${idx}`}
            className="my-3 border-t border-[#e5e7eb]"
            role="separator"
          />
        );
        justRenderedDivider = true;
      }
      return;
    }

    const lang = isSinhalaDominant(para) ? 'si' : 'en';
    if (prevLang && prevLang !== lang && !justRenderedDivider) {
      nodes.push(
        <div
          key={`lang-sep-${idx}`}
          className="my-3 border-t border-[#e5e7eb]"
          role="separator"
        />
      );
    }

    nodes.push(
      <p
        key={`p-${idx}`}
        className={className}
        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
      >
        {para}
      </p>
    );

    prevLang = lang;
    justRenderedDivider = false;
  });

  return <>{nodes}</>;
}
