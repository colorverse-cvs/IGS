function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function PaymentDetailTable({ data }) {

  if (!data.length) {
    return (
      <div className="text-center py-6 text-gray-500">
        No transactions found.
      </div>
    );
  }

  const headers = Object.keys(data[0]);

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
          {data.map((payment, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              {headers.map((key) => (
                <td key={key} className="px-4 py-3 text-gray-600">
                  {payment[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
