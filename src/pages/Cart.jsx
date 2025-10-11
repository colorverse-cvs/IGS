import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQty,
  clearCart,
} from "../features/cart/cartSlice";
import { Link } from "react-router-dom";
import { Trash2, X, Minus, Plus } from "lucide-react";
import Modal from "../components/Modal";
import CheckoutContent from "../components/CheckoutContent";

/**
 * Cart Component: Handles both the full-page cart view and the narrow drawer/popup view.
 * @param {boolean} isDrawer - True if loaded inside a side panel/popup.
 * @param {function} onClose - Function to close the parent drawer/popup.
 */
export default function Cart({ isDrawer = false, onClose }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  // Redux State and Dispatch
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  // --- Handler Functions ---
  const handleQtyChange = (id, newQty) => {
    const qty = Number(newQty);
    if (qty >= 1) {
      dispatch(updateQty({ id: id, qty: qty }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Handler to open the modal (used in both drawer and full page)
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  // Handler run after payment is successfully simulated in CheckoutContent
  const handlePaymentSuccessAndClose = () => {
    setIsPaymentModalOpen(false); // Close the Payment Modal
    if (onClose) onClose(); // Close the cart drawer ONLY after successful payment
  };

  // --- Conditional Styling ---
  const containerClasses = isDrawer ? "p-0" : "container mx-auto px-4 py-8";

  return (
    <>
      <div className={containerClasses}>
        {/* Full Page Header (Only displayed if NOT in drawer) */}
        {!isDrawer && (
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-2">
            Shopping Cart 🛒
          </h1>
        )}

        {items.length === 0 ? (
          // EMPTY CART STATE
          <div
            className={`${
              isDrawer
                ? "py-10 text-center"
                : "py-16 bg-white rounded-xl shadow-md text-center"
            }`}
          >
            <p className="text-xl text-gray-600 mb-4">
              Your cart is feeling a bit light! Start shopping now.
            </p>
            <Link
              to="/"
              onClick={onClose}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition"
            >
              Continue Shopping →
            </Link>
          </div>
        ) : (
          // MAIN CONTENT LAYOUT
          <div
            className={`flex ${
              isDrawer
                ? "flex-col pt-4 px-4 h-dvh"
                : "flex-col md:flex-row gap-8 h-100 "
            }`}
          >
            {/* --- Cart Items List (Main Section) --- */}
            <div
              className={`${
                isDrawer
                  ? "flex-1"
                  : "md:w-3/4 bg-white p-6 rounded-xl shadow-lg"
              } space-y-6`}
            >
              {items.map((it) => (
                <div
                  key={it.id}
                  className={`flex ${
                    isDrawer ? "flex-col items-start" : "flex-row items-center"
                  } py-4 border-b last:border-b-0 relative`}
                >
                  {/* Image and Product Info */}
                  <img
                    src={it.image}
                    alt={it.title}
                    className="w-24 h-24 object-cover rounded-lg mr-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-gray-800 truncate">
                      {it.title}
                    </div>
                    <div className="text-md font-bold text-gray-900 mt-1">
                      ₹{it.price}
                    </div>
                  </div>

                  {/* Controls/Actions Section */}
                  <div
                    className={`${
                      isDrawer
                        ? "mt-3 flex justify-between w-full"
                        : "flex items-center space-x-4"
                    }`}
                  >
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg p-1">
                      <button
                        onClick={() => handleQtyChange(it.id, it.qty - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"
                        disabled={it.qty <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={it.qty}
                        min={1}
                        onChange={(e) => handleQtyChange(it.id, e.target.value)}
                        className="w-10 text-center font-medium border-none focus:ring-0 p-0 text-sm"
                      />
                      <button
                        onClick={() => handleQtyChange(it.id, it.qty + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Subtotal (Drawer/Full Page) */}
                    <div
                      className={`${
                        isDrawer ? "text-lg font-bold" : "hidden"
                      } text-gray-900`}
                    >
                      ₹{it.price * it.qty}
                    </div>
                    {!isDrawer && (
                      <div className="text-lg font-bold text-gray-900 w-24 text-right">
                        ₹{it.price * it.qty}
                      </div>
                    )}

                    {/* Remove Button (for full-page) */}
                    {!isDrawer && (
                      <button
                        onClick={() => handleRemoveItem(it.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  {/* Drawer Only Remove Button */}
                  {isDrawer && (
                    <button
                      onClick={() => handleRemoveItem(it.id)}
                      className="text-red-500 hover:text-red-700 transition absolute top-4 right-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}

              {/* Clear Cart Button (Only show on full page) */}
              {!isDrawer && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleClearCart}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    <X size={16} className="mr-2" /> Clear All Items
                  </button>
                </div>
              )}
            </div>

            {/* --- Order Summary / Checkout Section --- */}
            {isDrawer ? (
              // DRAWER: Sticky Bottom Checkout
              <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg z-10">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-purple-700">₹{total}</span>
                </div>
                <Link
                  to="#"
                  onClick={handleOpenPaymentModal} // Opens modal, DOES NOT close drawer
                  className="w-full inline-block text-center px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={handleClearCart}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Clear cart
                </button>
              </div>
            ) : (
              // FULL PAGE: Right Column Summary
              <div className="md:w-1/4 bg-gray-50 p-6 rounded-xl shadow-lg h-fit sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                  Order Summary
                </h2>
                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Order Total</span>
                    <span className="text-purple-700">₹{total}</span>
                  </div>
                </div>
                {/* Checkout Button */}
                <Link
                  to="#"
                  onClick={handleOpenPaymentModal} // Opens modal
                  className="w-full mt-6 inline-block px-4 py-3 text-center bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition shadow-lg"
                >
                  Proceed to Checkout
                </Link>
                <div className="text-center text-xs text-gray-500 mt-4">
                  Taxes and shipping calculated at checkout.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL COMPONENT (Viewport Centered) --- */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)} // User can close the modal manually
        title="Secure Payment"
      >
        {/* Passes the success handler to close the modal AND the cart drawer on payment */}
        <CheckoutContent onSuccess={handlePaymentSuccessAndClose} />
      </Modal>
    </>
  );
}
