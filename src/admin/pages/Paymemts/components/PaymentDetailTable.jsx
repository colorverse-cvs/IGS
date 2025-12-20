import { useNavigate } from "react-router-dom";

export default function PaymentDetailTable({ data }) {
  const navigate = useNavigate();
  console.log("data ", data);
  if (!data?.length) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
        <p className="text-gray-500">No transactions found matching your criteria.</p>
      </div>
    );
  }

  // format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // get status badge styles
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    let classes = "bg-gray-100 text-gray-600";

    if (s === 'success' || s === 'succeeded') classes = "bg-green-100 text-green-700";
    else if (s === 'pending') classes = "bg-orange-100 text-orange-700";
    else if (s === 'failed') classes = "bg-red-100 text-red-700";
    else if (s === 'refunded') classes = "bg-gray-100 text-gray-700";

    // standardize display text
    const label = s === 'succeeded' ? 'Success' :
      s.charAt(0).toUpperCase() + s.slice(1);

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  // get method badge styles
  const getMethodBadge = (method) => {
    const m = String(method).toLowerCase();
    let classes = "bg-gray-100 text-gray-600";
    let label = method;

    if (m.includes('upi')) {
      classes = "bg-blue-100 text-blue-700";
      label = "UPI";
    } else if (m.includes('credit')) {
      classes = "bg-purple-100 text-purple-700";
      label = "Credit Card";
    } else if (m.includes('debit')) {
      classes = "bg-cyan-100 text-cyan-700";
      label = "Debit Card";
    } else if (m.includes('net')) {
      classes = "bg-teal-100 text-teal-700";
      label = "Net Banking";
    } else if (m === 'card') {
      classes = "bg-purple-100 text-purple-700";
      label = "Card";
    }

    return (
      <span className={`px-3 py-1 rounded-md text-xs font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  const getDisplayId = (id) => {
    if (!id) return "";
    return `IGS-${id.slice(-5)}`;
  };

  const getDisplayOrderId = (id) => {
    if (!id) return "";
    return `ORD-${id.slice(-5)}`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-white border-b">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-900">Transaction ID</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Order ID</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Amount</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Method</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Gateway</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {data.map((payment, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-700">
                {getDisplayId(payment.transactionID)}
              </td>
              <td className="px-6 py-4">
                <span className="text-purple-600 font-medium cursor-pointer hover:underline">
                  {getDisplayOrderId(payment.orderID)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {payment.date}
              </td>
              <td className="px-6 py-4 font-semibold text-gray-900">
                {formatCurrency(payment.amount)}
              </td>
              <td className="px-6 py-4">
                {getMethodBadge(payment.method)}
              </td>
              <td className="px-6 py-4 text-gray-500">
                {payment.gateway ? payment.gateway : "RazorPay"}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(payment.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
