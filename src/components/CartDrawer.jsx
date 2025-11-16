import React, { useState, useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import Cart from "../pages/Cart.jsx"; // We'll rename your original Cart.jsx

// This component simulates a right-side panel/drawer
const CartDrawer = ({ isOpen, onClose }) => {
  // Determine the number of items for the title
  const itemCount = useSelector((s) => s.cart.items.length);

  // Lock scrolling when the drawer is open (shared util, supports nested modals)
  useEffect(() => {
    if (isOpen) lockBodyScroll();
    return () => {
      if (isOpen) unlockBodyScroll();
    };
  }, [isOpen]);

  return (
    <>
      {/* --- Backdrop / Overlay --- */}
      <div
        className={`
                    fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                `}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* --- Side Panel / Drawer --- */}
      <div
        className={`
                    fixed top-0 right-0 h-full w-full sm:w-80 md:w-1/2 lg:w-80 
                    bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out
                    flex flex-col
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Shopping Cart {/* {itemCount === 0 ? "" : itemCount} */}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Content (Scrollable) */}
        <div className="flex-1 flex justify-center items-center">
          {/* Render the full Cart content inside the drawer */}
          <Cart isDrawer={true} onClose={onClose} />
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
