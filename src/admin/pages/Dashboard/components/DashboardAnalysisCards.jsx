import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ShoppingCart, TrendingUp, Package, AlertTriangle } from "lucide-react";
import {
  selectAdminOrders,
  selectAdminProducts,
} from "../../../store/adminSlice";

function AnalysisCard({ title, value, sub, icon: Icon, iconColor, subColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex justify-between items-start">
      <div className="flex-1">
        <p className="text-xs md:text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl md:text-2xl !font-medium text-gray-900 mt-1 md:mt-2">
          {value}
        </p>
        <p
          className={`text-xs md:text-sm mt-1 md:mt-2 ${
            subColor || "text-gray-400"
          }`}
        >
          {sub}
        </p>
      </div>
      <div
        className={`p-2 rounded-full bg-gray-50 flex-shrink-0 ml-2 ${iconColor}`}
      >
        <Icon size={20} className="md:w-[22px] md:h-[22px]" />
      </div>
    </div>
  );
}

export default function DashboardAnalysisCards() {
  const orders = useSelector(selectAdminOrders);
  const products = useSelector(selectAdminProducts);

  // Calculate today's orders
  const todayOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }, [orders]);

  // Calculate this week's orders
  const weekOrders = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= weekAgo && orderDate <= today;
    });
  }, [orders]);

  // Calculate today's sales (only placed orders)
  const todaySales = useMemo(() => {
    return todayOrders
      .filter((order) => order.status === "placed")
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }, [todayOrders]);

  // Calculate this week's sales (only placed orders)
  const weekSales = useMemo(() => {
    return weekOrders
      .filter((order) => order.status === "placed")
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }, [weekOrders]);

  // Calculate pending orders (only pending status)
  const pendingOrders = useMemo(() => {
    return orders.filter((order) => order.status === "pending");
  }, [orders]);

  // Calculate low stock items (stock <= 5)
  const lowStockItems = useMemo(() => {
    return products.filter((product) => {
      const stock = product.stock || product.quantity || 0;
      return stock > 0 && stock <= 5;
    });
  }, [products]);

  // Build cards data from real metrics
  const cardsData = useMemo(
    () => [
      {
        title: "Today's Orders",
        value: todayOrders.length,
        sub: `This week: ${weekOrders.length}`,
        icon: ShoppingCart,
        iconColor: "text-brand-600",
      },
      {
        title: "Today's Sales",
        value: `₹${todaySales.toLocaleString("en-IN")}`,
        sub: `This week: ₹${weekSales.toLocaleString("en-IN")}`,
        icon: TrendingUp,
        iconColor: "text-green-600",
      },
      {
        title: "Pending Orders",
        value: pendingOrders.length,
        sub: pendingOrders.length > 0 ? "Need attention" : "All clear",
        icon: Package,
        iconColor: "text-orange-500",
        subColor:
          pendingOrders.length > 0 ? "text-orange-500" : "text-gray-400",
      },
      {
        title: "Low Stock Items",
        value: lowStockItems.length,
        sub: lowStockItems.length > 0 ? "Reorder soon" : "Stock healthy",
        icon: AlertTriangle,
        iconColor: "text-red-500",
        subColor: lowStockItems.length > 0 ? "text-red-500" : "text-gray-400",
      },
    ],
    [
      todayOrders,
      weekOrders,
      todaySales,
      weekSales,
      pendingOrders,
      lowStockItems,
    ]
  );

  return (
    <div className="dashboard-analysis-card-wrapper grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {cardsData.map((card, index) => (
        <AnalysisCard key={index} {...card} />
      ))}
    </div>
  );
}
