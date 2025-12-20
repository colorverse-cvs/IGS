import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../../../utils/constants";

import DashboardAnalysisCards from "./components/DashboardAnalysisCards";
import RecentOrderCard from "./components/RecentOrderCard";
import LowStockCard from "./components/LowStock";
import TopSellingCard from "./components/TopSellingCard";

export default function Dashboard({ setActivePage }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const didFetchRef = useRef(false); // <<< prevents API double-call

  // Get products only once
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/products`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();

      setAllProducts(result.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchProducts();
  }, []);

  return (
    <div className="dashboard-content-wrapper__main">
      <div className="dashboard-content-wrapper__outer">
        <div className="dashboard-content-wrapper__inner">
          {/* Desktop Header */}
          <div className="hidden md:flex dashboard-label-wrapper mb-4 px-2 py-3 items-center justify-between">
            <div>
              <p className="text-xl font-semibold">Dashboard</p>
              <p className="text-md text-gray-500">
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>

          {/* Mobile Welcome Message with Filter Button */}
          <div className="md:hidden px-4 py-2 mb-4 flex items-center justify-between">
            <p className="text-base text-gray-700">Welcome back, Username!</p>
          </div>

          <div className="dashboard-analysis-card-wrapper">
            <DashboardAnalysisCards />
          </div>

          {/* UPDATED RESPONSIVE LAYOUT */}
          <div className="dashboard-recent-order-low-stock-wrapper flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-6 mt-4">
            {/* Recent Orders */}
            <div className="recent-order-wrapper w-full md:w-2/3">
              <RecentOrderCard setActivePage={setActivePage} />
            </div>

            {/* Low Stock & Top Selling - Hidden on Mobile */}
            <div className="flex low-stock-wrapper-inner w-full md:w-1/3 flex-col gap-6">
              <LowStockCard allProducts={allProducts} />
              <TopSellingCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
