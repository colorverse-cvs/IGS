import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import {
  PRODUCT_CAROUSEL_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const allProducts = useSelector((state) => state.products.products);

  const getCategoryName = (slug) => {
    if (slug === "god-statue") return "God Statue";
    if (slug === "motivational-statue") return "Motivational Statue";
    return "";
  };

  const categoryName = getCategoryName(categorySlug);
  const filteredProducts = allProducts.filter(
    (product) => product.category === categoryName
  );

  // Responsive carousel settings from centralized config
  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Use centralized config for responsive settings
  const responsiveSettings = React.useMemo(
    () => getResponsiveSettings(viewportWidth, PRODUCT_CAROUSEL_CONFIG),
    [viewportWidth]
  );

  const itemsPerView = responsiveSettings.itemsPerView;
  const widthPercent = 100 / itemsPerView;
  const isLg = viewportWidth >= 1024;
  const carouselActive = isLg ? filteredProducts.length > itemsPerView : true;
  const stepSize = responsiveSettings.step; // From config
  const maxIndex = Math.max(0, filteredProducts.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);

  // Autoplay using centralized config
  React.useEffect(() => {
    if (!carouselActive || filteredProducts.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) => {
        const next = idx + stepSize;
        return next > maxIndex ? 0 : next;
      });
    }, PRODUCT_CAROUSEL_CONFIG.autoplayMs);
    return () => clearInterval(id);
  }, [
    carouselActive,
    filteredProducts.length,
    itemsPerView,
    stepSize,
    maxIndex,
  ]);

  // Drag to swipe
  const dragStateRef = React.useRef({ dragging: false, startX: 0, moved: 0 });
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

  // Navigation handlers
  const goPrev = () => {
    setFirstVisibleIndex((idx) =>
      idx - stepSize < 0 ? maxIndex : idx - stepSize
    );
  };

  const goNext = () => {
    setFirstVisibleIndex((idx) =>
      idx + stepSize > maxIndex ? 0 : idx + stepSize
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {categoryName || "All Products"} Collection
      </h2>

      {!carouselActive ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="relative group">
          {/* Prev/Next Buttons (from centralized config - showPrevNext: true) */}
          {PRODUCT_CAROUSEL_CONFIG.showPrevNext &&
            filteredProducts.length > itemsPerView && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute -left-5 md:left-0 top-1/2 -translate-y-1/2 z-20 bg-brand-700 text-white p-2 rounded-full hover:bg-brand-800 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                  aria-label="Previous products"
                >
                  ←
                </button>
                <button
                  onClick={goNext}
                  className="absolute -right-5 md:right-0 top-1/2 -translate-y-1/2 z-20 bg-brand-700 text-white p-2 rounded-full hover:bg-brand-800 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                  aria-label="Next products"
                >
                  →
                </button>
              </>
            )}

          <div
            className="overflow-hidden select-none p-2"
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
                transform: `translateX(-${widthPercent * firstVisibleIndex}%)`,
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    flex: `0 0 ${widthPercent}%`,
                    width: `${widthPercent}%`,
                    maxWidth: `${widthPercent}%`,
                  }}
                  className="px-2 min-w-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No products found in the {categoryName} category.
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
