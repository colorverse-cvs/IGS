import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPaymentsAsync, selectAdminPayments } from "../../store/adminSlice";
import PaymentDetailCard from "./components/PaymentDetailCard";
import PaymentDetailTable from "./components/PaymentDetailTable";
import Dropdown from "../../../components/Dropdown";

const PaymentCategory = [
  "All Gateway",
  "Paytm",
  "Razorpay",
  "PhonePe"
];

const paymentStatus = [
  "All Status",
  "Success",
  "Pending",
  "Failed",
  "Refunded"
];

export default function Payments() {
  const dispatch = useDispatch();
  const payments = useSelector(selectAdminPayments);
  const hasFetched = useRef(false);

  const [categoryValue, setCategoryValue] = useState("All Gateway");
  const [statusValue, setStatusValue] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAllPaymentsAsync());
  }, [dispatch]);

  const filteredPayments = useMemo(() => {
    // Map API data to UI structure
    // Assuming API structure. Adjust property accessors based on actual API response.
    // Fallback values provided to prevent crashes.
    const mappedData = (payments || []).map(payment => ({
      transactionID: payment.razorpayPaymentId || payment.transactionID || payment._id || "N/A",
      orderID: payment.razorpayOrderId || payment.orderID || "N/A",
      date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A",
      amount: payment.amount ? (payment.amount / 100) : 0, // Assuming amount is in paise like orders
      method: payment.method || "N/A",
      gateway: "Razorpay", // Default or extract from payment.id prefix
      status: payment.status || "Pending" // e.g. "captured", "failed"
    }));

    let data = mappedData;

    // Gateway filter
    if (categoryValue !== "All Gateway") {
      data = data.filter(payment => payment.gateway === categoryValue);
    }

    // Status filter
    if (statusValue !== "All Status") {
      data = data.filter(payment =>
        String(payment.status).toLowerCase() === String(statusValue).toLowerCase()
      );
    }

    // Search filter (Transaction ID OR Order ID)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      data = data.filter(payment =>
        String(payment.transactionID).toLowerCase().includes(search) ||
        String(payment.orderID).toLowerCase().includes(search)
      );
    }

    return data;
  }, [categoryValue, statusValue, searchTerm, payments]);

  return (
    <>
      <div className="product-label-top-wrapper flex items-center justify-between mb-4 p-4">
        <div>
          <p className="text-xl font-semibold">Payments & Transactions</p>
          <p className="text-md text-gray-600">
            Track all payment transactions
          </p>
        </div>

        <button className="bg-brand-700 px-5 py-2 text-white rounded-lg">
          Export Transactions
        </button>
      </div>

      <PaymentDetailCard />

      <div className="space-y-6 bg-white p-4 rounded-md">
        <div className="flex justify-between gap-4">

          {/* SEARCH */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID"
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* GATEWAY */}
          <Dropdown
            className="w-[220px] cursor-pointer"
            options={PaymentCategory}
            value={categoryValue}
            onChange={(val) => setCategoryValue(val || "All Gateway")}
            placeholder="Select Payment Gateway"
          />

          {/* STATUS */}
          <Dropdown
            className="w-[200px] cursor-pointer"
            options={paymentStatus}
            value={statusValue}
            onChange={(val) => setStatusValue(val || "All Status")}
            placeholder="Select Payment Status"
          />
        </div>

        <PaymentDetailTable data={filteredPayments} />
      </div>
    </>
  );
}
