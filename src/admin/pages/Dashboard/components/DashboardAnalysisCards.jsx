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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 ${subColor || "text-gray-400"}`}>{sub}</p>
      </div>
      <div className={`p-2 rounded-full bg-gray-50 ${iconColor}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

export default function DashboardAnalysisCards() {
  return (
    <div className="dashboard-analysis-card-wrapper grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardsData.map((card, index) => (
        <AnalysisCard key={index} {...card} />
      ))}
    </div>
  );
}