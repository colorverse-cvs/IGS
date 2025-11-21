const paymentCardData = [
  {
    title: "Total Transactions",
    value: 1299,
  },
  {
    title: "Successful",
    value: 1854,
  },
  {
    title: "Failed",
    value: 909,
  },
  {
    title: "Refunded",
    value: 210,
  },
];

export default function PaymentDetailCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {paymentCardData.map((card, index) => (
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
