import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Crop,
  Check,
  X,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Grid3X3,
  Info,
} from 'lucide-react';

/**
 * Universal Image Cropper Modal
 * Provides interactive freeform and aspect-ratio locked cropping for ear biometrics and progression photos.
 * Uses high-resolution HTML5 canvas rendering to export pristine image blobs.
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {string|File|Blob} imageSrc - Source image (URL, File, or Blob)
 * @param {function} onClose - Modal close handler
 * @param {function} onCropComplete - Callback with { blob, file, dataUrl }
 * @param {string} title - Modal title (default "Crop Ear Biometric Area")
 * @param {string} subtitle - Modal subtitle
 * @param {string} defaultAspect - Default aspect ratio ('free', '3:4', '1:1', '4:3', '16:9')
 */
export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  title = 'Crop Ear Biometric Area',
  subtitle = 'Drag the crop box or handles to focus directly on the ear pinna, margin notches, and venation.',
  defaultAspect = 'free',
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [displayedDimensions, setDisplayedDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 });

  // Normalized crop rectangle: all values in 0..1 relative to displayed image
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [aspect, setAspect] = useState(defaultAspect); // 'free', '3:4', '1:1', '4:3', '16:9'
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [showGrid, setShowGrid] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  // Dragging state
  const dragRef = useRef({
    isDragging: false,
    handle: null, // 'move' or handle name: 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
    startX: 0,
    startY: 0,
    initialCrop: null,
  });

  // Resolve image source URL (object URL if File/Blob)
  const [resolvedUrl, setResolvedUrl] = useState('');
  useEffect(() => {
    if (!imageSrc) {
      setResolvedUrl('');
      return;
    }
    if (typeof imageSrc === 'string') {
      setResolvedUrl(imageSrc);
      return;
    }
    if (imageSrc instanceof Blob || imageSrc instanceof File) {
      const objUrl = URL.createObjectURL(imageSrc);
      setResolvedUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [imageSrc]);

  // Reset state when opening with a new image
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setLoadError('');
      setRotation(0);
      setAspect(defaultAspect);
      setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
    }
  }, [isOpen, resolvedUrl, defaultAspect]);

  // Recalculate displayed dimensions within container
  const updateDisplayedDimensions = useCallback(() => {
    if (!containerRef.current || !naturalDimensions.width || !naturalDimensions.height) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cW = containerRect.width;
    const cH = containerRect.height;
    if (cW <= 0 || cH <= 0) return;

    // Is image rotated sideways (90 or 270)?
    const isSideways = rotation % 180 !== 0;
    const nw = isSideways ? naturalDimensions.height : naturalDimensions.width;
    const nh = isSideways ? naturalDimensions.width : naturalDimensions.height;

    const imgAspect = nw / nh;
    const containerAspect = cW / cH;

    let dW, dH, dL, dT;
    if (imgAspect > containerAspect) {
      dW = cW;
      dH = cW / imgAspect;
      dL = 0;
      dT = (cH - dH) / 2;
    } else {
      dH = cH;
      dW = cH * imgAspect;
      dL = (cW - dW) / 2;
      dT = 0;
    }

    setDisplayedDimensions({
      width: Math.round(dW),
      height: Math.round(dH),
      left: Math.round(dL),
      top: Math.round(dT),
    });
  }, [naturalDimensions, rotation]);

  useEffect(() => {
    updateDisplayedDimensions();
    window.addEventListener('resize', updateDisplayedDimensions);
    return () => window.removeEventListener('resize', updateDisplayedDimensions);
  }, [updateDisplayedDimensions]);

  // Handle image load
  const handleImageLoad = (e) => {
    const nw = e.target.naturalWidth;
    const nh = e.target.naturalHeight;
    setNaturalDimensions({ width: nw, height: nh });
    setImageLoaded(true);

    // Initial crop based on aspect
    applyAspectToCrop(defaultAspect, { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, nw, nh, rotation);
  };

  const handleImageError = () => {
    setLoadError('Failed to load image for cropping. Please check file format.');
  };

  // Convert aspect string to numeric ratio
  const getNumericAspect = (aspectKey) => {
    switch (aspectKey) {
      case '1:1':
        return 1.0;
      case '3:4':
        return 3 / 4;
      case '4:3':
        return 4 / 3;
      case '16:9':
        return 16 / 9;
      case 'free':
      default:
        return null;
    }
  };

  // Apply aspect ratio adjustment to crop
  const applyAspectToCrop = (aspectKey, currentCrop, nw, nh, rot) => {
    const ratio = getNumericAspect(aspectKey);
    if (!ratio || !nw || !nh) {
      setCrop(currentCrop);
      return;
    }

    const isSideways = rot % 180 !== 0;
    const effectiveW = isSideways ? nh : nw;
    const effectiveH = isSideways ? nw : nh;

    // Image aspect ratio
    const imgRatio = effectiveW / effectiveH;

    // normalized width / height in 0..1 space:
    // realWidth / realHeight = (w * effectiveW) / (h * effectiveH) = ratio
    // w / h = ratio / imgRatio
    const targetWOverH = ratio / imgRatio;

    let newW = 0.75;
    let newH = newW / targetWOverH;

    if (newH > 0.85) {
      newH = 0.85;
      newW = newH * targetWOverH;
    }
    if (newW > 0.85) {
      newW = 0.85;
      newH = newW / targetWOverH;
    }

    const newX = Math.max(0, (1 - newW) / 2);
    const newY = Math.max(0, (1 - newH) / 2);

    setCrop({
      x: Math.min(1 - newW, Math.max(0, newX)),
      y: Math.min(1 - newH, Math.max(0, newY)),
      w: Math.min(1, newW),
      h: Math.min(1, newH),
    });
  };

  const handleAspectChange = (newAspect) => {
    setAspect(newAspect);
    applyAspectToCrop(newAspect, crop, naturalDimensions.width, naturalDimensions.height, rotation);
  };

  const handleRotate = (angleDelta) => {
    const nextRot = (rotation + angleDelta + 360) % 360;
    setRotation(nextRot);
    setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  const handleReset = () => {
    setRotation(0);
    setAspect(defaultAspect);
    setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  // ── Mouse & Touch Dragging Mechanics ──────────────────
  const startDrag = (handle, clientX, clientY) => {
    dragRef.current = {
      isDragging: true,
      handle,
      startX: clientX,
      startY: clientY,
      initialCrop: { ...crop },
    };
  };

  const onMouseDownHandle = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(handle, e.clientX, e.clientY);
  };

  const onTouchStartHandle = (handle, e) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      startDrag(handle, e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const onPointerMove = (clientX, clientY) => {
      const { isDragging, handle, startX, startY, initialCrop } = dragRef.current;
      if (!isDragging || !initialCrop || !displayedDimensions.width || !displayedDimensions.height) return;

      const deltaX = (clientX - startX) / displayedDimensions.width;
      const deltaY = (clientY - startY) / displayedDimensions.height;

      const ratio = getNumericAspect(aspect);
      const isSideways = rotation % 180 !== 0;
      const effectiveW = isSideways ? naturalDimensions.height : naturalDimensions.width;
      const effectiveH = isSideways ? naturalDimensions.width : naturalDimensions.height;
      const imgRatio = effectiveW / effectiveH;
      const targetWOverH = ratio ? ratio / imgRatio : null;

      const MIN_SIZE = 0.08; // minimum crop size 8%

      if (handle === 'move') {
        const nextX = Math.min(1 - initialCrop.w, Math.max(0, initialCrop.x + deltaX));
        const nextY = Math.min(1 - initialCrop.h, Math.max(0, initialCrop.y + deltaY));
        setCrop((prev) => ({ ...prev, x: nextX, y: nextY }));
        return;
      }

      // Handle corner and edge resizing
      let nextX = initialCrop.x;
      let nextY = initialCrop.y;
      let nextW = initialCrop.w;
      let nextH = initialCrop.h;

      // Unconstrained adjustment first
      if (handle.includes('e')) {
        nextW = Math.max(MIN_SIZE, Math.min(1 - nextX, initialCrop.w + deltaX));
      }
      if (handle.includes('w')) {
        const potentialX = initialCrop.x + deltaX;
        const clampedX = Math.max(0, Math.min(initialCrop.x + initialCrop.w - MIN_SIZE, potentialX));
        nextW = initialCrop.w + (initialCrop.x - clampedX);
        nextX = clampedX;
      }
      if (handle.includes('s')) {
        nextH = Math.max(MIN_SIZE, Math.min(1 - nextY, initialCrop.h + deltaY));
      }
      if (handle.includes('n')) {
        const potentialY = initialCrop.y + deltaY;
        const clampedY = Math.max(0, Math.min(initialCrop.y + initialCrop.h - MIN_SIZE, potentialY));
        nextH = initialCrop.h + (initialCrop.y - clampedY);
        nextY = clampedY;
      }

      // If aspect ratio is locked, keep proportional
      if (targetWOverH) {
        if (handle === 'e' || handle === 'w' || handle === 'ne' || handle === 'se') {
          nextH = nextW / targetWOverH;
          if (nextY + nextH > 1) {
            nextH = 1 - nextY;
            nextW = nextH * targetWOverH;
          }
        } else {
          nextW = nextH * targetWOverH;
          if (nextX + nextW > 1) {
            nextW = 1 - nextX;
            nextH = nextW / targetWOverH;
          }
        }
      }

      setCrop({
        x: Math.max(0, Math.min(1 - nextW, nextX)),
        y: Math.max(0, Math.min(1 - nextH, nextY)),
        w: Math.min(1, Math.max(MIN_SIZE, nextW)),
        h: Math.min(1, Math.max(MIN_SIZE, nextH)),
      });
    };

    const handleMouseMove = (e) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerUp = () => {
      dragRef.current.isDragging = false;
      dragRef.current.handle = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [displayedDimensions, naturalDimensions, rotation, aspect]);

  // ── Real-Time Cropped Thumbnail Preview ────────────────
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const isSideways = rotation % 180 !== 0;
    const nw = naturalDimensions.width;
    const nh = naturalDimensions.height;
    if (nw <= 0 || nh <= 0) return;

    const sourceW = isSideways ? nh : nw;
    const sourceH = isSideways ? nw : nh;

    const sx = Math.max(0, crop.x * sourceW);
    const sy = Math.max(0, crop.y * sourceH);
    const sw = Math.min(sourceW - sx, crop.w * sourceW);
    const sh = Math.min(sourceH - sy, crop.h * sourceH);

    if (sw <= 0 || sh <= 0) return;

    const cropAspect = sw / sh;
    const maxThumbSize = 130;
    let thumbW, thumbH;
    if (cropAspect >= 1) {
      thumbW = maxThumbSize;
      thumbH = Math.max(24, Math.round(maxThumbSize / cropAspect));
    } else {
      thumbH = maxThumbSize;
      thumbW = Math.max(24, Math.round(maxThumbSize * cropAspect));
    }

    // High-DPI (2x) resolution so the thumbnail is always crisp
    canvas.width = thumbW * 2;
    canvas.height = thumbH * 2;
    canvas.style.width = `${thumbW}px`;
    canvas.style.height = `${thumbH}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Render rotated crop
    ctx.save();
    if (rotation !== 0) {
      // Create offscreen rotated canvas
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      offCanvas.width = sourceW;
      offCanvas.height = sourceH;

      offCtx.translate(offCanvas.width / 2, offCanvas.height / 2);
      offCtx.rotate((rotation * Math.PI) / 180);
      offCtx.drawImage(img, -nw / 2, -nh / 2);

      ctx.drawImage(offCanvas, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    } else {
      try {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } catch {
        // ignore cross-origin drawImage in local preview
      }
    }
    ctx.restore();
  }, [crop, rotation, imageLoaded, naturalDimensions]);

  // ── Apply Crop & Export Full-Res File ───────────────────
  const handleApplyCrop = async () => {
    if (!imageLoaded || !imageRef.current) return;
    setIsApplying(true);

    try {
      const img = imageRef.current;
      const isSideways = rotation % 180 !== 0;
      const nw = naturalDimensions.width;
      const nh = naturalDimensions.height;

      // 1. Offscreen canvas for rotated source
      const rotatedCanvas = document.createElement('canvas');
      const rCtx = rotatedCanvas.getContext('2d');
      rotatedCanvas.width = isSideways ? nh : nw;
      rotatedCanvas.height = isSideways ? nw : nh;

      rCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      rCtx.rotate((rotation * Math.PI) / 180);
      rCtx.drawImage(img, -nw / 2, -nh / 2);

      // 2. Crop to destination canvas
      const sx = Math.round(crop.x * rotatedCanvas.width);
      const sy = Math.round(crop.y * rotatedCanvas.height);
      const sw = Math.round(crop.w * rotatedCanvas.width);
      const sh = Math.round(crop.h * rotatedCanvas.height);

      const destCanvas = document.createElement('canvas');
      const dCtx = destCanvas.getContext('2d');
      destCanvas.width = Math.max(1, sw);
      destCanvas.height = Math.max(1, sh);

      dCtx.drawImage(rotatedCanvas, sx, sy, sw, sh, 0, 0, destCanvas.width, destCanvas.height);

      // 3. Export high quality blob and file
      destCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setLoadError('Failed to generate cropped image.');
            setIsApplying(false);
            return;
          }
          const file = new File([blob], `ear-crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const dataUrl = destCanvas.toDataURL('image/jpeg', 0.92);

          if (onCropComplete) {
            onCropComplete({ blob, file, dataUrl });
          }
          setIsApplying(false);
          onClose();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('[ImageCropperModal] Crop export failed:', err);
      setLoadError('Cropping export failed due to security/image formatting. You can still use the full image.');
      setIsApplying(false);
    }
  };

  // Skip cropping: pass original file or image
  const handleUseFullImage = () => {
    if (onCropComplete) {
      if (imageSrc instanceof File || imageSrc instanceof Blob) {
        onCropComplete({ blob: imageSrc, file: imageSrc, dataUrl: resolvedUrl });
      } else {
        onCropComplete({ blob: null, file: null, dataUrl: resolvedUrl });
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  // Pixel coordinates for crop box on screen
  const screenCropX = displayedDimensions.left + crop.x * displayedDimensions.width;
  const screenCropY = displayedDimensions.top + crop.y * displayedDimensions.height;
  const screenCropW = crop.w * displayedDimensions.width;
  const screenCropH = crop.h * displayedDimensions.height;

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#181c19] text-[#e8ebe9] rounded-[22px] max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-[#2b352f] flex flex-col gap-4 relative my-auto max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2b352f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0b2518] border border-[#c69b55]/40 text-[#c69b55] flex items-center justify-center shadow-md">
              <Crop size={20} />
            </div>
            <div>
              <h3 className="font-sans text-[1.18rem] font-bold text-white m-0 flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[#0b2518] text-[#c69b55] font-semibold border border-[#c69b55]/30 uppercase tracking-wider">
                  Biometric Tool
                </span>
              </h3>
              <p className="font-sans text-[0.78rem] text-[#9ba8a0] m-0 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-none bg-[#242b26] hover:bg-[#2f3832] text-[#9ba8a0] hover:text-white cursor-pointer flex items-center justify-center transition-colors p-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Aspect Ratios, Rotation, Grid Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#202622] p-2 rounded-[14px] border border-[#2e3831]">
          {/* Aspect Ratios */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[0.72rem] font-bold text-[#839188] uppercase tracking-wider mr-1 hidden sm:inline">
              Aspect:
            </span>
            {[
              { id: 'free', label: 'Freeform' },
              { id: '3:4', label: '3:4 Ear Portrait' },
              { id: '1:1', label: '1:1 Square' },
              { id: '4:3', label: '4:3 Landscape' },
              { id: '16:9', label: '16:9' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAspectChange(item.id)}
                className={`px-2.5 py-1 rounded-[8px] text-[0.75rem] font-semibold transition-all border-none cursor-pointer ${
                  aspect === item.id
                    ? 'bg-[#0b2518] text-[#c69b55] font-bold shadow-xs border border-[#c69b55]/40'
                    : 'bg-transparent text-[#9ba8a0] hover:text-white hover:bg-[#28312b]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Tools: Rotate, Grid, Reset */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              title="Rotate 90° Counter-Clockwise"
              className="p-1.5 rounded-[8px] bg-[#28312b] hover:bg-[#343f38] text-[#c1cec6] hover:text-white border-none cursor-pointer transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              title="Rotate 90° Clockwise"
              className="p-1.5 rounded-[8px] bg-[#28312b] hover:bg-[#343f38] text-[#c1cec6] hover:text-white border-none cursor-pointer transition-colors"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              title={showGrid ? 'Hide Biometric Grid' : 'Show Biometric Grid'}
              className={`p-1.5 rounded-[8px] transition-colors border-none cursor-pointer ${
                showGrid
                  ? 'bg-[#0b2518] text-[#c69b55]'
                  : 'bg-[#28312b] hover:bg-[#343f38] text-[#c1cec6]'
              }`}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Crop Box"
              className="p-1.5 rounded-[8px] bg-[#28312b] hover:bg-[#343f38] text-[#c1cec6] hover:text-white border-none cursor-pointer transition-colors flex items-center gap-1 text-[0.72rem] px-2 font-medium"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Main Crop Viewport */}
        <div
          ref={containerRef}
          className="relative w-full h-[380px] sm:h-[440px] bg-[#0e1210] rounded-[16px] overflow-hidden border border-[#2b352f] flex items-center justify-center select-none"
        >
          {/* Hidden image element to measure natural dimensions */}
          {resolvedUrl && (
            <img
              ref={imageRef}
              src={resolvedUrl}
              alt="Source to crop"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="hidden"
            />
          )}

          {/* Rendered source image with rotation inside container */}
          {imageLoaded && displayedDimensions.width > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${displayedDimensions.left}px`,
                top: `${displayedDimensions.top}px`,
                width: `${displayedDimensions.width}px`,
                height: `${displayedDimensions.height}px`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
              className="pointer-events-none"
            >
              <img
                src={resolvedUrl}
                alt="Framed view"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          )}

          {/* Dark Overlay with Cutout Shadow around Crop Box */}
          {imageLoaded && displayedDimensions.width > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${screenCropX}px`,
                top: `${screenCropY}px`,
                width: `${screenCropW}px`,
                height: `${screenCropH}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
              }}
              onMouseDown={(e) => onMouseDownHandle('move', e)}
              onTouchStart={(e) => onTouchStartHandle('move', e)}
              className="border-2 border-[#c69b55] shadow-[0_0_12px_rgba(198,155,85,0.4)] cursor-move transition-[border-color] duration-150 relative group"
            >
              {/* Rule of Thirds / Biometric Grid Lines */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-45">
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-b border-white/60"></div>
                  <div className="border-r border-white/60"></div>
                  <div className="border-r border-white/60"></div>
                  <div></div>
                </div>
              )}

              {/* Center Crosshair Indicator */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-4 h-0.5 bg-[#c69b55]"></div>
                <div className="h-4 w-0.5 bg-[#c69b55] -ml-2.25"></div>
              </div>

              {/* 4 Corner Handles */}
              <div
                onMouseDown={(e) => onMouseDownHandle('nw', e)}
                onTouchStart={(e) => onTouchStartHandle('nw', e)}
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#0b2518] rounded-full shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('ne', e)}
                onTouchStart={(e) => onTouchStartHandle('ne', e)}
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#0b2518] rounded-full shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('se', e)}
                onTouchStart={(e) => onTouchStartHandle('se', e)}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#0b2518] rounded-full shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('sw', e)}
                onTouchStart={(e) => onTouchStartHandle('sw', e)}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#0b2518] rounded-full shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
              />

              {/* 4 Edge Handles */}
              <div
                onMouseDown={(e) => onMouseDownHandle('n', e)}
                onTouchStart={(e) => onTouchStartHandle('n', e)}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-white border border-[#0b2518] rounded-full shadow-sm cursor-ns-resize hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('s', e)}
                onTouchStart={(e) => onTouchStartHandle('s', e)}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-white border border-[#0b2518] rounded-full shadow-sm cursor-ns-resize hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('w', e)}
                onTouchStart={(e) => onTouchStartHandle('w', e)}
                className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-7 bg-white border border-[#0b2518] rounded-full shadow-sm cursor-ew-resize hover:scale-110 transition-transform"
              />
              <div
                onMouseDown={(e) => onMouseDownHandle('e', e)}
                onTouchStart={(e) => onTouchStartHandle('e', e)}
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-7 bg-white border border-[#0b2518] rounded-full shadow-sm cursor-ew-resize hover:scale-110 transition-transform"
              />
            </div>
          )}

          {/* Loading or Error State */}
          {!imageLoaded && !loadError && (
            <div className="flex flex-col items-center gap-2 text-[#839188]">
              <div className="w-8 h-8 border-2 border-[#c69b55] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Preparing Image for Cropping…</span>
            </div>
          )}

          {loadError && (
            <div className="flex flex-col items-center gap-2 text-rose-400 p-4 text-center">
              <span className="text-sm font-semibold">{loadError}</span>
              <button
                type="button"
                onClick={handleUseFullImage}
                className="mt-2 px-3 py-1.5 rounded-[8px] bg-[#28312b] text-white text-xs hover:bg-[#343f38]"
              >
                Continue without Cropping
              </button>
            </div>
          )}

          {/* Live Cropped Result Thumbnail in Bottom-Right Corner */}
          {imageLoaded && (
            <div className="absolute bottom-3 right-3 bg-[#181c19]/95 backdrop-blur-md p-2 rounded-[12px] border border-[#2b352f] shadow-xl flex flex-col items-center gap-1.5 hidden sm:flex pointer-events-none">
              <span className="text-[0.62rem] font-bold text-[#c69b55] uppercase tracking-wider">
                Live Preview
              </span>
              <canvas
                ref={previewCanvasRef}
                className="rounded-[8px] border border-white/15 bg-black object-contain shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Guidance Note */}
        <div className="flex items-center gap-2 bg-[#202722] px-3.5 py-2.5 rounded-[12px] border border-[#2b362f] text-[0.76rem] text-[#9caea3]">
          <Info size={16} className="text-[#c69b55] shrink-0" />
          <span>
            <strong>Biometric Tip:</strong> Drag inside the box to reposition. Drag corners or edges to tightly frame ear notches, venation lines, or tusk wear. The output is exported at full camera resolution.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#2b352f]">
          <button
            type="button"
            onClick={handleUseFullImage}
            disabled={isApplying}
            className="w-full sm:w-auto h-9 px-4 rounded-[10px] bg-[#242b26] hover:bg-[#2f3832] text-[#9ba8a0] hover:text-white font-sans text-xs font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center"
          >
            Use Full Image (Skip Crop)
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="flex-1 sm:flex-initial h-9 px-4 rounded-[10px] bg-[#242b26] hover:bg-[#2f3832] text-[#9ba8a0] hover:text-white font-sans text-xs font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isApplying || !imageLoaded}
              className="flex-1 sm:flex-initial h-9 px-5 rounded-[10px] bg-[#0b2518] hover:bg-[#133824] text-white font-sans text-xs font-bold transition-all shadow-md border border-[#c69b55]/40 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 box-border"
            >
              {isApplying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cropping…</span>
                </>
              ) : (
                <>
                  <Check size={15} className="text-[#c69b55]" />
                  <span>Apply Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
