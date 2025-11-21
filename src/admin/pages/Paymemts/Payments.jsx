import PaymentDetailCard from "./components/PaymentDetailCard";
import PaymentDetailTable from "./components/PaymentDetailTable";


export default function Payments() {
    return(
        <>
           <div className="product-label-top-wrapper flex items-center justify-between mb-4 p-4">

            {/* Left Text */}
            <div className="dashboard-label-wrapper">
                <p className="text-xl font-semibold">Payments & Transactions</p>
                <p className="text-md text-gray-600">
                Track all payment transactions
                </p>
            </div>

            {/* Right Button */}
            <button
                className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg whitespace-nowrap"
            >
                Export Transactions
            </button>

            </div>

            <PaymentDetailCard />
            <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
                <div className="search-bar-wrapper flex justify-between gap-4">
                    <div className="relative flex-1">
                        <input
                        type="text"
                        placeholder="Search by transaction ID or order ID"
                        className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                        </span>
                    </div>

                     <div>
                        <select
                            defaultValue=""
                            className="w-full border border-gray-100 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                        >
                            <option value="" disabled hidden>Select Category</option>
                            <option value="All Gateway">All Gateway</option>
                            <option value="Razorpay">Razorpay</option>
                            <option value="Paytm">Paytm</option>
                            <option value="PhonePe">PhonePe</option>
                        </select>
                    </div>

                    <div>
                         <select
                            defaultValue=""
                            className="w-full border border-gray-100 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                        >
                            <option value="" disabled hidden>Select Status</option>
                            <option value="Success">Success</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>
                </div>
                <div className="table-wrapper">
                    <PaymentDetailTable />
                </div>
            </div>
        </>
    )
}