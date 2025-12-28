import React, { useEffect, useMemo, useState } from "react";
import {
  CAROUSEL_DEFAULT_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Carousel({
  items = [],
  autoplay = true,
  autoplayMs = 4000,
  showPrevNext = true,
  showIndicators = true,
  className = "",
  config = CAROUSEL_DEFAULT_CONFIG,
  enableDrag = false,
}) {
  const normalizedItems = useMemo(() => items.filter(Boolean), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Get responsive settings based on viewport width
  const responsiveSettings = useMemo(
    () => getResponsiveSettings(viewportWidth, config),
    [viewportWidth, config]
  );

  const goPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(normalizedItems.length - 1, 0) : prev - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev === normalizedItems.length - 1 ? 0 : prev + 1
    );
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay logic
  useEffect(() => {
    if (!autoplay || normalizedItems.length <= 1) return;
    const id = setInterval(goNext, Math.max(1000, autoplayMs));
    return () => clearInterval(id);
  }, [autoplay, autoplayMs, normalizedItems.length]);

  // Drag support
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
      e.preventDefault?.();
      e.stopPropagation?.();
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  if (normalizedItems.length === 0) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          No items to display
        </div>
      </div>
    );
  }

  const active = normalizedItems[currentIndex];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={enableDrag ? onPointerDown : undefined}
      onMouseMove={enableDrag ? onPointerMove : undefined}
      onMouseUp={enableDrag ? onPointerUp : undefined}
      onMouseLeave={enableDrag ? onPointerUp : undefined}
      onTouchStart={enableDrag ? onPointerDown : undefined}
      onTouchMove={enableDrag ? onPointerMove : undefined}
      onTouchEnd={enableDrag ? onPointerUp : undefined}
    >
      <img
        src={active.image}
        alt={active.title || "slide"}
        className="w-full h-full object-cover transition-all rounded-2xl shadow-lg duration-700 ease-in-out"
      />

      {(active.title || active.description) && (
        <div className="absolute top-6 left-6 text-white drop-shadow">
          {active.title && (
            <p className="text-lg lg:text-xl font-semibold">{active.title}</p>
          )}
          {active.description && (
            <p className="text-sm opacity-90">{active.description}</p>
          )}
        </div>
      )}

      {showPrevNext && normalizedItems.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-brand-25 p-1 rounded-md shadow border border-gray-300 hover:border-brand-500 hover:bg-gray-100 transition z-10 cursor-pointer"
            aria-label="Previous"
          >
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-25 p-1 rounded-md shadow border border-gray-300 hover:border-brand-500 hover:bg-gray-100 transition z-10 cursor-pointer"
            aria-label="Next"
          >
            <ArrowRight className="h-5 w-5 text-gray-800" />
          </button>
        </>
      )}

      {showIndicators && normalizedItems.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-white flex gap-1 z-10">
          {normalizedItems.map((it, idx) => (
            <button
              key={it.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-3.5 bg-brand-700" : "w-2 bg-gray-300"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
