let lockCount = 0;
let originalScrollY = 0;

/**
 * Lock background page scrolling without hiding scrollbar
 * Safe for nested modals - scroll only unlocks when all modals are closed
 */
export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount === 1) {
    originalScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";
  }
}

/**
 * Unlock background page scrolling
 * Only restores scrolling when lockCount reaches 0 (all modals closed)
 */
export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount > 0) lockCount -= 1;
  if (lockCount === 0) {
    // Restore scroll position and remove fixed positioning
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflowY = ""; // Reset overflow
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }
}
