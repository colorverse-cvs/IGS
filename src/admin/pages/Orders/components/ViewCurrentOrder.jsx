import jsPDF from "jspdf";
import { APP_URL } from "../../../../constant";

const formatOrderId = (id) => {
  if (!id) return "";
  return `ORD-${id.slice(-5).toUpperCase()}`;
};

export default function ViewCurrentOrder({ currentOrder, onClose }) {
  if (!currentOrder) return null;
  // console.log("currentOrder", currentOrder);

  // Use fullId for internal processing/PDFs but falling back to id if fullId is not set
  const orderId = currentOrder.fullId || currentOrder.id;

  const downloadInvoicePDF = (order) => {
    const doc = new jsPDF();


    doc.setFontSize(16);
    doc.text(
      "Ishita Gallery shop Order Invoice",
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(11);
    doc.text(`Order ID: ${orderId}`, 14, 35);
    doc.text(`Status: ${order.status}`, 14, 42);
    doc.text(`Customer: ${order.customer}`, 14, 49);
    doc.text(`Mobile: ${order.mobileNumber}`, 14, 56);
    doc.text(`Date: ${order.date}`, 14, 63);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, 70);

    doc.text("Items:", 14, 82);
    doc.text(order.items, 14, 90, { maxWidth: 180 });

    doc.text(`Amount: ₹${order.amount}`, 14, 115);
    doc.text(`Address: ${order.address}`, 14, 125, { maxWidth: 180 });

    // for download
    // doc.save(`order-${orderId}.pdf`);

    //for print instead download
    doc.autoPrint();
    window.open(doc.output("bloburl"));

  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 cursor-default">
          <p className="text-lg font-semibold">
            Order Details - {formatOrderId(currentOrder.id)}
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
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
            {currentOrder.rawItems && Array.isArray(currentOrder.rawItems) ? (
              currentOrder.rawItems.map((item, index) => {
                const product = item.product;
                return (
                  <div key={index} className="flex gap-3 items-start border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    {product && product.images?.[0]?.url ? (
                      <img
                        src={`${APP_URL}${product.images[0].url}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                        N/A
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {product ? (
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                      ) : (
                        <p className="font-medium text-gray-500">
                          {item.name || "Unknown Item"}{" "}
                          <span className="text-xs">
                            (Product no longer available)
                          </span>
                        </p>
                      )}
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: ₹{item.price}</span>
                        {product && (
                          <>
                            {product.attributes?.material && <span>Mat: {product.attributes.material}</span>}
                            {product.dimensions?.sizeCategory && <span>Size: {product.dimensions.sizeCategory}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              currentOrder.items
            )}
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
              <span>{currentOrder.amount}</span>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-4">
          <button className="flex-1 border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => downloadInvoicePDF(currentOrder)}>
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
