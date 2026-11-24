/**
 * @file TuskerIdentification.jsx
 * @description Educational learning hub for tusker morphological identification.
 * Showcases presentations (PPTX, Word, PDF) and visual slide guides covering
 * ear biometrics, tusk angles, wear patterns, and individual recognition protocols.
 * Features topic filtering, instant search, full-screen interactive reader modal,
 * and admin submission controls.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  PlusCircle,
  BookOpen,
  Eye,
  Download,
  Trash2,
  Edit3,
  Presentation,
  FileText,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { useTuskerIdentificationFeed } from '../../controllers/useTuskerIdentification';
import DocumentViewerModal from '../components/DocumentViewerModal';

export default function TuskerIdentification({ embedded = false }) {
  const navigate = useNavigate();
  const {
    loading,
    identifications,
    canAddIdentification,
    isAdmin,
    handleDelete,
  } = useTuskerIdentificationFeed();

  const [activeViewerItem, setActiveViewerItem] = useState(null);

  useEffect(() => {
    if (!embedded) {
      document.title = 'Wild Tuskers Sri Lanka | Tusker Identification Learning';
    }
  }, [embedded]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFormatIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'pptx' || t === 'ppt') return <Presentation size={14} className="text-amber-500" />;
    if (t === 'docx' || t === 'doc') return <FileText size={14} className="text-blue-500" />;
    if (t === 'pdf') return <FileText size={14} className="text-red-500" />;
    return <ImageIcon size={14} className="text-emerald-500" />;
  };

  const mainContent = (
    <div className={embedded ? "w-full flex flex-col gap-6" : "max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8"}>
      {/* ── Page Header (standalone only) ── */}
      {!embedded && (
        <div className="flex flex-col items-center justify-center text-center pb-6 sm:pb-8 border-b border-[#e5e7eb] gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-primary text-xs font-bold tracking-wide uppercase">
            <GraduationCap size={15} className="text-accent" />
            <span>Learning & Research Hub</span>
          </div>

          <h1 className="font-sans text-[clamp(1.5rem,4.5vw,2.85rem)] font-bold text-[#111111] m-0 tracking-tight leading-tight text-center">
            Tusker Identification Presentations
          </h1>

          <p className="font-sans text-xs sm:text-[0.96rem] text-[#555555] leading-relaxed max-w-3xl mx-auto m-0 text-center">
            Comprehensive field guides, biometric ear notation systems, tusk morphometry standards, and educational slide decks for learning individual identification of Sri Lanka's wild tuskers.
          </p>

          {canAddIdentification && (
            <div className="flex items-center justify-center w-full sm:w-auto mt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/add-identification')}
                className="bg-accent text-primary font-bold text-xs sm:text-[0.88rem] px-6 sm:px-8 py-2.5 rounded-[8px] inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-all shrink-0 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <PlusCircle size={17} />
                <span>Upload Presentation Material</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Embedded Admin Add Button */}
      {embedded && canAddIdentification && (
        <div className="flex items-center w-full sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/add-identification')}
            className="w-full sm:w-auto bg-accent text-primary font-bold text-xs sm:text-[0.88rem] px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-all whitespace-nowrap shadow-xs"
          >
            <PlusCircle size={16} />
            <span>Upload Presentation Material</span>
          </button>
        </div>
      )}

        {/* ── Learning Materials Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#e5e7eb] animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-12 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : identifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#e5e7eb] shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-accent/15 text-primary flex items-center justify-center mb-1">
              <FolderOpen size={28} className="text-accent" />
            </div>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#111111] m-0">
              No Learning Materials Found
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#666666] max-w-md m-0">
              No presentations have been uploaded yet. Check back soon for educational materials!
            </p>
            {canAddIdentification && (
              <button
                type="button"
                onClick={() => navigate('/admin/add-identification')}
                className="mt-2 bg-accent text-primary font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg inline-flex items-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-all shadow-xs"
              >
                <PlusCircle size={16} />
                <span>Upload First Presentation</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {identifications.map((item) => {
              const fileType = (item.fileType || (item.fileName ? item.fileName.split('.').pop() : 'pptx')).toUpperCase();

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-[#e5e7eb] flex flex-col group hover:-translate-y-1"
                >
                  {/* Card Cover Preview */}
                  <div
                    className="relative aspect-video bg-[#0b2518] overflow-hidden cursor-pointer"
                    onClick={() => setActiveViewerItem(item)}
                    title="Click to view presentation"
                  >
                    <img
                      src={item.coverImage || 'https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/web/gallery/site_app_mockup_1794763769059.webp'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Format badge top right */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="font-sans text-[0.66rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/80 text-white backdrop-blur-xs border border-white/15 flex items-center gap-1.5 shadow-xs">
                        {getFormatIcon(item.fileType)}
                        <span>{fileType}</span>
                      </span>
                    </div>

                    {/* Center Click-to-Read Overlay Pill */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="px-3.5 py-1.5 rounded-full bg-accent text-primary font-bold text-xs flex items-center gap-1.5 shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                        <Eye size={15} />
                        <span>Read Full View</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h3
                        className="font-sans text-[1.05rem] font-bold text-[#111111] leading-snug m-0 group-hover:text-accent transition-colors line-clamp-2 cursor-pointer"
                        onClick={() => setActiveViewerItem(item)}
                      >
                        {item.title}
                      </h3>

                      <p className="font-sans text-xs sm:text-[0.84rem] text-[#555555] leading-relaxed m-0 line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Meta info & Admin Actions */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-[#f0f0f0]">
                      <div className="flex items-center justify-between text-[0.72rem] text-[#6b7280]">
                        <span className="truncate max-w-[65%]">
                          {item.author || 'Wild Tuskers Sri Lanka'}
                        </span>
                        {item.fileSize > 0 && (
                          <span className="font-medium text-[#4b5563] shrink-0">
                            {formatFileSize(item.fileSize)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveViewerItem(item)}
                          className="flex-1 bg-accent text-primary hover:bg-accent-hover font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                        >
                          <BookOpen size={14} />
                          <span>View Presentation</span>
                        </button>

                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            download={item.fileName || 'presentation'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#374151] flex items-center justify-center transition-all cursor-pointer no-underline border border-gray-200 shrink-0"
                            title="Download File"
                          >
                            <Download size={15} />
                          </a>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/edit-identification/${item.id}`)}
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-all cursor-pointer border-none"
                              title="Edit Material"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-all cursor-pointer border-none"
                              title="Delete Material"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

    </div>
  );

  if (embedded) {
    return (
      <>
        {mainContent}
        {activeViewerItem && (
          <DocumentViewerModal
            item={activeViewerItem}
            onClose={() => setActiveViewerItem(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-[#f7f8fa] min-h-screen pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-24">
      {mainContent}

      {/* ── Interactive Document & Presentation Full-View Modal ── */}
      {activeViewerItem && (
        <DocumentViewerModal
          item={activeViewerItem}
          onClose={() => setActiveViewerItem(null)}
        />
      )}
    </div>
  );
}
