import CustomerDetailCard from "./components/CustomerDetailCard";
import CustomerDetailTable from "./components/CustomerDetailTable";

export default function Customers() {
    return(
        <>
            <div className="dashboard-label-wrapper mb-6 px-2">
                <p className="text-xl">Customers</p>
                <p className="text-md">View customer information</p>
            </div>

            <CustomerDetailCard />

            <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
                <div className="search-bar-wrapper flex justify-between gap-4">
                    <div className="relative flex-1">
                        <input
                        type="text"
                        placeholder="Search by name or email"
                        className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                        </span>
                    </div>

                    <div>
                        <select
                        className="w-full border border-gray-100 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                        >
                        <option value="All Customers">All Customers</option>
                        <option value="VIP">VIP</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="table-wrapper">
                    <CustomerDetailTable />
                </div>
            </div>
        </>
    )
}