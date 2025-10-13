import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSuccessfullyCart from "../assets/order-successfully-cart-log.svg";

export default function OrderPlaced() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order || null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <img src={OrderSuccessfullyCart} />
      <h1 className="text-xl md:text-2xl font-semibold text-purple-700 mb-2">
        Your Order Has Been Placed Successfully!
      </h1>
      <p className="text-gray-600 max-w-xl">
        Thank you for shopping with us
        {order?.address?.name ? `, ${order.address.name.split(" ")[0]}` : ""}.
        Your beautiful statue will be delivered soon.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => navigate("/")}
        >
          Go to home
        </button>
        <button
          className="px-4 py-2 bg-purple-700 text-white rounded"
          onClick={() => navigate("/orders")}
        >
          View your orders
        </button>
      </div>
    </div>
  );
}
