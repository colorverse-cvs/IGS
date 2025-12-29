import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersAsync,
  selectAdminOrders,
} from "../../../store/adminSlice";
import { FaRegEye } from "react-icons/fa";
import ViewCurrentOrder from "../../Orders/components/ViewCurrentOrder";

export default function RecentOrderCard({ setActivePage }) {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);

  const [isOpenViewOrderModal, setIsOpenViewOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrdersAsync());
  }, [dispatch]);

  const handleViewAllClick = () => {
    setActivePage("Orders");
  };

  const handleOpenViewOrderModal = (order) => {
    // Prepare data for the modal (ViewCurrentOrder expects specific fields)
    const modalData = {
      ...order,
      // Ensure amount is formatted for modal (ViewCurrentOrder adds ₹ prefix)
      amount: order.rawAmount,
    };
    setSelectedOrder(modalData);
    setIsOpenViewOrderModal(true);
  };

  const handleCloseViewOrderModal = () => {
    setIsOpenViewOrderModal(false);
    setSelectedOrder(null);
  };

  const recentOrders = useMemo(() => {
    if (!orders) return [];

    // Taking first 4
    return orders.slice(0, 4).map((order) => {
      const user = order.user || {};
      const profile = user.profile || {};
      const items = order.items || [];

      const amountValue = items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      const itemsSummary = items
        .map((item) => `${item.product?.name || "Item"} (x${item.quantity})`)
        .join(", ");

      const getStatusColor = (status) => {
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
      };

      // Address formatting
      const address = order.shippingAddress
        ? `${order.shippingAddress.line1 || ""}, ${
            order.shippingAddress.line2 || ""
          }, ${order.shippingAddress.city || ""}, ${
            order.shippingAddress.state || ""
          } - ${order.shippingAddress.pincode || ""}`
        : "Address details not available";

      return {
        id: order._id ? order._id : "ORD-N/A", // Consistent ID display
        fullId: order._id || "N/A", // Keep full ID for modal/invoice
        status: order.status || "Pending",
        statusColor: getStatusColor(order.status),
        customer:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email ||
          "Guest",
        mobileNumber: profile.mobile || user.mobile || "N/A",
        items: itemsSummary || "No items",
        amount: `₹${amountValue.toLocaleString()}`, // Display with symbol in card
        rawAmount: amountValue.toLocaleString(), // Raw for modal (it adds symbol)
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
        paymentMethod: order.paymentMethod || "N/A",
        address: address,
        // Pass original items array if ViewCurrentOrder needs to re-render them specifically
        // But ViewCurrentOrder seems to take `currentOrder.items` which is expected to be a string or summary in previous usage?
        // Let's re-check ViewCurrentOrder.
        // It renders {currentOrder.items} inside a div.
        // If it expects JSX it would be different.
        // In Orders.jsx, items was a string summary. I'll stick to itemsSummary string.
      };
    });
  }, [orders]);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 md:p-5 md:max-h-[500px] overflow-y-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">Recent Orders</p>
          <button
            className="text-brand-600 font-medium hover:underline cursor-pointer text-sm"
            onClick={handleViewAllClick}
          >
            View All
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-3 md:space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          ) : (
            recentOrders.map((order, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-lg p-4 bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {" "}
                      {`ORD-${order.id.slice(-5)}`}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-700 font-medium pt-1">
                    {order.customer}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {order.items}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm">{order.amount}</p>
                  <button
                    className="flex items-center gap-1 text-brand-600 border border-brand-600 px-3 py-1.5 rounded-md text-xs hover:bg-brand-50 cursor-pointer"
                    onClick={() => handleOpenViewOrderModal(order)}
                  >
                    <FaRegEye className="w-3 h-3" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Order Modal */}
        {isOpenViewOrderModal && selectedOrder && (
          <ViewCurrentOrder
            currentOrder={selectedOrder}
            onClose={handleCloseViewOrderModal}
          />
        )}
      </div>
    </>
  );
}
