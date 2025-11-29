import { useState, useMemo } from "react";
import CustomerDetailCard from "./components/CustomerDetailCard";
import CustomerDetailTable from "./components/CustomerDetailTable";
import Dropdown from "../../../components/Dropdown";

const customerStatusValue = [
  "All Customers",
  "Active",
  "Inactive",
  "VIP"
];

const customerData = [
  {
    customerName: "Akash Jadhav",
    emailId: "akash@gmail.com",
    mobile: "9874562140",
    totalOrders: 9,
    totalSpent: 12000,
    Status: "Active",
    joinDate: "Jan 2024"
  },
  {
    customerName: "Tusha Jadhav",
    emailId: "tusha@gmail.com",
    mobile: "9874562140",
    totalOrders: 9,
    totalSpent: 12000,
    Status: "VIP",
    joinDate: "Jan 2024"
  },
  {
    customerName: "Suraj Jadhav",
    emailId: "suraj@gmail.com",
    mobile: "9874562140",
    totalOrders: 19,
    totalSpent: 12000,
    Status: "Inactive",
    joinDate: "Feb 2024"
  },
  {
    customerName: "Akash Jadhav",
    emailId: "akash@gmail.com",
    mobile: "9874562140",
    totalOrders: 19,
    totalSpent: 12000,
    Status: "Inactive",
    joinDate: "Feb 2024"
  }
];

export default function Customers() {
  const [statusFilter, setStatusFilter] = useState("All Customers");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Combined filtering (status + search)
  const filteredCustomers = useMemo(() => {
    let data = customerData;

    // Status filter
    if (statusFilter !== "All Customers") {
      data = data.filter(customer => customer.Status === statusFilter);
    }

    // Search filter (name or email)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      data = data.filter(customer =>
        customer.customerName.toLowerCase().includes(search) ||
        customer.emailId.toLowerCase().includes(search)
      );
    }

    return data;
  }, [statusFilter, searchTerm]);

  return (
    <>
      <div className="dashboard-label-wrapper mb-6 px-2">
        <p className="text-xl font-semibold">Customers</p>
        <p className="text-md text-gray-500">View customer information</p>
      </div>

      <CustomerDetailCard />

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
        <div className="search-bar-wrapper flex justify-between gap-4">
          
          {/* ✅ SEARCH INPUT */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* ✅ STATUS DROPDOWN */}
          <Dropdown
            className="md: w-[140px] cursor-pointer"
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
