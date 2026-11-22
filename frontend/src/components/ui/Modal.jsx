import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon.jsx';
import { usePresence } from '../../hooks/usePresence.js';

const EXIT_MS = 180;

const SIZES = {
  sm: 'max-w-[360px]',
  md: 'max-w-[420px]',
  lg: 'max-w-[480px]',
  xl: 'max-w-[560px]',
  full: 'max-w-[90vw]',
};

export default function Modal({
  isOpen = false,
  onClose = undefined,
  title = undefined,
  subtitle = undefined,
  icon = undefined,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  children = undefined,
  footer = undefined,
  hideClose = false,
  className = '',
  headerClassName = '',
  onExited = undefined,
}) {
  // Stay mounted briefly after isOpen → false so the exit animation can play.
  const { mounted, closing } = usePresence(isOpen, EXIT_MS);
  const wasMountedRef = useRef(mounted);
  useEffect(() => {
    if (wasMountedRef.current && !mounted) onExited?.();
    wasMountedRef.current = mounted;
  }, [mounted, onExited]);
  const cardRef = useRef(null);
  const previousActiveRef = useRef(null);
  const titleId = useId();

  // Lock body scroll + restore focus
  useEffect(() => {
    if (!isOpen) return;
    previousActiveRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // focus card
    requestAnimationFrame(() => cardRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      // restore focus
      if (previousActiveRef.current && typeof previousActiveRef.current.focus === 'function') {
        previousActiveRef.current.focus();
      }
    };
  }, [isOpen]);

  // ESC handling + focus trap
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
      // focus trap: keep tab within modal
      if (e.key === 'Tab' && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!mounted) return null;

  const sizeClass = SIZES[size] || SIZES.md;
  const motionState = closing ? ' is-closing' : '';

  return createPortal(
    <>
      <div
        className={`v-motion-backdrop${motionState} fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-[2px]`}
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))', paddingTop: 'max(16px, env(safe-area-inset-top, 0px))' }}
        onMouseDown={(e) => {
          if (closing) return;
          if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div
          ref={cardRef}
          tabIndex={-1}
          className={`v-motion-dialog${motionState} bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] border border-[var(--border-medium)] w-full ${sizeClass} rounded-[12px] overflow-hidden flex flex-col max-h-[min(90vh,100%)] supports-[height:100dvh]:max-h-[min(90dvh,100%)] outline-none ${className}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || subtitle || icon || !hideClose) && (
            <div className={`flex items-center justify-between gap-3 pl-5 pr-3 sm:pl-6 sm:pr-4 py-3.5 border-b border-[var(--border-light)] bg-transparent shrink-0 ${headerClassName}`}>
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center shrink-0">
                    <Icon name={icon} className="text-[17px] text-[var(--accent)]" />
                  </div>
                )}
                <div className="min-w-0">
                  {title && <h3 id={titleId} className="text-[16px] font-semibold text-[var(--text-primary)] leading-snug break-words">{title}</h3>}
                  {subtitle && <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5 leading-snug break-words">{subtitle}</p>}
                </div>
              </div>
              {!hideClose && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 pointer-coarse:w-10 pointer-coarse:h-10 rounded-lg bg-transparent hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors shrink-0"
                  aria-label="Close dialog"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-5 sm:p-6" style={{ scrollbarWidth: 'thin' }}>
            {children}
          </div>

          {footer && (
            <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--border-light)] shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
