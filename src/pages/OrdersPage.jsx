import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  fetchOrdersAsync,
  updateOrderStatus,
  cancelOrderAsync,
} from "../features/orders/ordersSlice";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Dropdown from "../components/Dropdown.jsx";
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

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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

const formatOrderId = (id) => {
  if (!id) return "";
  return `ORD-${id.slice(-5)}`;
};

/* -------------------- Component -------------------- */

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector((s) => s.orders.orders || []);

  const [activeTab, setActiveTab] = useState("orders"); // orders | current | previous
  const [query, setQuery] = useState("");
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);

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
        (o) => ["pending", "placed"].includes(o.status) && matchesQuery(o)
      ),
    [orders, query]
  );

  const previousOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          ["shipped", "delivered", "cancelled", "returned"].includes(
            o.status
          ) && matchesQuery(o)
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
      placed: "bg-blue-100 text-blue-600",
      processing: "text-yellow-700 border-yellow-300",
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded border ${colorMap[s] || colorMap.placed
          }`}
      >
        {labelMap[s]}
      </span>
    );
  };

  const ActionButtons = ({ order, item }) => {
    const productId = item.product?._id;
    const canCancel = ["pending", "placed", "processing"].includes(order.status);

    if (activeTab === "previous") {
      return (
        <div className="flex flex-col gap-2">
          {/* <button className="px-3 py-1 border rounded text-sm">
            Download Invoice
          </button> */}
          <button
            className={`px-3 py-1 text-brand-600 border border-brand-600 rounded text-sm
                                        ${it.product === null
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-brand-50"
              }`}
            onClick={() => navigate(`/product/${productId}`)}
          >
            View Order
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <button
          className={`px-3 py-1 text-brand-600 border border-brand-600 rounded text-sm
                                        ${it.product === null
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-brand-50"
            }`}
          onClick={() => navigate(`/product/${productId}`)}
        >
          View Order
        </button>
        {canCancel && (
          <button
            className="px-3 py-1 border rounded text-sm text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
            onClick={() => dispatch(cancelOrderAsync(order._id))}
          >
            Cancel Order
          </button>
        )}
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
            <div className="text-xl !font-medium">Your Orders</div>
            <p className="text-sm text-gray-600">
              Track and manage your orders
            </p>
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
                className={`pb-2 capitalize transition-colors ${activeTab === tab
                  ? "border-b-2 border-brand-500 text-brand-600 font-medium"
                  : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                {tab === "orders"
                  ? "All Orders"
                  : tab.charAt(0).toUpperCase() + tab.slice(1) + " Orders"}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden w-full">
            <Dropdown
              isOpen={isOrdersDropdownOpen}
              onToggle={setIsOrdersDropdownOpen}
              align="left"
              trigger={(isOpen) => (
                <button className="w-full text-left border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white flex items-center justify-between cursor-pointer">
                  <span>
                    {activeTab === "orders"
                      ? "All Orders"
                      : activeTab.charAt(0).toUpperCase() +
                      activeTab.slice(1) +
                      " Orders"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>
              )}
            >
              {["orders", "current", "previous"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setIsOrdersDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                >
                  {tab === "orders"
                    ? "All Orders"
                    : tab.charAt(0).toUpperCase() + tab.slice(1) + " Orders"}
                </button>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* ORDER LIST */}
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <div className="text-gray-500 text-lg">No orders found.</div>
              <div className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filters.
              </div>
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
                    <div className="w-[70%]">
                      <div className="!font-medium text-sm text-gray-900 truncate">
                        {formatOrderId(order._id)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right w-[30%]">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-block mb-1 ${order.status === "delivered"
                          ? "bg-green-100 text-green-600"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : order.status === "placed"
                              ? "bg-blue-100 text-blue-600"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                      >
                        {order.status || "Pending"}
                      </span>
                      <div className="text-sm !font-medium text-gray-900 mt-1 px-2 py-1 text-end">
                        ₹{order.total}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {order.items.map((it, index) => {
                  const product = it.product || {};

                  return (
                    <div
                      key={it._id}
                      className={`${index > 0 ? "border-t border-gray-100" : ""
                        }`}
                    >
                      {/* Desktop Table Row */}
                      <table className="hidden lg:table w-full text-sm border-collapse">
                        <tbody>
                          <tr className="px-4 py-4">
                            {/* Order ID */}
                            <td className="px-4 py-4 font-medium text-gray-900 w-[10%] xl:w-[14%] truncate">
                              <div className="w-[130px] xl:w-auto truncate">
                                {formatOrderId(order._id)}
                              </div>
                            </td>

                            {/* Product Details */}
                            <td className="px-4 py-4 w-[80%] xl:w-[40%]">
                              <div className="flex gap-4">
                                <img
                                  src={`${APP_URL}${product.images?.[0]?.url}`}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                  {it.product ? (
                                    <div className="font-medium text-gray-900 truncate">
                                      {product.name}
                                    </div>
                                  ) : (
                                    <p className="font-medium text-gray-500">
                                      {it.name}{" "}
                                      <span className="text-xs">
                                        (Product no longer available)
                                      </span>
                                    </p>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Material:{" "}
                                    {product.attributes?.material || "-"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Size:{" "}
                                    {product.dimensions?.sizeCategory || "-"}
                                  </div>
                                  <div className="text-brand-600 !font-medium mt-1">
                                    ₹{it.price}
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1">
                                    Will be delivered by{" "}
                                    {addDays(order.createdAt, 4)}, 8 AM - 8 PM
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center items-center">
                                  {activeTab === "previous" ? (
                                    <>
                                      {/* <button className="px-3 py-1 border rounded text-sm">
                                        Download Invoice
                                      </button> */}
                                      <button
                                        className={`px-3 py-1 text-brand-600 border border-brand-600 rounded text-sm
                                        ${it.product === null
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer hover:bg-brand-50"
                                          }`}
                                        onClick={() =>
                                          navigate(`/product/${product._id}`)
                                        }
                                      >
                                        View Order
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className={`px-3 py-1 text-brand-600 border border-brand-600 rounded text-sm
                                        ${it.product === null
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer hover:bg-brand-50"
                                          }`}
                                        onClick={() =>
                                          navigate(`/product/${product._id}`)
                                        }
                                      >
                                        View Order
                                      </button>
                                      {["pending", "placed", "processing"].includes(order.status) && (
                                        <button
                                          className="px-3 py-1 border rounded text-sm text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                                          onClick={() => dispatch(cancelOrderAsync(order._id))}
                                        >
                                          Cancel Order
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4 w-[8%]">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${order.status === "delivered"
                                  ? "bg-green-100 text-green-600"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-600"
                                    : order.status === "placed"
                                      ? "bg-blue-100 text-blue-600"
                                      : order.status === "processing"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-orange-100 text-orange-600"
                                  }`}
                              >
                                {order.status || "Pending"}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-4 text-gray-600 w-[12%]">
                              <div>{formatDate(order.createdAt)}</div>
                              <div className="text-xs text-gray-500 mt-1">{formatTime(order.createdAt)}</div>
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-4 font-medium w-[6%]">
                              {it.quantity}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-4 !font-medium text-gray-900 w-[8%]">
                              ₹{Number(Math.max(0, order.total).toFixed(2))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Mobile/Tablet Card Layout */}
                      <div className="lg:hidden px-4 py-4">
                        <div className="flex gap-3">
                          <img
                            src={`${APP_URL}${product.images?.[0]?.url}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            {it.product ? (
                              <div className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </div>
                            ) : (
                              <p className="font-medium text-gray-500">
                                {it.name}{" "}
                                <span className="text-xs">
                                  (Product no longer available)
                                </span>
                              </p>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Material: {product.attributes?.material || "-"} •
                              Size: {product.dimensions?.sizeCategory || "-"}
                            </div>
                            <div className="text-brand-600 !font-medium text-sm mt-1">
                              ₹{it.price} × {it.quantity}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              Delivery by {addDays(order.createdAt, 4)}, 8 AM -
                              8 PM
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {activeTab === "previous" ? (
                            <div className="flex gap-2">
                              {/* <button className="px-3 py-1 border rounded text-xs">
                                Download Invoice
                              </button> */}
                              <button
                                className="px-3 py-1 text-brand-600 border border-brand-600 hover:bg-brand-50 rounded text-xs cursor-pointer"
                                onClick={() =>
                                  navigate(`/product/${product._id}`)
                                }
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product._id}`)
                                }
                                className={`px-3 py-1 border rounded text-xs
                              ${product?._id
                                    ? "text-brand-600 border-brand-600 hover:bg-brand-50 cursor-pointer"
                                    : "text-gray-400 border-gray-300 cursor-not-allowed opacity-50"
                                  }`}
                              >
                                View Order
                              </button>
                              {["pending", "placed", "processing"].includes(order.status) && (
                                <button
                                  className="px-3 py-1 border rounded text-xs text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                                  onClick={() => dispatch(cancelOrderAsync(order._id))}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
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
