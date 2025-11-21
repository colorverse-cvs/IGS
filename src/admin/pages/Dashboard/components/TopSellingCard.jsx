const lowStockDetails = [
  {
    id: "1",
    label : "Photo Frame",
    itemSoldCount : "45 sold"
  },
  {
    id: "2",
    label : "Teddy Bear",
    itemSoldCount : "35 sold"
  },
   {
    id: "3",
    label : "Customized Mug",
    itemSoldCount : "20 sold"
  }
];

export default function TopSellingCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm">Top 3 Selling Items</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {lowStockDetails.map((order) => (
          <div
            key={order.id}
            className=""
          >
            <div className="space-y-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-sm bg-purple-500 text-white p-2 px-4 rounded-full">{order.id}</p>
                    <p className="text-sm text-gray-700">{order.label}</p>
                </div>
                <p className="text-xs text-gray-500">{order.itemSoldCount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
