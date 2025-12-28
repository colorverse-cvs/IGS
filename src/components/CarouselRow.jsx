import React from "react";
import {
  CAROUSEL_DEFAULT_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";

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
  scrollMode = "continuous", // 'continuous' or 'step'
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
  const widthPercent = 100 / itemsPerView;

  const containerRef = React.useRef(null);
  const trackRef = React.useRef(null);

  const animationFrameRef = React.useRef(null);
  const lastTimeRef = React.useRef(0);
  const scrollOffsetRef = React.useRef(0);

  const [isPaused, setIsPaused] = React.useState(false);

  // Drag state
  const dragStateRef = React.useRef({
    dragging: false,
    startX: 0,
    currentX: 0,
    startOffset: 0,
  });

  /* -------------------- Resize -------------------- */
  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* -------------------- Auto Scroll -------------------- */
  React.useEffect(() => {
    if (!autoplay || normalizedItems.length <= itemsPerView || isPaused) return;

    if (scrollMode === "continuous") {
      const scrollSpeed = 0.005; // 🔥 slower & smoother

      const animate = (time) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;

        scrollOffsetRef.current += scrollSpeed * delta;

        const singleSetWidth = normalizedItems.length * widthPercent;

        // seamless reset (no jump)
        if (scrollOffsetRef.current >= singleSetWidth) {
          scrollOffsetRef.current -= singleSetWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${scrollOffsetRef.current}%)`;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        lastTimeRef.current = 0;
      };
    } else if (scrollMode === "step") {
      const intervalMs = autoplayMs || 4000;
      const intervalId = setInterval(() => {
        scrollOffsetRef.current += widthPercent;

        const singleSetWidth = normalizedItems.length * widthPercent;

        // loop back to start
        if (scrollOffsetRef.current >= singleSetWidth) {
          scrollOffsetRef.current = 0;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${scrollOffsetRef.current}%)`;
        }
      }, intervalMs);

      return () => clearInterval(intervalId);
    }
  }, [
    autoplay,
    isPaused,
    normalizedItems.length,
    itemsPerView,
    widthPercent,
    scrollMode,
    autoplayMs,
  ]);

  /* -------------------- Click to Pause -------------------- */
  const handleClick = () => {
    if (
      Math.abs(dragStateRef.current.startX - dragStateRef.current.currentX) < 5
    ) {
      setIsPaused((p) => !p);
    }
  };

  /* -------------------- Drag Handlers -------------------- */
  const onPointerDown = (e) => {
    if (!enableDrag) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;

    dragStateRef.current = {
      dragging: true,
      startX: clientX,
      currentX: clientX,
      startOffset: scrollOffsetRef.current,
    };

    setIsPaused(true);
  };

  const onPointerMove = (e) => {
    if (!dragStateRef.current.dragging) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStateRef.current.currentX = clientX;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const delta = dragStateRef.current.startX - clientX;
    const deltaPercent = (delta / containerWidth) * 100;

    scrollOffsetRef.current = dragStateRef.current.startOffset + deltaPercent;

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${scrollOffsetRef.current}%)`;
    }
  };

  const onPointerUp = () => {
    if (!dragStateRef.current.dragging) return;

    dragStateRef.current.dragging = false;

    setTimeout(() => {
      if (!dragStateRef.current.dragging) {
        setIsPaused(false);
      }
    }, 150);
  };

  if (!normalizedItems.length) {
    return (
      <div className="text-center text-gray-500 py-8">No items available</div>
    );
  }

  /* -------------------- Duplicate Items -------------------- */
  const displayItems = [...normalizedItems];

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="overflow-hidden select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() =>
          !dragStateRef.current.dragging && setIsPaused(false)
        }
        onClick={handleClick}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{
            transition: dragStateRef.current.dragging
              ? "none"
              : "transform 0.1s linear",
          }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item?.id ?? idx}-${idx}`}
              style={{
                flex: `0 0 ${widthPercent}%`,
                width: `${widthPercent}%`,
              }}
              className={gapClass}
            >
              {renderItem ? renderItem(item, idx) : item}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- Indicators -------------------- */}
      {showIndicators && (
        <div className="mt-4 flex justify-center gap-2">
          {normalizedItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                scrollOffsetRef.current = idx * widthPercent;
                if (trackRef.current) {
                  trackRef.current.style.transform = `translateX(-${scrollOffsetRef.current}%)`;
                }
              }}
              className="h-2 w-2 rounded-full bg-gray-300 hover:bg-brand-700"
            />
          ))}
        </div>
      )}
    </div>
  );
}
