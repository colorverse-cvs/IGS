import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";

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

  // Responsive carousel settings
  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLg = viewportWidth >= 1024; // Tailwind lg breakpoint
  const itemsPerView = isLg ? 4 : 2; // 2 cards visible on mobile/tablet
  const widthPercent = isLg ? 25 : 50; // exact 2-up on sm/md
  const carouselActive = isLg ? filteredProducts.length > 4 : true;
  const stepSize = viewportWidth < 768 ? 1 : itemsPerView; // mobile step 1, others step per view
  const maxIndex = Math.max(0, filteredProducts.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);

  // autoplay
  React.useEffect(() => {
    if (!carouselActive || filteredProducts.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) => {
        const next = idx + stepSize;
        return next > maxIndex ? 0 : next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [
    carouselActive,
    filteredProducts.length,
    itemsPerView,
    stepSize,
    maxIndex,
  ]);

  // drag to swipe
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
        <div className="relative">
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
              style={{ transform: `translateX(-${widthPercent * firstVisibleIndex}%)` }}
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
          {filteredProducts.length > itemsPerView && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() =>
                  setFirstVisibleIndex((idx) =>
                    idx - stepSize < 0 ? maxIndex : idx - stepSize
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow border border-gray-300 hover:border-purple-500 hover:bg-gray-100"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() =>
                  setFirstVisibleIndex((idx) =>
                    idx + stepSize > maxIndex ? 0 : idx + stepSize
                  )
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow border border-gray-300 hover:border-purple-500 hover:bg-gray-100"
              >
                →
              </button>
            </>
          )}
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
