import React, { useState, useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import Cart from "../pages/Cart.jsx";

/**
 * CartDrawer Component - Slide-out shopping cart panel
 *
 * Props:
 * - isOpen: boolean - whether the drawer is visible
 * - onClose: function - callback to close the drawer
 *
 * Features:
 * - Renders the full Cart page inside a right-side slide-out panel
 * - Locks body scroll when drawer is open (prevents background scrolling)
 * - Supports nested modals (Payment Gateway modal can appear inside the drawer)
 * - Click outside (backdrop) to close the drawer
 *
 * For beginners:
 * - This component wraps the Cart component in a modal drawer UI
 * - The backdrop helps users understand they can click outside to close
 */
const CartDrawer = ({ isOpen, onClose }) => {
  // Get number of items in cart for display
  const itemCount = useSelector((s) => s.cart.items.length);

  // Lock body scroll when drawer is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) lockBodyScroll();
    return () => {
      if (isOpen) unlockBodyScroll();
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay - click to close drawer */}
      <div
        className={`
                    fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                `}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer panel - slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 md:w-80 lg:w-80 xl:w-90 bg-white shadow-2xl z-999 transition-transform duration-500 ease-in-outflex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Drawer header with title and close button */}
        <div className="flex items-center justify-between p-4 xl:p-6 border-b border-gray-100">
          <div className="text-2xl !font-medium text-gray-900">
            Your Shopping Cart
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X size={24} className="hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Cart content wrapper - makes Cart component scrollable inside drawer */}
        <div className="flex-1 flex justify-center items-center">
          <Cart isDrawer={true} onClose={onClose} />
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
