import React from "react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
import { X } from "lucide-react";

/**
 * Modal Component - Centered dialog box for important content
 * 
 * Props:
 * - isOpen: boolean - whether modal is visible
 * - onClose: function - callback when modal should close
 * - children: React.ReactNode - content to render inside modal
 * - title: string - modal header title (default: "Payment Gateway")
 * 
 * Features:
 * - Centered modal with backdrop overlay
 * - High z-index to appear above all content (including drawers)
 * - Prevents background scroll when open
 * - Stops click propagation inside modal (click inside doesn't close it)
 * - Used for payment gateway and other critical workflows
 * 
 * For beginners:
 * - onClick={(e) => e.stopPropagation()} prevents the backdrop's onClick from firing
 * - z-[100] ensures it appears above cart drawer (z-50) and other elements
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title = "Payment Gateway",
}) {
  React.useEffect(() => {
    if (isOpen) lockBodyScroll();
    return () => {
      if (isOpen) unlockBodyScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // High z-index (100) ensures modal appears above cart drawer and other elements
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      {/* Modal content box - click inside doesn't trigger backdrop onClick */}
      <div
        className="bg-white rounded-sm shadow-2xl max-w-lg w-full m-4 transform transition-all max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header with title and close button */}
        <div className="flex justify-center items-center p-5 border-b border-gray-100 relative">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-1 top-1 md:right-5 md:top-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal body - children are rendered here */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
