import React from "react";
import ReactDOM from "react-dom";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
import { X } from "lucide-react";

/**
 * Modal Component - Flexible dialog box for important content
 *
 * Props:
 * - isOpen: boolean - whether modal is visible
 * - onClose: function - callback when modal should close
 * - children: React.ReactNode - content to render inside modal
 * - title: string (optional) - modal header title
 * - className: string (optional) - custom classes for modal container
 * - showHeader: boolean (optional) - whether to show default header (default: true if title provided)
 *
 * Features:
 * - Centered modal with backdrop overlay
 * - High z-index to appear above all content (including drawers)
 * - Prevents background scroll when open
 * - Stops click propagation inside modal (click inside doesn't close it)
 * - Flexible layout - can render with or without header
 * - Uses React Portal to render at document body level (prevents parent container issues)
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  showHeader = true,
}) {
  React.useEffect(() => {
    if (isOpen) lockBodyScroll();
    return () => {
      if (isOpen) unlockBodyScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasHeader = showHeader && title;

  const modalContent = (
    // High z-index (100) ensures modal appears above cart drawer and other elements
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Modal content box - click inside doesn't trigger backdrop onClick */}
      <div
        className={`bg-white rounded-lg shadow-2xl transform transition-all max-h-[90dvh] p-2 overflow-auto ${
          className || "max-w-lg w-full m-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional header with title and close button */}
        {hasHeader && (
          <div className="flex justify-center items-center p-5 relative">
            <div className="text-xl !font-medium text-gray-900">{title}</div>
            <button
              onClick={onClose}
              className="absolute right-1 top-1 md:right-5 md:top-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={24} className="hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Modal body - children are rendered here */}
        {hasHeader ? (
          <div className="py-2 px-4 md:px-6">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );

  // Use React Portal to render modal at document body level
  // This ensures the modal is never constrained by parent container positioning
  return ReactDOM.createPortal(modalContent, document.body);
}
