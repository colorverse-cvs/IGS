import { useState } from "react";

import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Orders from "./pages/Orders/Orders";
import Inventory from "./pages/Inventory/Inventory";
import Customers from "./pages/Customers/Customers";
import Payments from "./pages/Paymemts/Payments";
// import Coupons from "./pages/Coupons/Coupons";
import Settings from "./pages/Settings/Settings";

export default function PageContent({ setActivePage, activePage }) {
  return (
    <div className="p-4 lg:p-6 overflow-auto h-full hide-scrollbar bg-gray-50" key={activePage}>
      {activePage === "Dashboard" && <Dashboard setActivePage={setActivePage} />}
      {activePage === "Products" && <Products />}
      {activePage === "Orders" && <Orders />}
      {activePage === "Inventory" && <Inventory />}
      {activePage === "Customers" && <Customers />}
      {activePage === "Payments" && <Payments />}
      {/* {activePage === "Coupons" && <Coupons />} */}
      {activePage === "Settings" && <Settings />}
    </div>
  );
}

