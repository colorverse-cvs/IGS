import { useState } from "react";

import CouponDetailCard from "./components/CouponCard";
import CouponDetailTable from "./components/CouponDetailTable";
import AddNewCouponModal from "./components/AddNewCouponModal";

export default function Coupons() {
    const [openAddCouponModal, setOpenAddProductModal] = useState(false);
    return(
        <>
           <div className="product-label-top-wrapper flex items-center justify-between mb-4 p-4">
                
                {/* Left Text */}
                <div className="dashboard-label-wrapper">
                    <p className="text-xl font-semibold">Discount & Coupon Management</p>
                    <p className="text-md text-gray-600">
                    Create and manage promotional coupons
                    </p>
                </div>

                {/* Right Button */}
                <button
                    className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg whitespace-nowrap"
                    onClick={() => setOpenAddProductModal(true)}
                >
                    + Add New Coupon
                </button>

            </div>

            <CouponDetailCard />
            <div className="space-y-6 bg-white p-4 rounded-md">
                <p>Coupon List</p>
                <CouponDetailTable />
            </div>
            {openAddCouponModal && (
                <AddNewCouponModal onClose={() => setOpenAddProductModal(false)} />
            )}
        </>
    )
}