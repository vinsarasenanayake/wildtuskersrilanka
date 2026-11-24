/**
 * @file useFocusTrap.js
 * @description Accessible focus management hook for modal dialogs and lightboxes.
 * 
 * WCAG 2.1 Dialog Pattern Implementation:
 * 1. Focus on Open: Automatically shifts focus into the modal (to an initial element,
 *    first interactive field, or close button).
 * 2. Focus Trap: Restricts Tab and Shift+Tab key navigation strictly within the modal container.
 * 3. Focus Restoration: Safely returns focus to the exact opener element that triggered the modal
 *    when closed, preventing keyboard and screen reader users from losing their position.
 * 4. Keyboard Dismissal: Listens for Escape key to cleanly trigger modal closure.
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'summary',
].join(', ');

function isFocusable(el) {
  if (!el || el.disabled || el.getAttribute('aria-hidden') === 'true' || el.getAttribute('hidden') !== null) {
    return false;
  }
  // Check if hidden by zero-geometry or display
  if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0 && el.getClientRects().length === 0) {
    return false;
  }
  const style = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el) : null;
  if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) {
    return false;
  }
  return true;
}

/**
 * @param {React.RefObject} containerRef - Ref attached to the dialog container
 * @param {boolean} isOpen - Whether the modal is currently open / rendered
 * @param {Object} [options]
 * @param {React.RefObject} [options.initialFocusRef] - Optional ref to focus immediately
 * @param {Function} [options.onEscape] - Optional callback when user presses Escape
 * @param {boolean} [options.disableAutoFocus=false] - If true, bypass initial focus jump
 * @param {boolean} [options.disableRestoreFocus=false] - If true, do not restore focus to opener
 */
export function useFocusTrap(containerRef, isOpen = true, options = {}) {
  const {
    initialFocusRef,
    onEscape,
    disableAutoFocus = false,
    disableRestoreFocus = false,
  } = options;

  const openerRef = useRef(null);
  const wasOpenRef = useRef(false);

  // 1. Capture the active opener element when the dialog opens
  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        openerRef.current = document.activeElement;
        wasOpenRef.current = true;
      }
    } else {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        if (!disableRestoreFocus && openerRef.current && typeof openerRef.current.focus === 'function') {
          const toFocus = openerRef.current;
          setTimeout(() => {
            if (document.contains(toFocus)) {
              toFocus.focus();
            }
          }, 30);
        }
      }
    }
  }, [isOpen, disableRestoreFocus]);

  // Restore focus to opener on component unmount
  useEffect(() => {
    return () => {
      if (wasOpenRef.current && !disableRestoreFocus && openerRef.current && typeof openerRef.current.focus === 'function') {
        const toFocus = openerRef.current;
        setTimeout(() => {
          if (document.contains(toFocus)) {
            toFocus.focus();
          }
        }, 30);
      }
    };
  }, [disableRestoreFocus]);

  // 2. Initial focus into the modal on open
  useEffect(() => {
    if (!isOpen) return;

    let timeoutId;
    const focusTimer = () => {
      const container = containerRef?.current;
      if (!container) return;

      if (!disableAutoFocus) {
        if (initialFocusRef?.current && typeof initialFocusRef.current.focus === 'function') {
          initialFocusRef.current.focus();
          return;
        }

        const autoFocusEl = container.querySelector('[data-autofocus], [autofocus]');
        if (autoFocusEl && isFocusable(autoFocusEl)) {
          autoFocusEl.focus();
          return;
        }

        const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
        if (focusables.length > 0) {
          // Focus first interactive element (close button or first input field)
          focusables[0].focus();
        } else {
          // Ensure container is focusable and focus it for screen reader announcement
          if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '-1');
          }
          container.focus();
        }
      }
    };

    timeoutId = setTimeout(focusTimer, 25);
    return () => clearTimeout(timeoutId);
  }, [isOpen, containerRef, initialFocusRef, disableAutoFocus]);

  // 3. Tab trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const container = containerRef?.current;
      if (!container) return;

      // Handle Escape dismissal
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault();
          e.stopPropagation();
          onEscape();
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey) {
        // Shift + Tab: wrapping from first element back to last element
        if (activeEl === firstEl || activeEl === container || !container.contains(activeEl)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: wrapping from last element forward to first element
        if (activeEl === lastEl || !container.contains(activeEl)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, containerRef, onEscape]);
}

export default useFocusTrap;
