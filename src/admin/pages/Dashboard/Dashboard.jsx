
import DashboardAnalysisCards from "./components/DashboardAnalysisCards";
import RecentOrderCard from "./components/RecentOrderCard";
import LowStockCard from "./components/LowStock";
import TopSellingCard from "./components/TopSellingCard";

export default function Dashboard({ setActivePage }) {
  return (
    <div className="dashboard-content-wrapper__main">
      <div className="dashboard-content-wrapper__outer">
        <div className="dashboard-content-wrapper__inner">
          <div className="dashboard-label-wrapper mb-4 px-2 py-3">
            <p className="text-xl font-semibold">Dashboard</p>
            <p className="text-md text-gray-500">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="dashboard-analysis-card-wrapper">
            <DashboardAnalysisCards />
          </div>

          {/* UPDATED RESPONSIVE LAYOUT */}
          <div className="dashboard-recent-order-low-stock-wrapper flex flex-col md:flex-row gap-6 mt-4">
            
            {/* Recent Orders */}
            <div className="recent-order-wrapper w-full md:w-2/3">
              <RecentOrderCard setActivePage={setActivePage} />
            </div>

            {/* Low Stock & Top Selling */}
            <div className="low-stock-wrapper-inner w-full md:w-1/3 flex flex-col gap-6">
              <LowStockCard />
              <TopSellingCard />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
