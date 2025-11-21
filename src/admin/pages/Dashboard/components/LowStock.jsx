const lowStockDetails = [
  {
    id: "1",
    label : "Teddy Bear (Small)",
    leftItemCount : "Only 2 left"
  },
  {
    id: "2",
    label : "Greeting Cards - Birthday",
    leftItemCount : "Only 8 left"
  },
   {
    id: "3",
    label : "Gift Wrapping Paper",
    leftItemCount : "Only 4 left"
  }
];

export default function LowStockCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm">Low stock alert</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {lowStockDetails.map((order) => (
          <div
            key={order.id}
            className=""
          >
            <div className="space-y-1 p-2 bg-red-100 border rounded-xl border-red-300">
                <p className="text-sm text-gray-700">{order.label}</p>
                <p className="text-xs text-red-500">{order.leftItemCount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
