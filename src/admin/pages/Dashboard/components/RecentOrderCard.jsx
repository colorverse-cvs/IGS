
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

export default function RecentOrderCard({setActivePage}) {

  const handleViewAllClick = () => {
     setActivePage("Orders");
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 md:max-h-[550px] overflow-auto">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
