const couponCardData = [
  {
    title: "Total Coupons",
    value: 32,
  },
  {
    title: "Active Coupons",
    value: 14,
  },
  {
    title: "Total Usage",
    value: 9,
  },
  {
    title: "Discount Given",
    value: "12456",
  },
];

export default function CouponDetailCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {couponCardData.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-start"
        >
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {card.title}
            </p>
            <p className="text-md text-gray-900 mt-2">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
