export default function Sidebar({ setActivePage, activePage }) {
  const menuItems = [
    "Dashboard",
    "Products",
    "Orders",
    "Inventory",
    "Customers",
    "Payments",
    // "Coupons",
    "Settings",
  ];

  return (
    <div className="w-64 bg-white border-r shadow-sm border-gray-200">
      <div className="p-5 text-xl font-bold text-purple-700 border-b border-gray-200 py-3.5">
        Gift Shop Admin
      </div>

      <ul className="mt-4 space-y-1">
        {menuItems.map((item) => (
          <li
            key={item}
            onClick={() => setActivePage(item)}
            className={`
              mx-3 px-4 py-2 rounded-lg cursor-pointer transition
              ${
                activePage === item
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-purple-100"
              }
            `}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
