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

const orderStatusValue = [
  "All Orders",
  "Pending",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
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

        // Amount: Access total directly. If it seems to be in paise (e.g. > 100x expected), divide by 100.
        // Based on the provided JSON: price=2000, total=200000. So total is in paise.
        // const amountValue = order.total ? order.total / 100 : 0;
        // Always calculate total with discount applied from items
        // Don't use order.total as it doesn't include discount calculations
        const amountValue = items.reduce((sum, item) => {
          const product = item.product || {};
          const basePrice = item.price || 0;
          const discount = product.discount || 0;
          const quantity = item.quantity || 0;

          // Apply discount: finalPrice = basePrice - (basePrice * discount / 100)
          const discountedPrice = basePrice - (basePrice * discount / 100);
          return sum + (discountedPrice * quantity);
        }, 0);

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
          // Address might be missing in some API responses dependent on backend implementation of snapshotting
          address: "Address details not available in summary",
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
      case "packed":
        return "bg-blue-100 text-blue-600";
      case "shipped":
        return "bg-indigo-100 text-indigo-600";
      case "delivered":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
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
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      <span className="font-semibold text-sm">{`ORD-${order.id.slice(-5)}`}</span>
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
                    <p className="font-semibold text-sm">{order.amount}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS - STACKED ON MOBILE */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    className="flex items-center justify-center gap-2 border border-gray-100 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                    onClick={() => handleOpenViewOrderModal(order)}
                  >
                    <FaRegEye /> View
                  </button>

                  {/* <button className="flex items-center justify-center gap-2 border border-gray-100 px-3 py-2 rounded-md text-sm hover:bg-gray-50">
                    <AiFillPrinter /> Print
                  </button> */}
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
