import React from "react";
import ProductCard from "../components/ProductCard.jsx";
import {
  PRODUCT_CAROUSEL_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";

/**
 * RelatedCategoryPage Component
 * 
 * Displays a carousel of related products from the same category.
 * Uses responsive design: shows carousel on mobile/tablet, static grid on desktop if items are few.
 * 
 * For beginners:
 * - Responsive carousel that adapts to screen size
 * - Desktop (lg+): Shows static grid if items <= 4, otherwise shows carousel
 * - Tablet/Mobile: Always shows carousel
 * - Supports drag/touch gestures for navigation
 * - Auto-plays through items at configured intervals
 * 
 * @param {Array} items - Array of product objects to display
 */
export default function RelatedCategoryPage({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Use centralized config for responsive settings
  const responsiveSettings = React.useMemo(
    () => getResponsiveSettings(viewportWidth, PRODUCT_CAROUSEL_CONFIG),
    [viewportWidth]
  );

  const isLg = viewportWidth >= 1024;
  const itemsPerView = responsiveSettings.itemsPerView;
  const widthPercent = 100 / itemsPerView;
  const carouselActive = isLg ? items.length > itemsPerView : true;
  const stepSize = responsiveSettings.step;

  const baseItems = Array.isArray(items) ? items : [];
  const displayItems = React.useMemo(() => {
    if (!carouselActive) return baseItems;
    const result = [...baseItems];
    // Ensure we can always show a full viewport (2 on sm/md, 4 on lg)
    const remainder = result.length % itemsPerView;
    const needed = remainder === 0 ? 0 : itemsPerView - remainder;
    for (let i = 0; i < needed; i += 1) {
      if (baseItems.length === 0) break;
      result.push(baseItems[i % baseItems.length]);
    }
    // Guarantee at least itemsPerView items so viewport isn't half-empty
    while (result.length < itemsPerView && baseItems.length > 0) {
      result.push(baseItems[result.length % baseItems.length]);
    }
    return result;
  }, [baseItems, carouselActive, itemsPerView]);

  const maxIndex = Math.max(0, displayItems.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);
  const containerRef = React.useRef(null);
  const dragStateRef = React.useRef({ dragging: false, startX: 0, moved: 0 });

  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Clamp current index if viewport or list size changes
  React.useEffect(() => {
    setFirstVisibleIndex((idx) => Math.min(idx, maxIndex));
  }, [maxIndex]);

  const goPrev = () => {
    setFirstVisibleIndex((idx) => {
      const next = idx - stepSize;
      return next < 0 ? maxIndex : next;
    });
  };

  const goNext = () => {
    setFirstVisibleIndex((idx) => {
      const next = idx + stepSize;
      if (next > maxIndex) {
        return idx === maxIndex ? 0 : maxIndex; // show trailing items before wrapping
      }
      return next;
    });
  };

  // Autoplay using centralized config (3000ms)
  React.useEffect(() => {
    if (!carouselActive || displayItems.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) => {
        const next = idx + stepSize;
        if (next > maxIndex) {
          return idx === maxIndex ? 0 : maxIndex;
        }
        return next;
      });
    }, PRODUCT_CAROUSEL_CONFIG.autoplayMs);
    return () => clearInterval(id);
  }, [carouselActive, displayItems.length, itemsPerView, stepSize, maxIndex]);

  // Pointer/Touch drag to navigate
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
    const threshold = 30; // pixels
    if (Math.abs(delta) > threshold) {
      e.preventDefault();
      e.stopPropagation();
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <section className="py-12 px-4 md:px-15 lg:px-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 pb-10 text-center">
          Statues You Might Also Like
        </h2>

        {!carouselActive ? (
          // Desktop with <= 4 items: render a simple responsive grid (match ProductSection spacing)
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {baseItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Carousel wrapper
          <div className="relative">
            <div
              ref={containerRef}
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
                  transform: `translateX(-${
                    widthPercent * firstVisibleIndex
                  }%)`,
                }}
              >
                {displayItems.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
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
      </div>
    </section>
  );
}
