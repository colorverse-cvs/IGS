import DashboardAnalysisCards from "./components/DashboardAnalysisCards";
import RecentOrderCard from "./components/RecentOrderCard";
import LowStockCard from "./components/LowStock";
import TopSellingCard from "./components/TopSellingCard";

export default function Dashboard() {
    return(
        <>
            <div className="dashboard-content-wrapper__main">
                <div className="dashboard-content-wrapper__outer">
                    <div className="dashboard-content-wrapper__inner">
                        <div className="dashboard-content-wrapper__inner">
                            <div className="dashboard-label-wrapper mb-4 px-2 py-3">
                                <p className="text-xl">Dashboard</p>
                                <p className="text-md">Welcome back! Here's what's happening today.</p>
                            </div>
                            <div className="dashboard-analysis-card-wrapper">
                                <DashboardAnalysisCards />
                            </div>
                            <div className="dashboard-recent-order-low-stock-wrapper flex gap-6 md:mt-2">
                                <div className="recent-order-wrapper w-2/3">
                                    <RecentOrderCard />
                                </div>
                               
                                <div className="low-stock-wrapper-inner w-1/3 flex flex-col gap-6">
                                    <LowStockCard />
                                    <TopSellingCard />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}