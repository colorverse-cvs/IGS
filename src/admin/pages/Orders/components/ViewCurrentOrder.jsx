export default function ViewCurrentOrder({ currentOrder, onClose }) {
  if (!currentOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 cursor-default">
          <p className="text-lg font-semibold">
            Order Details - {currentOrder.id}
          </p>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* STATUS BADGES */}
        <div className="flex gap-3 mb-6 cursor-default">
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600">
            {currentOrder.status}
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-600">
            {currentOrder.paymentMethod}
          </span>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="mb-6 cursor-default">
          <p className="font-semibold mb-2">Customer Details</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">{currentOrder.customer}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="font-medium">{currentOrder.mobileNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Address:</span>
              <span className="font-medium text-right">
                {currentOrder.address}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div className="mb-6 cursor-default">
          <p className="font-semibold mb-2">Order Items</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            {currentOrder.items}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="mb-8 cursor-default">
          <p className="font-semibold mb-2">Order Summary</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-medium">{currentOrder.date}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>₹{currentOrder.amount}</span>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-4">
          <button className="flex-1 border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
            🖨 Print Invoice
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-purple-700 text-white rounded-lg px-4 py-2 hover:bg-purple-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
