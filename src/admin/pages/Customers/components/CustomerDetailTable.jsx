import { FaRegEye } from "react-icons/fa";
import { useState } from "react";
import ShowCurrentCustomerDetail from "./ShowCurrentCustomerDetail";

export default function CustomerDetailTable({ data = [] }) {
  const [isOpenViewCustomerDetailModal, setIsOpenViewCustomerDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  function handleShowCustomerDetailModal(customer) {
    setSelectedCustomer(customer);
    setIsOpenViewCustomerDetailModal(true);
  }

  const getStatusBadge = (status) => {
    const value = String(status || 'active').toLowerCase();

    switch (value) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Active
          </span>
        );

      case 'inactive':
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            Inactive
          </span>
        );

      case 'vip':
        return (
          <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
            VIP
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Active
          </span>
        );
    }
  };


  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
        No customers found
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700">Customer Name</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Email Address</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Mobile</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Orders</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Total Spent</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Join Date</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.map((customer, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-gray-900 font-medium">
                {customer.customerName}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {customer.emailId}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {customer.mobile}
              </td>
              <td className="px-6 py-4 text-gray-600 text-center">
                {customer.totalOrders}
              </td>
              <td className="px-6 py-4 text-gray-600 font-medium">
                ₹{(customer.totalSpent || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {customer.joinDate}
              </td>
              <td className="px-6 py-4 text-center">
                {getStatusBadge(customer.Status)}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  className="hover:text-purple-600 transition flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-purple-600 border border-purple-600 hover:bg-purple-50 cursor-pointer mx-auto"
                  onClick={() => handleShowCustomerDetailModal(customer)}   // 👈 Pass selected customer
                >
                  <FaRegEye className="w-3 h-3" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {isOpenViewCustomerDetailModal && (
        <ShowCurrentCustomerDetail
          currentCustomerDetail={selectedCustomer}
          onClose={() => setIsOpenViewCustomerDetailModal(false)}
        />
      )}
    </div>
  );
}
