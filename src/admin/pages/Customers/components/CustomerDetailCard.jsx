const cardsData = [
  {
    title: "Total Customers",
    value: 1299,
  },
  {
    title: "Active Customers",
    value: 1854,
  },
  {
    title: "VIP Customers",
    value: 909,
  },
  {
    title: "New This Month",
    value: 210,
  },
];

export default function CustomerDetailCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cardsData.map((card, index) => (
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
