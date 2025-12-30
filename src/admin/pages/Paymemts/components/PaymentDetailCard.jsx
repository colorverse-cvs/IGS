// Helper to count by status
const countByStatus = (payments, status) => {
  return payments.filter(
    (p) => String(p.status).toLowerCase() === status.toLowerCase()
  ).length;
};

export default function PaymentDetailCard({ payments = [] }) {
  const total = payments.length;
  const success =
    countByStatus(payments, "success") || countByStatus(payments, "succeeded");
  const failed = countByStatus(payments, "failed");
  const refunded = countByStatus(payments, "refunded");

  const cardData = [
    {
      title: "Total Transactions",
      value: total.toLocaleString(),
      color: "text-gray-900",
    },
    {
      title: "Success",
      value: success.toLocaleString(),
      color: "text-green-600",
    },
    {
      title: "Failed",
      value: failed.toLocaleString(),
      color: "text-red-600",
    },
    {
      title: "Refunded",
      value: refunded.toLocaleString(),
      color: "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6 px-0">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">
            {card.title}
          </p>
          <p
            className={`text-lg md:text-xl !font-medium ${
              card.color || "text-gray-900"
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
