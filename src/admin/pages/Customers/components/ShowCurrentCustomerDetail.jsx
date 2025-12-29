export default function ShowCurrentCustomerDetail({
  currentCustomerDetail,
  onClose,
}) {
  if (!currentCustomerDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 cursor-default">
          <p className="text-lg font-semibold">Customer Details</p>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-6 cursor-default">
          <p className="font-semibold mb-2">Personal Information</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">
                {currentCustomerDetail.customerName}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">
                {currentCustomerDetail.emailId}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="font-medium">
                {currentCustomerDetail.mobile}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Customer Since:</span>
              <span className="font-medium">
                {currentCustomerDetail.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER STATISTICS */}
        <div className="mb-8 cursor-default">
          <p className="font-semibold mb-2">Order Statistics</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total Orders:</span>
              <span className="font-medium">
                {currentCustomerDetail.totalOrders}
              </span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Total Spent:</span>
              <span>
                ₹{(currentCustomerDetail.totalSpent || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Status:</span>
              <span>{currentCustomerDetail.Status}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-brand-700 text-white rounded-lg px-4 py-2 hover:bg-brand-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
