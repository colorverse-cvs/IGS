const paymentCardData = [
  {
    title: "Total",
    value: 1847,
  },
  {
    title: "Success",
    value: 1703,
    color: "text-green-600",
  },
  {
    title: "Failed",
    value: 89,
    color: "text-red-600",
  },
  {
    title: "Refunded",
    value: 55,
  },
];

export default function PaymentDetailCard() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6 px-0">
      {paymentCardData.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">
            {card.title}
          </p>
          <p className={`text-lg md:text-xl font-semibold ${card.color || "text-gray-900"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
