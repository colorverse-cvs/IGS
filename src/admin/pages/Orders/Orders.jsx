import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersAsync,
  selectAdminOrders,
  selectAdminLoading,
} from "../../store/adminSlice";
import { FaRegEye } from "react-icons/fa";
import { AiFillPrinter } from "react-icons/ai";

import Dropdown from "../../../components/Dropdown";
import ViewCurrentOrder from "./components/ViewCurrentOrder";
import { api } from "../../../utils/api";
import toast from "react-hot-toast";

const orderStatusValue = [
  "All Orders",
  "Pending",
  "Placed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

// Status options for updating orders (without "All Orders")
// API expects lowercase values: pending, placed, shipped, delivered, cancelled, returned
const statusUpdateOptions = [
  { label: "Pending", value: "pending" },
  { label: "Placed", value: "placed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
];

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);
  const loading = useSelector(selectAdminLoading);
  const hasFetched = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Orders");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOpenViewOrderModal, setIsOpenViewOrderModal] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAllOrdersAsync());
  }, [dispatch]);

  // Transform and filter orders
  useEffect(() => {
    if (!orders) return;

    const timer = setTimeout(() => {
      // Map API data to UI format
      const mappedOrders = orders.map((order) => {
        const user = order.user || {};
        const profile = user.profile || {};
        const items = order.items || [];

        // Calculate items summary
        const itemsSummary = items
          .map(
            (item) =>
              `${item.product?.name || "Unknown Product"} (x${item.quantity})`
          )
          .join(", ");

        const amountValue = order.total || 0;

        return {
          ...order,
          id: order._id || "N/A",
          customer:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email ||
            "Guest",
          mobileNumber: profile.mobile || user.mobile || "N/A",
          items: itemsSummary || "No items",
          amount: `₹${amountValue}`,
          date: new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status: order.status || "Pending",
          statusColor: getStatusColor(order.status),
          // Format shipping address from API
          address: order.shippingAddress
            ? `${order.shippingAddress.line1 || ""}${
                order.shippingAddress.line2
                  ? ", " + order.shippingAddress.line2
                  : ""
              }, ${order.shippingAddress.city || ""}, ${
                order.shippingAddress.state || ""
              } - ${order.shippingAddress.postalCode || ""}, ${
                order.shippingAddress.country || ""
              }`
            : "Address not available",
          rawItems: items,
          shippingAddress: order.shippingAddress || null,
        };
      });

      let result = mappedOrders.filter((order) => {
        const textMatch =
          String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(order.customer)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(order.items).toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch =
          statusFilter === "All Orders"
            ? true
            : String(order.status).toLowerCase() === statusFilter.toLowerCase(); // Exact match might be safer for status

        return textMatch && statusMatch;
      });

      setFilteredOrders(result);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, orders]);

  function getStatusColor(status) {
    switch (String(status).toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-600";
      case "placed":
        return "bg-blue-100 text-blue-600";
      case "packed":
        return "bg-blue-100 text-blue-600";
      case "shipped":
        return "bg-indigo-100 text-indigo-600";
      case "delivered":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      case "returned":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /**
   * Get allowed status transitions based on current status
   * Status flow: pending -> placed -> shipped -> delivered
   * Cancelled and Returned are terminal states
   */
  function getAllowedStatusOptions(currentStatus) {
    const statusLower = String(currentStatus).toLowerCase();

    // Define which statuses can transition to which
    const allowedTransitions = {
      pending: [
        "pending",
        "placed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      placed: ["placed", "shipped", "delivered", "cancelled", "returned"],
      shipped: ["shipped", "delivered", "returned"],
      delivered: ["delivered", "returned"],
      cancelled: ["cancelled"], // Terminal state
      returned: ["returned"], // Terminal state
    };

    const allowed = allowedTransitions[statusLower] || [];

    return statusUpdateOptions.map((option) => ({
      ...option,
      disabled: !allowed.includes(option.value),
    }));
  }

  async function handleStatusUpdate(orderId, newStatus) {
    // Find the current order to check its status
    const currentOrder = filteredOrders.find((order) => order._id === orderId);

    // Prevent API call if status is the same
    if (
      currentOrder &&
      currentOrder.status.toLowerCase() === newStatus.toLowerCase()
    ) {
      toast.error(`Cannot change status from ${newStatus} to ${newStatus}`);
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      // Call PATCH API to update order status
      await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: newStatus,
        reason: "", // Optional reason field
      });

      // Update local state to reflect the change
      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
                statusColor: getStatusColor(newStatus),
              }
            : order
        )
      );

      // Also update the original orders in Redux if needed
      dispatch(fetchAllOrdersAsync());

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function handleOpenViewOrderModal(order) {
    setSelectedOrder(order);
    setIsOpenViewOrderModal(true);
  }

  return (
    <>
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:flex dashboard-label-wrapper mb-6 px-3 items-center justify-between">
        <div>
          <p className="text-xl">Orders</p>
          <p className="text-md">Manage customer orders</p>
        </div>
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-lg">
        {/* SEARCH + FILTER */}
        <div className="search-bar-wrapper flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 w-[">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <Dropdown
            className="w-full md:w-[180px]"
            options={orderStatusValue}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "All Orders")}
            placeholder="Select Status"
          />
        </div>

        {/* ORDER LIST */}
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-gray-500 text-center">
              Loading orders...
            </p>
          )}

          {!loading && filteredOrders.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No orders found</p>
          )}

          {!loading &&
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm"
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="!font-medium text-sm">{`ORD-${order.id.slice(
                        -5
                      )}`}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 font-medium pt-1">
                      {order.customer}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.mobileNumber}
                    </p>
                    <p className="text-xs text-gray-500">{order.items}</p>
                  </div>

                  {/* AMOUNT + DATE */}
                  <div className="text-right">
                    <p className="!font-medium text-sm">{order.amount}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>

                {/* UPDATE STATUS DROPDOWN */}
                <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  {/* STATUS DROPDOWN */}
                  <div className="flex flex-col">
                    <label className="block text-xs text-gray-600 mb-2">
                      Update Status
                    </label>
                    <Dropdown
                      className="w-full sm:w-48 md:max-w-[200px]"
                      options={getAllowedStatusOptions(order.status)}
                      value={order.status}
                      onChange={(newStatus) =>
                        handleStatusUpdate(order._id, newStatus)
                      }
                      placeholder="Select Status"
                      disabled={updatingOrderId === order._id}
                    />
                    {updatingOrderId === order._id && (
                      <p className="text-xs text-gray-500 mt-1">Updating...</p>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      className="flex items-center justify-center gap-2 text-brand-600 border border-brand-600 hover:bg-brand-50 px-3 py-2 rounded-md text-sm"
                      onClick={() => handleOpenViewOrderModal(order)}
                    >
                      <FaRegEye className="w-3 h-3" /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {isOpenViewOrderModal && selectedOrder && (
          <ViewCurrentOrder
            currentOrder={selectedOrder}
            onClose={() => setIsOpenViewOrderModal(false)}
          />
        )}
      </div>
    </>
  );
}
