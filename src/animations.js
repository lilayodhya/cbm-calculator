/**
 * animations.js — Shared Framer Motion variants and transition presets.
 *
 * Keep all animation primitives here so every component speaks the same
 * motion language. Import only what you need.
 */

/* ─── Transition presets ──────────────────────────────────────────────────── */

/** Smooth but energetic spring — enough mass to feel weighty, not stiff. */
export const springSmooth = {
  type: 'spring',
  stiffness: 200,
  damping: 22,
  mass: 1,
};

/** Bouncy spring for modals and dramatic entrances. */
export const springBouncy = {
  type: 'spring',
  stiffness: 320,
  damping: 20,
  mass: 0.9,
};

/** Snappier spring for small interactive elements (buttons, chips). */
export const springSnap = {
  type: 'spring',
  stiffness: 420,
  damping: 26,
  mass: 0.7,
};

/** Backdrop overlay ease. */
export const easeOverlay = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

/** Smooth reveal for inline content blocks. */
export const easePanel = { duration: 0.36, ease: [0.16, 1, 0.3, 1] };

/* ─── Page / column entrance ─────────────────────────────────────────────── */

/** Parent that staggers its children on mount. */
export const pageContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

/** Individual column card — sweeps up from well below with a slight scale. */
export const columnCard = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springSmooth,
  },
};

/* ─── List / directory items ────────────────────────────────────────────── */

/** Staggered list container. */
export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

/** Each list row — slides in from the left with a scale pop. */
export const listItem = {
  hidden: { opacity: 0, x: -24, scale: 0.92 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springSmooth,
  },
};

/* ─── Shipment row (AnimatePresence add / remove) ───────────────────────── */

/** Shipment item — dramatic slide from left on add, fade-shrink on remove. */
export const shipmentRow = {
  initial: { opacity: 0, x: -48, scale: 0.88, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { ...springBouncy, delay: 0 },
  },
  exit: {
    opacity: 0,
    scale: 0.82,
    x: 40,
    filter: 'blur(2px)',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Modals ─────────────────────────────────────────────────────────────── */

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOverlay },
  exit:    { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
};

/** Standard modal panel — sweeps up from below with a scale pop. */
export const modalPanel = {
  hidden: { opacity: 0, scale: 0.82, y: 64 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springBouncy, delay: 0.06 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    y: 32,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

/** Confirm modal — drops from above with a hard bounce. */
export const confirmPanel = {
  hidden: { opacity: 0, scale: 0.7, y: -48 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springBouncy, stiffness: 400, damping: 18 },
  },
  exit: {
    opacity: 0,
    scale: 0.82,
    y: 24,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Inline reveal (CBM preview, weight breakdown) ─────────────────────── */

/** Slides in from the left as height opens — very visible. */
export const inlineReveal = {
  initial: { opacity: 0, height: 0, x: -16, marginBottom: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    x: 0,
    marginBottom: 8,
    transition: easePanel,
  },
  exit: {
    opacity: 0,
    height: 0,
    x: 16,
    marginBottom: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Button micro-interactions ─────────────────────────────────────────── */

/** Standard interactive button — clearly perceptible lift. */
export const btnHover = { scale: 1.06, y: -2 };
export const btnTap   = { scale: 0.94, y: 0 };

/** Icon / chip buttons — energetic pop. */
export const btnIconHover = { scale: 1.14, rotate: 4 };
export const btnIconTap   = { scale: 0.88, rotate: 0 };
