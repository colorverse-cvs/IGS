import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateOrderStatus } from "../features/orders/ordersSlice";
import Breadcrumb from "../components/Breadcrumb.jsx";

/**
 * Format date to readable string
 * Converts ISO date string to formatted date (e.g., "15 Jan 2024")
 */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * OrdersPage Component
 *
 * Displays order history with filtering and search functionality.
 * Shows orders in tabs: All Orders, Current Orders, Previous Orders.
 *
 * For beginners:
 * - Uses Redux to get orders from ordersSlice (loaded from localStorage)
 * - Orders are stored in localStorage with key 'igs_orders'
 * - Supports search by order ID or product title
 * - Can filter orders by status (placed, processing, delivered, cancelled)
 * - Allows canceling current orders
 */
export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allOrders = useSelector((s) => s.orders.orders);

  const [activeTab, setActiveTab] = React.useState("orders"); // 'orders' | 'current' | 'previous'
  const [query, setQuery] = React.useState("");

  const matchesQuery = (order) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      String(order.id).toLowerCase().includes(q) ||
      order.items?.some((it) => it.title && String(it.title).toLowerCase().includes(q))
    );
  };

  const currentOrders = React.useMemo(
    () =>
      allOrders.filter(
        (o) => ["placed", "processing"].includes(o.status) && matchesQuery(o)
      ),
    [allOrders, query]
  );
  const previousOrders = React.useMemo(
    () =>
      allOrders.filter(
        (o) => ["delivered", "cancelled"].includes(o.status) && matchesQuery(o)
      ),
    [allOrders, query]
  );
  const filteredAll = React.useMemo(
    () => allOrders.filter(matchesQuery),
    [allOrders, query]
  );

  const data =
    activeTab === "orders"
      ? filteredAll
      : activeTab === "current"
        ? currentOrders
        : previousOrders;

  const StatusPill = ({ status }) => {
    const label =
      status === "placed"
        ? "Ordered Placed"
        : status === "processing"
          ? "Processing"
          : status === "delivered"
            ? "Delivered"
            : status === "cancelled"
              ? "Cancelled"
              : status || "Placed";
    const cls =
      status === "delivered"
        ? "text-green-700 border-green-300"
        : status === "cancelled"
          ? "text-red-700 border-red-300"
          : "text-yellow-700 border-yellow-300";
    return (
      <span className={`text-xs px-2 py-1 rounded border ${cls}`}>{label}</span>
    );
  };

  const ActionButtons = ({ order, item }) => {
    const handleViewProduct = () => {
      const productId = item?.productId || item?.id;
      if (productId) {
        navigate(`/product/${productId}`);
      }
    };

    if (activeTab === "previous") {
      return (
        <div className="flex flex-col gap-2">
          <button className="px-3 py-1 border rounded text-sm">
            Download Invoice
          </button>
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={handleViewProduct}
          >
            View order details
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {/* <button className="px-3 py-1 bg-brand-700 text-white rounded text-sm">
          Track package
        </button> */}
        <button
          className="px-3 py-1 border rounded text-sm"
          onClick={handleViewProduct}
        >
          View or Edit order
        </button>
        <button
          className="px-3 py-1 border rounded text-sm text-red-600"
          onClick={() =>
            dispatch(updateOrderStatus({ id: order.id, status: "cancelled" }))
          }
        >
          Cancel Order
        </button>
      </div>
    );
  };

  const breadcrumbItems = [{ label: "Home", link: "/" }, { label: "Orders" }];

  return (
    <>
      <div className="py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="mx-auto py-6 px-4 md:px-15 lg:px-20">
        <h2 className="text-2xl font-bold mb-4">Your Orders</h2>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 text-sm">
            <button
              className={`pb-2 ${activeTab === "orders"
                ? "border-b-2 border-brand-700 text-brand-700"
                : "text-gray-600"
                }`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
            <button
              className={`pb-2 ${activeTab === "current"
                ? "border-b-2 border-brand-700 text-brand-700"
                : "text-gray-600"
                }`}
              onClick={() => setActiveTab("current")}
            >
              Current Orders
            </button>
            <button
              className={`pb-2 ${activeTab === "previous"
                ? "border-b-2 border-brand-700 text-brand-700"
                : "text-gray-600"
                }`}
              onClick={() => setActiveTab("previous")}
            >
              Previous Orders
            </button>
          </div>
          <div>
            <input
              className="border rounded px-3 py-1 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search an order"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {data.length === 0 ? (
          <div className="text-gray-500">No orders.</div>
        ) : (
          <div className="space-y-6">
            {data.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                {/* Header row - table columns */}
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700">
                  <div className="col-span-2">Order ID</div>
                  <div className="col-span-5">Items</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Order Date</div>
                  <div className="col-span-1">Quantity</div>
                  <div className="col-span-1">Total</div>
                </div>
                {/* Body rows: one per item with actions inline to mirror screenshot */}
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-stretch gap-3 px-4 py-3 border-t text-sm"
                  >
                    <div className="col-span-2 flex items-center">
                      {order.id}
                    </div>
                    <div className="col-span-5 flex gap-4">
                      <img
                        src={it.image}
                        alt={it.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{it.title}</div>
                        <div className="text-xs text-gray-500">
                          Material: {it.material || "-"} &nbsp; Size:{" "}
                          {it.size || "-"}
                        </div>
                        <div className="text-brand-700 font-semibold">
                          ₹{it.price}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Will be delivered by - {formatDate(order.date)}, 8am -
                          10pm
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[150px] justify-center">
                        <ActionButtons order={order} item={it} />
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <StatusPill status={order.status || "placed"} />
                    </div>
                    <div className="col-span-2 flex items-center">
                      {formatDate(order.date)}
                    </div>
                    <div className="col-span-1 flex items-center">
                      {it.qty || 1}
                    </div>
                    <div className="col-span-1 flex items-center">
                      ₹{order.totals?.payable || it.price}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
