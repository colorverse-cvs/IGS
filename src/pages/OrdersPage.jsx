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

      <div className="mx-auto py-6 px-4 md:px-15 lg:px-20">
        <h2 className="text-2xl font-bold mb-4">Your Orders</h2>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-6 text-sm">
            {["orders", "current", "previous"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-brand-700 text-brand-700"
                    : "text-gray-600"
                }`}
              >
                {tab} orders
              </button>
            ))}
          </div>

          <input
            className="border rounded px-3 py-1 text-sm min-w-[220px]"
            placeholder="Search order"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Orders List */}
        {data.length === 0 ? (
          <div className="text-gray-500">No orders found.</div>
        ) : (
          <div className="space-y-6">
            {data.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Header */}
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-medium">
                  <div className="col-span-2">Order ID</div>
                  <div className="col-span-5">Items</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Order Date</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Total</div>
                </div>

                {/* Items */}
                {order.items.map((it) => {
                  const product = it.product || {};

                  return (
                    <div
                      key={it._id}
                      className="grid grid-cols-12 gap-3 px-4 py-3 border-t text-sm"
                    >
                      <div className="col-span-2 flex items-center">
                        {order._id}
                      </div>

                      <div className="col-span-5 flex gap-4">
                        <img
                          src={`${APP_URL}${product.images?.[0]?.url}`}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded"
                        />

                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            Material: {product.attributes?.material || "-"}
                          </div>

                          <div className="text-xs text-gray-500">
                            Size: {product.dimensions?.sizeCategory || "-"}
                          </div>

                          <div className="text-brand-700 font-semibold">
                            ₹{it.price}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Will be delivered by {addDays(order.createdAt, 4)},
                            8 AM - 8 PM
                          </div>
                        </div>

                        <ActionButtons order={order} item={it} />
                      </div>

                      <div className="col-span-1 flex items-center">
                        <StatusPill status={order.status} />
                      </div>

                      <div className="col-span-2 flex items-center">
                        {formatDate(order.createdAt)}
                      </div>

                      <div className="col-span-1 flex items-center">
                        {it.quantity}
                      </div>

                      <div className="col-span-1 flex items-center">
                        ₹{order.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
