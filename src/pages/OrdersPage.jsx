import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOrdersAsync,
  updateOrderStatus,
} from "../features/orders/ordersSlice";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { APP_URL } from "../constant";

/* -------------------- Utils -------------------- */

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const addDays = (iso, days) => {
  if (!iso) return "";
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const normalizeStatus = (status) => {
  if (status === "pending") return "placed";
  return status || "placed";
};

/* -------------------- Component -------------------- */

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector((s) => s.orders.orders || []);

  const [activeTab, setActiveTab] = useState("orders"); // orders | current | previous
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchOrdersAsync());
  }, [dispatch]);

  /* -------------------- Search -------------------- */

  const matchesQuery = (order) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();

    return (
      order._id?.toLowerCase().includes(q) ||
      order.items?.some((it) => it.product?.name?.toLowerCase().includes(q))
    );
  };

  /* -------------------- Filters -------------------- */

  const filteredAll = useMemo(
    () => orders.filter(matchesQuery),
    [orders, query]
  );

  const currentOrders = useMemo(
    () =>
      orders.filter(
        (o) => ["pending", "processing"].includes(o.status) && matchesQuery(o)
      ),
    [orders, query]
  );

  const previousOrders = useMemo(
    () =>
      orders.filter(
        (o) => ["delivered", "cancelled"].includes(o.status) && matchesQuery(o)
      ),
    [orders, query]
  );

  const data =
    activeTab === "orders"
      ? filteredAll
      : activeTab === "current"
      ? currentOrders
      : previousOrders;

  /* -------------------- UI Helpers -------------------- */

  const StatusPill = ({ status }) => {
    const s = normalizeStatus(status);

    const labelMap = {
      placed: "Order Placed",
      processing: "Processing",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const colorMap = {
      delivered: "text-green-700 border-green-300",
      cancelled: "text-red-700 border-red-300",
      placed: "text-yellow-700 border-yellow-300",
      processing: "text-yellow-700 border-yellow-300",
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded border ${
          colorMap[s] || colorMap.placed
        }`}
      >
        {labelMap[s]}
      </span>
    );
  };

  const ActionButtons = ({ order, item }) => {
    const productId = item.product?._id;

    if (activeTab === "previous") {
      return (
        <div className="flex flex-col gap-2">
          <button className="px-3 py-1 border rounded text-sm">
            Download Invoice
          </button>
          <button
            className="px-3 py-1 border rounded text-sm cursor-pointer"
            onClick={() => navigate(`/product/${productId}`)}
          >
            View Order Details
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <button
          className="px-3 py-1 border rounded text-sm cursor-pointer"
          onClick={() => navigate(`/product/${productId}`)}
        >
          View Order
        </button>
        {/* <button
          className="px-3 py-1 border rounded text-sm text-red-600 cursor-pointer"
          onClick={() =>
            dispatch(
              updateOrderStatus({
                id: order._id,
                status: "cancelled",
              })
            )
          }
        >
          Cancel Order
        </button> */}
      </div>
    );
  };

  /* -------------------- Render -------------------- */

  const breadcrumbItems = [{ label: "Home", link: "/" }, { label: "Orders" }];

  return (
    <>
      <div className="py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-lg mx-auto py-6 px-4 md:px-15 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Your Orders</h2>
            <p className="text-sm text-gray-600">Track and manage your orders</p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="search-bar-wrapper flex flex-col md:flex-row gap-4">

          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-6 text-sm">
            {["orders", "current", "previous"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-purple-500 text-purple-600 font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab} orders
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden w-full">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {["orders", "current", "previous"].map((tab) => (
                <option key={tab} value={tab}>
                  {tab === "orders" ? "All Orders" : tab.charAt(0).toUpperCase() + tab.slice(1) + " Orders"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ORDER LIST */}
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <div className="text-gray-500 text-lg">No orders found.</div>
              <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</div>
            </div>
          ) : (
            data.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Mobile/Tablet Card Header */}
                <div className="lg:hidden px-4 py-3 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Order #{order._id}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-block mb-1 ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                      <div className="text-sm font-semibold text-gray-900 mt-1">₹{order.total}</div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {order.items.map((it, index) => {
                  const product = it.product || {};

                  return (
                    <div
                      key={it._id}
                      className={`${
                        index > 0 ? 'border-t border-gray-100' : ''
                      }`}
                    >
                      {/* Desktop Table Row */}
                      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-4 text-sm">
                        <div className="col-span-2 flex items-center font-medium text-gray-900">
                          {order._id}
                        </div>

                        <div className="col-span-5 flex gap-4">
                          <img
                            src={`${APP_URL}${product.images?.[0]?.url}`}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Material: {product.attributes?.material || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Size: {product.dimensions?.sizeCategory || "-"}
                            </div>
                            <div className="text-purple-600 font-semibold mt-1">
                              ₹{it.price}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              Will be delivered by {addDays(order.createdAt, 4)}, 8 AM - 8 PM
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {activeTab === "previous" ? (
                              <>
                                <button className="px-3 py-1 border rounded text-sm">
                                  Download Invoice
                                </button>
                                <button
                                  className="px-3 py-1 border rounded text-sm cursor-pointer"
                                  onClick={() => navigate(`/product/${product._id}`)}
                                >
                                  View Order Details
                                </button>
                              </>
                            ) : (
                              <button
                                className="px-3 py-1 border rounded text-sm cursor-pointer"
                                onClick={() => navigate(`/product/${product._id}`)}
                              >
                                View Order
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="col-span-1 flex items-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-600"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : order.status === "processing"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center text-gray-600">
                          {formatDate(order.createdAt)}
                        </div>

                        <div className="col-span-1 flex items-center font-medium">
                          {it.quantity}
                        </div>

                        <div className="col-span-1 flex items-center font-semibold text-gray-900">
                          ₹{order.total}
                        </div>
                      </div>

                      {/* Mobile/Tablet Card Layout */}
                      <div className="lg:hidden px-4 py-4">
                        <div className="flex gap-3">
                          <img
                            src={`${APP_URL}${product.images?.[0]?.url}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Material: {product.attributes?.material || "-"} • Size: {product.dimensions?.sizeCategory || "-"}
                            </div>
                            <div className="text-purple-600 font-semibold text-sm mt-1">
                              ₹{it.price} × {it.quantity}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              Delivery by {addDays(order.createdAt, 4)}, 8 AM - 8 PM
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {activeTab === "previous" ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 border rounded text-xs">
                                Download Invoice
                              </button>
                              <button
                                className="px-3 py-1 border rounded text-xs cursor-pointer"
                                onClick={() => navigate(`/product/${product._id}`)}
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <button
                              className="px-3 py-1 border rounded text-xs cursor-pointer"
                              onClick={() => navigate(`/product/${product._id}`)}
                            >
                              View Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
