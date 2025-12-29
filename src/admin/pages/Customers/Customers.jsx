import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCustomersAsync,
  selectAdminCustomers,
  selectAdminLoading,
} from "../../store/adminSlice";

import CustomerDetailCard from "./components/CustomerDetailCard";
import CustomerDetailTable from "./components/CustomerDetailTable";
import Dropdown from "../../../components/Dropdown";

const customerStatusValue = ["All Customers", "Active", "Inactive", "VIP"];

export default function Customers() {
  const dispatch = useDispatch();
  const customers = useSelector(selectAdminCustomers);
  const loading = useSelector(selectAdminLoading);
  const hasFetched = useRef(false);

  const [statusFilter, setStatusFilter] = useState("All Customers");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAllCustomersAsync());
  }, [dispatch]);

  // 1. Base mapped data (Full dataset from API)
  const mappedCustomers = useMemo(() => {
    return (customers || []).map((customer) => {
      const user = customer.user || customer;
      const profile = user.profile || {};

      // Normalize name
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const fullName =
        `${firstName} ${lastName}`.trim() ||
        user.name ||
        user.displayName ||
        "Guest";

      return {
        ...customer,
        customerName: fullName,
        emailId: user.email || "N/A",
        mobile: profile.mobile || user.phone || user.mobile || "N/A",
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0, // Keep as number for stats, format in table
        Status: customer.status || (!user.isActive ? "Active" : "Inactive"),
        joinDate:
          customer.joinDate || user.createdAt
            ? new Date(customer.joinDate || user.createdAt).toLocaleDateString(
                "en-IN",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )
            : "N/A",
        rawDate: customer.joinDate || user.createdAt, // For "New This Month" check
      };
    });
  }, [customers]);

  // 2. Data for Table (Filtered by Status and Search)
  const filteredCustomers = useMemo(() => {
    let data = mappedCustomers;

    // Status filter
    if (statusFilter !== "All Customers") {
      data = data.filter(
        (customer) =>
          String(customer.Status).toLowerCase() ===
          String(statusFilter).toLowerCase()
      );
    }

    // Search filter (name or email)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      data = data.filter(
        (customer) =>
          String(customer.customerName).toLowerCase().includes(search) ||
          String(customer.emailId).toLowerCase().includes(search)
      );
    }

    return data;
  }, [statusFilter, searchTerm, mappedCustomers]);

  if (loading && mappedCustomers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:flex dashboard-label-wrapper mb-6 px-2 items-center justify-between">
        <div>
          <p className="text-xl font-semibold">Customers</p>
          <p className="text-md text-gray-500">View customer information</p>
        </div>
      </div>

      <CustomerDetailCard customers={mappedCustomers} />

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
        <div className="search-bar-wrapper flex flex-col md:flex-row justify-between gap-4">
          {/* ✅ SEARCH INPUT */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* ✅ STATUS DROPDOWN */}
          <Dropdown
            className="w-full md:w-[180px] cursor-pointer"
            options={customerStatusValue}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "All Customers")}
            placeholder="Select Status"
          />
        </div>

        {/* ✅ TABLE DATA */}
        <CustomerDetailTable data={filteredCustomers} />
      </div>
    </>
  );
}
