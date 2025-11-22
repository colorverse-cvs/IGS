import { FaEye } from "react-icons/fa";

function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function CustomerDetailTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-6">
        No customers found
      </p>
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
             <th className="px-4 py-3 font-semibold text-gray-700 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((customer, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              {headers.map((key) => (
                <td key={key} className="px-4 py-3 text-gray-600">
                  {customer[key]}
                </td>
              ))}

              {/* ✅ Actions Column */}
              <td className="px-4 py-3">
                  <button className="hover:text-purple-600 transition flex items-center gap-2 border border-gray-100 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 cursor-pointer">
                    <FaEye /> view
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
