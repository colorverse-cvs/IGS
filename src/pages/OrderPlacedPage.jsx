import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSuccessfullyCart from "../assets/order-successfully-cart-log.svg";

/**
 * OrderPlacedPage Component
 *
 * Displays success message after order placement.
 * Shown after user completes checkout and order is saved.
 *
 * For beginners:
 * - Receives order data through React Router's location state
 * - Shows confirmation message with personalized greeting
 * - Provides navigation to home page or orders page
 * - Order data is saved to Redux store (ordersSlice) which persists to localStorage
 */
export default function OrderPlacedPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order || null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <img src={OrderSuccessfullyCart} />
      <div className="text-xl md:text-2xl font-semibold text-brand-700 my-2">
        Your Order Has Been Placed Successfully!
      </div>
      <p className="text-gray-600 max-w-xl">
        Thank you for shopping with us
        {order?.address?.name ? `, ${order.address.name.split(" ")[0]}` : ""}.
        Your beautiful statue will be delivered soon.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          className="p-2 md:px-4 py-2 border rounded"
          onClick={() => navigate("/")}
        >
          Go to home
        </button>
        <button
          className="p-2 md:px-4 py-2 bg-brand-700 text-white rounded"
          onClick={() => navigate("/orders")}
        >
          View your orders
        </button>
      </div>
    </div>
  );
}
