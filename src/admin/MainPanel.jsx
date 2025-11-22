import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PageContent from "./PageContent";

export default function AdminPanelMain() {
  const [activePage, setActivePage] = useState("Dashboard");
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar setActivePage={setActivePage} activePage={activePage} />

      <div className="flex flex-col flex-1">
        <Topbar />
        <PageContent setActivePage={setActivePage}  activePage={activePage} />
      </div>
    </div>
  );
}
