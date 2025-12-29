import { useMemo } from "react";

export default function CustomerDetailCard({ customers = [] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = customers.length;
    const active = customers.filter(
      (c) => String(c.Status).toLowerCase() === "active"
    ).length;
    const vip = customers.filter(
      (c) => String(c.Status).toLowerCase() === "vip"
    ).length;

    const newThisMonth = customers.filter((c) => {
      if (!c.rawDate) return false;
      const d = new Date(c.rawDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return [
      { title: "Total Customers", value: total },
      { title: "Active Customers", value: active },
      { title: "VIP Customers", value: vip },
      { title: "New This Month", value: newThisMonth },
    ];
  }, [customers]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6 px-0">
      {stats.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <div>
            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
            <p className="text-2xl !font-semibold text-gray-900 mt-2">
              {card.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
