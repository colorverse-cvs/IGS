import { HiHome, HiCube, HiClipboardList, HiOfficeBuilding, HiUsers, HiCreditCard, HiTag, HiCog } from "react-icons/hi";

export default function BottomNavigation({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: HiHome, label: "Home" },
    { name: "Products", icon: HiCube, label: "Products" },
    { name: "Orders", icon: HiClipboardList, label: "Orders" },
    { name: "Inventory", icon: HiOfficeBuilding, label: "Stock" },
    { name: "Customers", icon: HiUsers, label: "Customers" },
    { name: "Payments", icon: HiCreditCard, label: "Payments" },
    { name: "Settings", icon: HiCog, label: "Profile" },
  ];

  return (
    <div className=" md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 overflow-x-auto">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;
          
          return (
            <button
              key={item.name}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActivePage(item.name);
              }}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors cursor-pointer ${
                isActive ? "text-purple-600" : "text-gray-500"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

