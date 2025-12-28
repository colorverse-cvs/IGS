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

  // 1. Base mapped data
  const mappedPayments = useMemo(() => {
    if (!payments) return [];

    return payments.map(payment => {
      // const details = payment.paymentDetails || {};
      return {
        transactionID: payment._id || "N/A",
        orderID: payment.order || "N/A",
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
          year: 'numeric', month: 'short', day: 'numeric'
        }) : "N/A",
        amount: payment.amount || 0,
        method: payment.paymentMethod || "N/A",
        gateway: "Razorpay",
        status: payment.status === "succeeded" ? "Success" : (payment.status || "Pending")
      };
    });
  }, [payments]);

  // 2. Data for Stats Cards (Filtered by Gateway & Status only)
  const statsPayments = useMemo(() => {
    let data = mappedPayments;

    // Gateway filter
    if (categoryValue !== "All Gateway") {
      data = data.filter(payment =>
        String(payment.gateway).toLowerCase() === String(categoryValue).toLowerCase()
      );
    }

    // Status filter
    if (statusValue !== "All Status") {
      data = data.filter(payment => {
        const paymentStatus = String(payment.status).toLowerCase();
        const filterStatus = String(statusValue).toLowerCase();

        // Handle "succeeded" vs "success" alias if not already normalized (double check)
        if (filterStatus === "success" && (paymentStatus === "succeeded" || paymentStatus === "success")) {
          return true;
        }

        return paymentStatus === filterStatus;
      });
    }
    return data;
  }, [categoryValue, statusValue, mappedPayments]);

  // 3. Data for Table (Stats Data + Search Filter)
  const filteredPayments = useMemo(() => {
    let data = statsPayments;

    // Search filter (Transaction ID OR Order ID)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      data = data.filter(payment =>
        String(payment.transactionID).toLowerCase().includes(search) ||
        String(payment.orderID).toLowerCase().includes(search)
      );
    }

    return data;
  }, [statsPayments, searchTerm]);

  return (
    <>
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:flex product-label-top-wrapper items-center justify-between mb-4 p-4 gap-3">
        <div>
          <p className="text-xl font-semibold">Payments & Transactions</p>
          <p className="text-md text-gray-600">
            Track all payment transactions
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-brand-700 px-5 py-2 text-white rounded-lg cursor-pointer">
            Export Transactions
          </button>
        </div>
      </div>

      {/* Mobile Export Button */}
      <div className="md:hidden mb-4 space-y-3">
        <div className="flex gap-3">
          <button className="flex-1 bg-brand-700 px-5 py-3 text-white rounded-lg flex items-center justify-center gap-2 font-medium cursor-pointer">
            <span>📥</span> Export
          </button>
        </div>
      </div>

      <PaymentDetailCard payments={mappedPayments} />

      <div className="space-y-6 bg-white p-4 rounded-lg">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* SEARCH */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID"
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <div className="flex justify-around gap-2 ">

            {/* GATEWAY */}
            <Dropdown
              className="w-full md:w-[220px] cursor-pointer"
              options={PaymentCategory}
              value={categoryValue}
              onChange={(val) => setCategoryValue(val || "All Gateway")}
              placeholder="Select Payment Gateway"
            />

            {/* STATUS */}
            <Dropdown
              className="w-full md:w-[200px] cursor-pointer"
              options={paymentStatus}
              value={statusValue}
              onChange={(val) => setStatusValue(val || "All Status")}
              placeholder="Select Payment Status"
            />
          </div>
        </div>

        {/* Mobile Transaction List */}
        <div className="md:hidden space-y-3">
          {filteredPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No transactions found</p>
          ) : (
            filteredPayments.map((payment, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-[70%] md:w-auto truncate">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-sm font-medium text-gray-900">{payment.transactionID}</p>
                  </div>
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full w-[30%] md:w-auto text-center">
                    {payment.status}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="text-sm text-purple-600 font-medium">{payment.orderID}</p>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm text-gray-900">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">₹{payment.amount?.toLocaleString() || "0"}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {payment.method || "UPI"}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {payment.gateway || "Razorpay"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <PaymentDetailTable data={filteredPayments} />
        </div>
      </div>
    </>
  );
}
