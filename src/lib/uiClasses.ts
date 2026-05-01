export const heroPrimaryCtaClass =
	'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_8px_28px_var(--color-accent-soft)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-border)] sm:px-6 sm:py-3';

/** Ghost CTA on the dark hero (same background in both themes) — must stay light-on-dark, not `--color-text`. */
export const heroSecondaryCtaClass =
	'inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-white/35 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-border)] sm:px-6 sm:py-3';
