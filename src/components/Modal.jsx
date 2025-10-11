import React from "react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
import { X } from "lucide-react";

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
    // FIX: High z-index and fixed positioning forces the modal to cover the whole viewport,
    // regardless of the parent cart drawer's boundary.
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      {/* Modal Content Container: This is the white box that appears in the center */}
      <div
        className="bg-white rounded-sm shadow-2xl max-w-lg w-full m-4 transform transition-all max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body (CheckoutContent.jsx is rendered here) */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
