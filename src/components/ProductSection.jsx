import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import CarouselRow from "./CarouselRow";
import ProductCard from "./ProductCard";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  showViewMore = true,
  categoryId,
  onOpenProduct,
  showIndicators = false,
}) {
  // Map category titles to filter IDs
  const getCategoryFilterId = (title) => {
    const categoryMap = {
      "Chhatrapati Shivaji Maharaj Statues": "shivaji",
      "Mavale Statues": "mavale",
      "God Statues": "god-statues",
      "Home Decor": "home-decor",
      "Motivational Statues": "motivational",
    };
    return categoryMap[title] || categoryId;
  };

  return (
    <section className="container mx-auto pb-12">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h3>
            <Link
              to={`/filter?category=${getCategoryFilterId(title)}`}
              className="flex items-center justify-center gap-2 text-3xl !font-medium text-gray-900 mb-2 hover:text-brand-700"
            >
              <span>{title}</span>{" "}
              <span>
                <ChevronRight size={20} className="mt-1" />
              </span>
            </Link>
          </h3>
        </div>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      {/* Products Carousel - shared row component */}
      <CarouselRow
        items={products}
        renderItem={(product) => (
          <ProductCard product={product} onOpenProduct={onOpenProduct} />
        )}
        showIndicators={showIndicators}
        scrollMode="step"
      />
    </section>
  );
}
