const orders = [
  {
    id: "ORD-1247",
    status: "Pending",
    statusColor: "bg-orange-100 text-orange-600",
    customer: "Priya Sharma",
    items: "Teddy Bear, Greeting Card",
    amount: "₹850",
  },
  {
    id: "ORD-1246",
    status: "Packed",
    statusColor: "bg-blue-100 text-blue-600",
    customer: "Arjun Patel",
    items: "Photo Frame",
    amount: "₹450",
  },
  {
    id: "ORD-1245",
    status: "Shipped",
    statusColor: "bg-green-100 text-green-600",
    customer: "Ananya Reddy",
    items: "Gift Hamper",
    amount: "₹1,200",
  },
  {
    id: "ORD-1244",
    status: "Shipped",
    statusColor: "bg-green-100 text-green-600",
    customer: "Ananya Reddy",
    items: "Gift Hamper",
    amount: "₹1,200",
  }
];

import { FaRegEye } from "react-icons/fa";

export default function RecentOrderCard({ setActivePage }) {
  const handleViewAllClick = () => {
    setActivePage("Orders");
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow p-4 md:p-5 md:max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Recent Orders</p>
        <button
          className="text-purple-600 border border-purple-600 hover:bg-purple-50 font-medium hover:underline cursor-pointer text-sm"
          onClick={handleViewAllClick}
        >
          View All
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3 md:space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-100 rounded-lg p-4 bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{order.id}</span>
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
              <p className="text-xs text-gray-500">{order.items}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm">{order.amount}</p>
              <button className="flex items-center gap-1 text-purple-600 border border-purple-600 px-3 py-1.5 rounded-md text-xs hover:bg-purple-50">
                <FaRegEye className="w-3 h-3" /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
