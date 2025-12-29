import { X } from "lucide-react";
import { useState } from "react";

import Dropdown from "../../../../components/Dropdown";

const selectCategoryValue = ["Percentage", "Fixed"];
export default function EditCouponModal({ onClose }) {
  const [categoryValue, setcategoryValue] = useState("Percentage");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg !font-medium text-gray-800">
            Create New Coupon
          </p>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                placeholder="Teddy Bear - Small"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>

              <Dropdown
                className="cursor-pointer"
                options={selectCategoryValue}
                value={categoryValue}
                onChange={(val) => setcategoryValue(val)}
                placeholder="Select Status"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                placeholder="e.g:20"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                placeholder="Leave empty for unlimited"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase (₹)
              </label>
              <input
                type="number"
                placeholder="₹5"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 cursor-pointer rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-brand-700 cursor-pointer text-white rounded-lg hover:bg-brand-800">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
