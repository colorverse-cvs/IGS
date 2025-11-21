const customerData = [
  {
    customerName: "Akash Jadhav",
    emailId: "mahitNahi@gmail.com",
    mobile: "9874562140",
    totalOrders: 9,
    totalSpent: 12000,
    Status: "Active",
    joinDate: "Jan 2024"
  },
  {
    customerName: "Tusha Jadhav",
    emailId: "mahitNahi@gmail.com",
    mobile: "9874562140",
    totalOrders: 9,
    totalSpent: 12000,
    Status: "VIP",
    joinDate: "Jan 2024"
  },
  {
    customerName: "Suraj Jadhav",
    emailId: "mahitNahi@gmail.com",
    mobile: "9874562140",
    totalOrders: 19,
    totalSpent: 12000,
    Status: "Inactive",
    joinDate: "Feb 2024"
  }
];

function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function CustomerDetailTable() {
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
