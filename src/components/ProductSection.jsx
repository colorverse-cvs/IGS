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
  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const isLg = viewportWidth >= 1024;
  const isMedium = viewportWidth >= 768 && viewportWidth < 1024;

  // Always show all products in carousel
  const renderItems = products;

  // Determine items per view and step size
  let itemsPerView, stepSize, cardWidthPercent;
  if (isLg) {
    itemsPerView = 4;
    stepSize = 4;
    cardWidthPercent = 25; // 25% width for each of 4 cards on large screens
  } else if (isMedium) {
    // Medium: show 2 cards at 50% width each
    itemsPerView = 2;
    stepSize = 1; // Move one card at a time for strip effect
    cardWidthPercent = 50;
  } else {
    // Mobile: show 2 cards at 48% width each
    itemsPerView = 2;
    stepSize = 1; // Move one card at a time for strip effect
    cardWidthPercent = 50;
  }

  const carouselActive = true; // Always active to show all cards
  const maxIndex = Math.max(0, renderItems.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);
  const dragStateRef = React.useRef({ dragging: false, startX: 0, moved: 0 });

  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    setFirstVisibleIndex((idx) => Math.min(idx, maxIndex));
  }, [maxIndex]);

  React.useEffect(() => {
    if (renderItems.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) => {
        const next = idx + stepSize;
        return next > maxIndex ? 0 : next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [renderItems.length, itemsPerView, stepSize, maxIndex]);

  const onPointerDown = (e) => {
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX ?? (e.touches ? e.touches[0].clientX : 0),
      moved: 0,
    };
  };
  const onPointerMove = (e) => {
    if (!dragStateRef.current.dragging) return;
    const x = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    dragStateRef.current.moved = x - dragStateRef.current.startX;
  };
  const onPointerUp = (e) => {
    if (!dragStateRef.current.dragging) return;
    const delta = dragStateRef.current.moved;
    dragStateRef.current.dragging = false;
    const threshold = 30;
    if (Math.abs(delta) > threshold) {
      e.preventDefault();
      e.stopPropagation();
      if (delta < 0) {
        setFirstVisibleIndex((idx) =>
          idx + stepSize > maxIndex ? 0 : idx + stepSize
        );
      } else {
        setFirstVisibleIndex((idx) =>
          idx - stepSize < 0 ? maxIndex : idx - stepSize
        );
      }
    }
  };

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
              className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 mb-2 hover:text-purple-700"
            >
              {title} <ChevronRight size={20} className="mt-1" />
            </Link>
          </h3>
        </div>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      {/* Products Carousel - Always show carousel to access all cards */}
      {renderItems.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No products available
        </div>
      ) : (
        <div className="relative">
          <div
            className="overflow-hidden select-none"
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${
                  cardWidthPercent * firstVisibleIndex
                }%)`,
              }}
            >
              {renderItems.map((product) => (
                <div
                  key={product.id}
                  style={{
                    flex: `0 0 ${cardWidthPercent}%`,
                    width: `${cardWidthPercent}%`,
                    maxWidth: `${cardWidthPercent}%`,
                    minWidth: `${cardWidthPercent}%`,
                  }}
                  className="px-1"
                >
                  <ProductCard
                    product={product}
                    onOpenProduct={onOpenProduct}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
