const lowStockDetails = [
  {
    id: "1",
    label: "Photo Frame",
    itemSoldCount: "45 sold"
  },
  {
    id: "2",
    label: "Teddy Bear",
    itemSoldCount: "35 sold"
  },
  {
    id: "3",
    label: "Customized Mug",
    itemSoldCount: "20 sold"
  }
];

export default function TopSellingCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6 md:p-4 lg:p-6 md:max-h-[230px] lg:max-h-[230px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold">Top 3 Selling Items</p>
      </div>

      <div className="space-y-4">
        {lowStockDetails.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-500 text-white font-semibold text-sm">
                {item.id}
              </div>

              <p className="text-sm text-gray-700">{item.label}</p>
            </div>

            <p className="text-xs text-gray-500">{item.itemSoldCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
