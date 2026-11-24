/**
 * @file presentationThumbnail.js
 * @description Automatically extracts first-slide thumbnail images, slide counts,
 * and individual slide images from uploaded presentation files (PPTX, DOCX)
 * using browser-native DecompressionStream without any external dependencies.
 */

async function decompressEntry(bytes, start, end, method) {
  const slice = bytes.subarray(start, end);
  if (method === 0) return slice; // stored uncompressed
  if (method === 8) {
    // deflate compression
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(slice);
    writer.close();
    const response = new Response(ds.readable);
    const buf = await response.arrayBuffer();
    return new Uint8Array(buf);
  }
  return null;
}

function uint8ToBase64(u8) {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

/**
 * Extracts first slide thumbnail and presentation slide images from a PPTX/DOCX file client-side.
 * @param {File|Blob} file
 * @returns {Promise<{ coverUrl: string|null, slideCount: number, slideImages: string[] }>}
 */
export async function extractPresentationCover(file) {
  if (!file) return { coverUrl: null, slideCount: 0, slideImages: [] };
  const fileName = (file.name || '').toLowerCase();

  if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt') || fileName.endsWith('.docx')) {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const view = new DataView(bytes.buffer);
      let offset = 0;

      let thumbnailEntry = null;
      let firstMediaEntry = null;
      const mediaEntries = [];
      let slideCount = 0;

      while (offset + 30 < bytes.length) {
        if (view.getUint32(offset, true) !== 0x04034b50) break;
        const method = view.getUint16(offset + 8, true);
        const compSize = view.getUint32(offset + 18, true);
        const nameLen = view.getUint16(offset + 26, true);
        const extraLen = view.getUint16(offset + 28, true);
        const nameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
        const name = new TextDecoder('utf-8').decode(nameBytes);
        const dataStart = offset + 30 + nameLen + extraLen;
        const dataEnd = dataStart + compSize;

        const lowerName = name.toLowerCase();
        if (
          lowerName.includes('thumbnail') &&
          (lowerName.endsWith('.jpeg') || lowerName.endsWith('.jpg') || lowerName.endsWith('.png'))
        ) {
          thumbnailEntry = { name, method, dataStart, dataEnd };
        } else if (
          (lowerName.includes('ppt/media/') || lowerName.includes('word/media/')) &&
          (lowerName.endsWith('.jpeg') || lowerName.endsWith('.jpg') || lowerName.endsWith('.png') || lowerName.endsWith('.webp'))
        ) {
          if (!firstMediaEntry) firstMediaEntry = { name, method, dataStart, dataEnd };
          mediaEntries.push({ name, method, dataStart, dataEnd });
        } else if (lowerName.startsWith('ppt/slides/slide') && lowerName.endsWith('.xml')) {
          slideCount++;
        }

        offset = dataEnd;
      }

      // Sort media entries naturally (image1, image2, image3... image10)
      mediaEntries.sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D+/g, ''), 10) || 0;
        const numB = parseInt(b.name.replace(/\D+/g, ''), 10) || 0;
        return numA - numB;
      });

      const slideImages = [];
      let coverUrl = null;

      // 1. Decompress thumbnail if present
      if (thumbnailEntry) {
        try {
          const decompressed = await decompressEntry(bytes, thumbnailEntry.dataStart, thumbnailEntry.dataEnd, thumbnailEntry.method);
          if (decompressed) {
            const isPng = thumbnailEntry.name.toLowerCase().endsWith('.png');
            const mime = isPng ? 'image/png' : 'image/jpeg';
            coverUrl = `data:${mime};base64,${uint8ToBase64(decompressed)}`;
            slideImages.push(coverUrl);
          }
        } catch (e) {
          console.warn('[presentationThumbnail] Thumbnail decompression error:', e);
        }
      }

      // 2. Decompress slide images from media (up to 30 images to keep memory lightweight)
      const maxMedia = Math.min(mediaEntries.length, 30);
      for (let i = 0; i < maxMedia; i++) {
        const entry = mediaEntries[i];
        try {
          const decompressed = await decompressEntry(bytes, entry.dataStart, entry.dataEnd, entry.method);
          if (decompressed && decompressed.byteLength > 1024) {
            const isPng = entry.name.toLowerCase().endsWith('.png');
            const isWebp = entry.name.toLowerCase().endsWith('.webp');
            const mime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
            const dataUrl = `data:${mime};base64,${uint8ToBase64(decompressed)}`;
            // Avoid duplicate if it matches the thumbnail
            if (!coverUrl) {
              coverUrl = dataUrl;
            }
            if (!slideImages.includes(dataUrl)) {
              slideImages.push(dataUrl);
            }
          }
        } catch {
          // continue with next entry
        }
      }

      // If no thumbnail but media exists, use first media as cover
      if (!coverUrl && slideImages.length > 0) {
        coverUrl = slideImages[0];
      }

      return {
        coverUrl,
        slideCount: Math.max(slideCount, slideImages.length, 1),
        slideImages,
        isAuto: true,
      };
    } catch (err) {
      console.warn('[presentationThumbnail] Failed to extract presentation media:', err);
    }
  }

  return { coverUrl: null, slideCount: 0, slideImages: [] };
}
