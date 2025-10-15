import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { ChevronRight } from "lucide-react";

/**
 * Reusable ProductSection component for category sections
 * Props:
 * - title: string (section title)
 * - subtitle?: string (optional subtitle)
 * - products: array of product objects
 * - showViewMore?: boolean (show arrow link)
 * - maxItems?: number (limit displayed products)
 */
export default function ProductSection({
  title,
  subtitle,
  products = [],
  showViewMore = true,
  maxItems = 4,
  categoryId,
  onOpenProduct,
}) {
  const displayedProducts = products.slice(0, maxItems);

  // Map category titles to filter IDs
  const getCategoryFilterId = (title) => {
    const categoryMap = {
      "Chhatrapati Shivaji Maharaj Statues": "shivaji",
      "Mavale Statues": "mavale",
      "God Statues": "god-statues",
      "Motivational Statues": "motivational",
      "Home Decor": "home-decor",
    };
    return categoryMap[title] || categoryId;
  };

  return (
    <section className="container mx-auto py-12">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h3>
            <Link
              to={`/filter?category=${getCategoryFilterId(title)}`}
              className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 mb-2 hover:text-purple-700"
            >
              {title} <ChevronRight size={20} className="mt-1" />
            </Link>
          </h3>
        </div>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      {/* Products Grid - Responsive Design */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenProduct={onOpenProduct}
          />
        ))}
      </div>
    </section>
  );
}
