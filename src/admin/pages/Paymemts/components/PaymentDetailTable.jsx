const customerData = [
  {
    transactionID: "TXN-78945",
    orderID: "ORD-1247",
    date: "Nov 15 2024",
    amount: 5222,
    method: "UPI",
    gateway: "Razorpay",
    status: "success"
  },
  {
    transactionID: "TXN-78944",
    orderID: "ORD-1246",
    date: "Nov 15 2024",
    amount: 5222,
    method: "Debit Card",
    gateway: "Paytm",
    status: "success"
  },
  {
    transactionID: "TXN-78943",
    orderID: "ORD-1245",
    date: "Nov 15 2024",
    amount: 5222,
    method: "COD",
    gateway: "N/A",
    status: "success"
  }
];

function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function PaymentDetailTable() {
  const headers = Object.keys(customerData[0]);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((key) => (
              <th key={key} className="px-4 py-3 font-semibold text-gray-700">
                {formatHeading(key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {customerData.map((customer, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              {headers.map((key) => (
                <td key={key} className="px-4 py-3 text-gray-600">
                  {customer[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
