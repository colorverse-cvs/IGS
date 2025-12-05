import React from "react";
import {
  CAROUSEL_DEFAULT_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";

/**
 * CarouselRow - Shared horizontal carousel for any card/list content.
 *
 * Props:
 * - items: array
 * - renderItem: (item, idx) => ReactNode (required)
 * - config: responsive config (defaults to CAROUSEL_DEFAULT_CONFIG)
 * - autoplay: boolean (default true)
 * - autoplayMs: number (overrides config.autoplayMs)
 * - showIndicators: boolean
 * - enableDrag: boolean
 * - className: string
 * - gapClass: string for child wrapper spacing
 */
export default function CarouselRow({
  items = [],
  renderItem,
  config = CAROUSEL_DEFAULT_CONFIG,
  autoplay = true,
  autoplayMs,
  showIndicators = false,
  enableDrag = true,
  className = "",
  gapClass = "px-1",
}) {
  const normalizedItems = Array.isArray(items) ? items : [];
  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const responsive = React.useMemo(
    () => getResponsiveSettings(viewportWidth, config),
    [viewportWidth, config]
  );
  const itemsPerView = Math.max(1, responsive.itemsPerView || 1);
  const stepSize = Math.max(1, responsive.step || 1);
  const widthPercent = 100 / itemsPerView;
  const autoplayDelay = autoplayMs || config.autoplayMs || 3000;

  const maxIndex = Math.max(0, normalizedItems.length - itemsPerView);
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
    if (!autoplay || normalizedItems.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) => {
        const next = idx + stepSize;
        return next > maxIndex ? 0 : next;
      });
    }, autoplayDelay);
    return () => clearInterval(id);
  }, [
    autoplay,
    autoplayDelay,
    normalizedItems.length,
    itemsPerView,
    stepSize,
    maxIndex,
  ]);

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
      e.preventDefault?.();
      e.stopPropagation?.();
      setFirstVisibleIndex((idx) => {
        if (delta < 0) {
          return idx + stepSize > maxIndex ? 0 : idx + stepSize;
        }
        return idx - stepSize < 0 ? maxIndex : idx - stepSize;
      });
    }
  };

  if (normalizedItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No items available</div>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(normalizedItems.length / itemsPerView)
  );
  const currentPage = Math.floor(firstVisibleIndex / itemsPerView);

  return (
    <div className={`relative ${className}`}>
      <div
        className="overflow-hidden select-none"
        onMouseDown={enableDrag ? onPointerDown : undefined}
        onMouseMove={enableDrag ? onPointerMove : undefined}
        onMouseUp={enableDrag ? onPointerUp : undefined}
        onMouseLeave={enableDrag ? onPointerUp : undefined}
        onTouchStart={enableDrag ? onPointerDown : undefined}
        onTouchMove={enableDrag ? onPointerMove : undefined}
        onTouchEnd={enableDrag ? onPointerUp : undefined}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${widthPercent * firstVisibleIndex}%)`,
          }}
        >
          {normalizedItems.map((item, idx) => (
            <div
              key={item?.id ?? idx}
              style={{
                flex: `0 0 ${widthPercent}%`,
                width: `${widthPercent}%`,
                maxWidth: `${widthPercent}%`,
                minWidth: `${widthPercent}%`,
              }}
              className={gapClass}
            >
              {renderItem ? renderItem(item, idx) : item}
            </div>
          ))}
        </div>
      </div>

      {showIndicators && totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFirstVisibleIndex(idx * itemsPerView)}
              className={`h-2 w-2 rounded-full transition-colors ${
                idx === currentPage ? "bg-brand-700" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

