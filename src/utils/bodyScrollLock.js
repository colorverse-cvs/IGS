/**
 * Body Scroll Lock Utility
 * 
 * Prevents background page scrolling when modals/drawers are open.
 * Uses a counter to support nested modals (multiple things can call lock/unlock).
 * 
 * How it works:
 * - lockBodyScroll() increments counter and sets overflow: hidden
 * - unlockBodyScroll() decrements counter and restores scroll only when count reaches 0
 * - This allows multiple modals to be open and scroll is restored only when all close
 * 
 * Example:
 * - CartDrawer opens: lockBodyScroll() (count = 1)
 * - PaymentModal opens inside CartDrawer: lockBodyScroll() (count = 2)
 * - PaymentModal closes: unlockBodyScroll() (count = 1, still locked)
 * - CartDrawer closes: unlockBodyScroll() (count = 0, scroll restored!)
 * 
 * For beginners:
 * - lockCount tracks how many modals are currently open
 * - document.body.style.overflow = "hidden" prevents scrolling
 * - document.body.style.overflow = "" restores scrolling
 */
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
