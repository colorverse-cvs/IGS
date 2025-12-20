import { ShoppingCart, TrendingUp, Package, AlertTriangle } from "lucide-react";

const cardsData = [
  {
    title: "Today's Orders",
    value: 12,
    sub: "This week: 47",
    icon: ShoppingCart,
    iconColor: "text-purple-600",
  },
  {
    title: "Today's Sales",
    value: "₹8,450",
    sub: "This week: ₹32,890",
    icon: TrendingUp,
    iconColor: "text-green-600",
  },
  {
    title: "Pending Orders",
    value: 8,
    sub: "Need attention",
    icon: Package,
    iconColor: "text-orange-500",
    subColor: "text-orange-500",
  },
  {
    title: "Low Stock Items",
    value: 3,
    sub: "Reorder soon",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    subColor: "text-red-500",
  },
];

function AnalysisCard({ title, value, sub, icon: Icon, iconColor, subColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex justify-between items-start">
      <div className="flex-1">
        <p className="text-xs md:text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 mt-1 md:mt-2">{value}</p>
        <p className={`text-xs md:text-sm mt-1 md:mt-2 ${subColor || "text-gray-400"}`}>{sub}</p>
      </div>
      <div className={`p-2 rounded-full bg-gray-50 flex-shrink-0 ml-2 ${iconColor}`}>
        <Icon size={20} className="md:w-[22px] md:h-[22px]" />
      </div>
    </div>
  );
}

export default function DashboardAnalysisCards() {
  return (
    <div className="dashboard-analysis-card-wrapper grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {cardsData.map((card, index) => (
        <AnalysisCard key={index} {...card} />
      ))}
    </div>
  );
}
