import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">No order to show</h1>
        <Link to="/" className="text-purple-700 underline">
          Go home
        </Link>
      </div>
    );
  }

  const name = order.address?.name || "";
  const firstName = name.split(" ")[0] || "";
  const now = new Date(order.date || Date.now());
  const min = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const max = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formatShort = (d) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "long" });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-700 m-2">
        Your Order Has Been Placed Successfully!
      </h1>
      <p className="text-gray-700 mb-8">
        Thank you for shopping with us{firstName ? `, ${firstName}` : ""}. Your
        beautiful statue will be delivered soon.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
          <div>Order ID</div>
          <div className="col-span-2">Items</div>
          <div>Order Date</div>
          <div>Quantity</div>
          <div>Total</div>
        </div>
        {order.items.map((it, idx) => (
          <div
            key={it.id || idx}
            className="grid grid-cols-6 items-center px-4 py-3 text-sm border-t"
          >
            <div>{order.id}</div>
            <div className="col-span-2 flex items-center gap-4">
              <img
                src={it.image}
                alt="item"
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-gray-500">
                  Material: {it.material || "-"} &nbsp; Size: {it.size || "-"}
                </div>
                <div className="text-purple-700 font-semibold">₹{it.price}</div>
                <div className="text-xs text-gray-500">
                  Will be delivered by –{" "}
                  <span className="font-semibold">
                    {formatShort(min)} - {formatShort(max)}, 8am - 10pm
                  </span>
                </div>
              </div>
            </div>
            <div>{new Date(order.date).toLocaleDateString()}</div>
            <div>{it.qty}</div>
            <div>₹{it.price * it.qty}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 bg-brand-700 text-white rounded">
          Track package
        </button>
        <button className="px-4 py-2 border rounded">View or Edit order</button>
        <button className="px-4 py-2 border rounded">Download Invoice</button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Delivery Address</div>
          <div className="text-gray-700">{order.address?.name}</div>
          <div className="text-gray-600">{order.address?.addressLine}</div>
          {order.address?.mobile && (
            <div className="text-gray-600">Mobile: {order.address.mobile}</div>
          )}
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Payment</div>
          <div className="text-gray-700 capitalize">
            {order.payment?.label || order.payment?.type}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Items Total</span>
            <span>₹{order.totals?.mrpTotal}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>-₹{order.totals?.discount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fees</span>
            <span>₹{order.totals?.delivery || 0}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t mt-2">
            <span>Payable Price</span>
            <span>₹{order.totals?.payable}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link to="/" className="text-purple-700 underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
