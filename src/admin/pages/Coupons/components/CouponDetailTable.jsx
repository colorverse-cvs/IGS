import { useState } from "react";

import EditCouponModal from "./EditCouponModal";

const customerData = [
  {
    code: "DIWALI2025",
    type: "Percentage",
    value: "25%",
    usage: 145,
    limit: 500,
    ExpiryDate: "Nov 30, 2025",
    status: "Active"
  },
  {
    code: "WELCOME500",
    type: "Fixed",
    value: "₹500",
    usage: 89,
    limit: 1000,
    ExpiryDate: "Dec 31, 2025",
    status: "Active"
  },
  {
    code: "SUMMER2024",
    type: "Percentage",
    value: "15%",
    usage: 456,
    limit: 500,
    ExpiryDate: "Aug 31, 2024",
    status: "Expired"
  }
];

function formatHeading(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

export default function CouponDetailTable() {
    const [openEditCouponModal, setOpenEditProductModal] = useState(false);

    const headers = Object.keys(customerData[0]);

    const handleEdit = (coupon) => {
        console.log("Edit:", coupon);
    };

    const handleDelete = (coupon) => {
        console.log("Delete:", coupon);
    };

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

                {/* ✅ Action Header */}
                <th className="px-4 py-3 font-semibold text-gray-700">
                Action
                </th>
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

                {/* ✅ Action Buttons */}
                <td className="px-4 py-3 flex gap-3">
                    <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setOpenEditProductModal(true)}
                    >
                    Edit
                    </button>

                    <button
                    className="text-red-600 hover:underline font-medium"
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
            {openEditCouponModal && (
                <EditCouponModal onClose={() => setOpenEditProductModal(false)} />
            )}
        </div>
    );
}
