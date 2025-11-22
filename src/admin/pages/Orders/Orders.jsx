import { useState, useEffect } from "react";

import Dropdown from "../../../components/Dropdown";

const orders = [
  {
    id: "ORD-1247",
    status: "Pending Paid",
    statusColor: "bg-orange-100 text-orange-600",
    customer: "Priya Sharma",
    mobileNumber: "+91 98765 43210",
    items: "Teddy Bear(small), Greeting Card",
    amount: "₹850",
    date: "Nov 18, 2025",
  },
  {
    id: "ORD-1246",
    status: "Packed",
    statusColor: "bg-blue-100 text-blue-600",
    customer: "Arjun Patel",
    mobileNumber: "+91 98765 43210",
    items: "Photo Frame",
    amount: "₹450",
    date: "Nov 18, 2025",
  },
];

const orderStatusValue = [
  "All Orders",
  "Pending",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled"
]

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Orders");
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    const timer = setTimeout(() => {
      let result = orders.filter((order) => {
        const textMatch =
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch =
          statusFilter === "All Orders"
            ? true
            : order.status.toLowerCase().includes(statusFilter.toLowerCase());

        return textMatch && statusMatch;
      });

      setFilteredOrders(result);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  return (
    <>
      <div className="dashboard-label-wrapper mb-6 px-3">
        <p className="text-xl">Orders</p>
        <p className="text-md">Manage customer orders</p>
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
        <div className="search-bar-wrapper flex justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <div>
              <Dropdown
                className="md: w-[140px] cursor-pointer"
                options={orderStatusValue}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val || "All Orders")}
                placeholder="Select Status"
              />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No orders found</p>
          )}

          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-lg p-4 flex justify-between items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{order.id}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{order.customer}</p>
                <p className="text-sm text-gray-700">
                  {order.mobileNumber}
                </p>
                <p className="text-xs text-gray-500">{order.items}</p>
              </div>

              <div className="text-right space-y-2">
                <p className="font-semibold">{order.amount}</p>
                <p className="font-semibold">{order.date}</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 border border-gray-100 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
                    View
                  </button>
                  <button className="text-sm hover:underline">Print</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
