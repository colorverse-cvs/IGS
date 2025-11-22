
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
  },
];

export default function RecentOrderCard({setActivePage}) {

  const handleViewAllClick = () => {
     setActivePage("Orders");
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Recent Orders</p>
        <button className="text-purple-600 font-medium hover:underline cursor-pointer"
                onClick={handleViewAllClick}>
          View All
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
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
              <p className="text-xs text-gray-500">{order.items}</p>
            </div>

            <div className="text-right space-y-2">
              <p className="font-semibold">{order.amount}</p>
              <button className="flex items-center gap-2 border border-gray-100 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
