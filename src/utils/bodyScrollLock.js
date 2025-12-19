
let lockCount = 0;

/**
 * Lock background page scrolling
 * Safe for nested modals - scroll only unlocks when all modals are closed
 */
export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount += 1;
  // Prevent background scroll
  document.body.style.overflow = "hidden";
}

/**
 * Unlock background page scrolling
 * Only restores scrolling when lockCount reaches 0 (all modals closed)
 */
export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount > 0) lockCount -= 1;
  if (lockCount === 0) {
    // Restore default scroll
    document.body.style.overflow = "";
  }
}
