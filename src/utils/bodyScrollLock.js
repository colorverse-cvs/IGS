let lockCount = 0;

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount += 1;
  // Prevent background scroll
  document.body.style.overflow = "hidden";
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount > 0) lockCount -= 1;
  if (lockCount === 0) {
    // Restore default scroll
    document.body.style.overflow = "";
  }
}
