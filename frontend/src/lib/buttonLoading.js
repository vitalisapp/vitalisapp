// Opt-in click flash for plain <button type="submit"> / .btn-flash only.
// <Button/> owns its own spinner (see data-managed-loading); nav, chips,
// toggles never flash — a fake spinner there looked like a bug.
// Buttons that render their OWN loading state (disabled + spinner, e.g. the
// Login "Signing in…" button) never flash either — showing both produced a
// double spinner for ~600ms.

const OWN_SPINNER = '.vitalis-spinner, .btn-spinner, .animate-spin, [role="progressbar"], [data-spinner]';

let installed = false;

export function installGlobalButtonLoading() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.addEventListener(
    'click',
    (e) => {
      const btn = /** @type {any} */ (e.target)?.closest?.('button');
      if (!btn || btn.disabled) return;
      if (btn.closest?.('[data-no-flash]')) return;
      if (btn.hasAttribute?.('data-managed-loading')) return;
      if (!btn.matches?.('button[type="submit"], .btn-flash')) return;

      // Wait one frame so the click handler's state update has rendered,
      // then only flash if the button did not switch to its own busy state.
      window.requestAnimationFrame(() => {
        if (!btn.isConnected || btn.disabled || btn.getAttribute('aria-busy') === 'true') return;
        if (btn.querySelector(OWN_SPINNER)) return;
        btn.classList.add('btn-click-flash');
        window.setTimeout(() => {
          btn.classList.remove('btn-click-flash');
        }, 600);
      });
    },
    { capture: true, passive: true },
  );
}

export default installGlobalButtonLoading;
