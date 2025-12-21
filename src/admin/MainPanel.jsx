import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PageContent from "./PageContent";
import BottomNavigation from "./BottomNavigation";
import MobileHeader from "./MobileHeader";

export default function AdminPanelMain() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Wrapper function to ensure state updates correctly
  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const getPageTitle = () => {
    const titles = {
      "Dashboard": "Dashboard",
      "Products": "Products",
      "Orders": "Orders",
      "Inventory": "Inventory",
      "Customers": "Customers",
      "Payments": "Payments",
      "Settings": "Profile"
    };
    return titles[activePage] || activePage;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar setActivePage={handlePageChange} activePage={activePage} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Desktop Topbar */}
        <div className="hidden md:block">
          <Topbar setActivePage={handlePageChange} />
        </div>

        {/* Mobile Header */}
        <MobileHeader pageTitle={getPageTitle()} />

        {/* Page Content with bottom padding for mobile nav */}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <PageContent setActivePage={handlePageChange} activePage={activePage} />
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation activePage={activePage} setActivePage={handlePageChange} />
      </div>
    </div>
  );
}
