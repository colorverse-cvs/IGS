import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../features/cart/cartSlice";

export default function CheckoutContent({ onSuccess }) {
  const items = useSelector((s) => s.cart.items);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const dispatch = useDispatch();

  const handlePay = async () => {
    // ... (Payment logic) ...
    alert("Payment processing simulated successfully!");
    dispatch(clearCart());
    onSuccess();
  };

  return (
    <div className="bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h1>

      <div className="space-y-3 p-4 border rounded-lg bg-gray-50 mb-6">
        <div className="flex justify-between font-semibold text-lg text-gray-700">
          <span>Items Total:</span>
          <span>₹{total}</span>
        </div>
        <div className="flex justify-between font-bold text-xl border-t pt-2 text-purple-700">
          <span>Order Total:</span>
          <span>₹{total}</span>
        </div>
      </div>

      <div>
        <button
          onClick={handlePay}
          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
        >
          Pay Now ₹{total}
        </button>
        <p className="text-center text-sm text-gray-500 mt-3">
          Powered by a secure payment gateway.
        </p>
      </div>
    </div>
  );
}
