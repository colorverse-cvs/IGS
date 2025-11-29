import { FaEye } from "react-icons/fa";
import { useState } from "react";
import ShowCurrentCustomerDetail from "./ShowCurrentCustomerDetail";

function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function CustomerDetailTable({ data }) {
  const [isOpenViewCustomerDetailModal, setIsOpenViewCustomerDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  function handleShowCustomerDetailModal(customer) {
    setSelectedCustomer(customer);   // ✅ store clicked row
    setIsOpenViewCustomerDetailModal(true);
  }

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

              {/* ACTION COLUMN */}
              <td className="px-4 py-3 text-center">
                <button
                  className="hover:text-purple-600 transition flex items-center gap-2 border border-gray-100 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 cursor-pointer mx-auto"
                  onClick={() => handleShowCustomerDetailModal(customer)}   // 👈 Pass selected customer
                >
                  <FaEye /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {isOpenViewCustomerDetailModal && (
        <ShowCurrentCustomerDetail
          currentCustomerDetail={selectedCustomer}  // 👈 Pass correct customer
          onClose={() => setIsOpenViewCustomerDetailModal(false)}
        />
      )}
    </div>
  );
}
