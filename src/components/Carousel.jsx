import React, { useEffect, useMemo, useState } from "react";

/**
 * Reusable Carousel component driven by props/JSON.
 *
 * Props:
 * - items: Array<{ id, title?, description?, image }>
 * - autoplay: boolean
 * - autoplayMs: number
 * - showPrevNext: boolean
 * - showIndicators: boolean
 * - className: string (optional)
 */
export default function Carousel({
  items = [],
  autoplay = true,
  autoplayMs = 3000,
  showPrevNext = true,
  showIndicators = true,
  className = "",
}) {
  const normalizedItems = useMemo(() => items.filter(Boolean), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  useEffect(() => {
    if (!autoplay || normalizedItems.length <= 1) return;
    const id = setInterval(goNext, Math.max(1000, autoplayMs));
    return () => clearInterval(id);
  }, [autoplay, autoplayMs, normalizedItems.length]);

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
    <div className={`relative overflow-hidden px-2 ${className}`}>
      <img
        src={active.image}
        alt={active.title || "slide"}
        className="w-full h-full object-cover transition-all rounded-2xl shadow-lg duration-700 ease-in-out"
      />

      {(active.title || active.description) && (
        <div className="absolute top-6 left-6 text-white drop-shadow">
          {active.title && (
            <h4 className="text-lg font-semibold">{active.title}</h4>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow border border-gray-300 hover:border-purple-500 hover:bg-gray-100"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow border border-gray-300 hover:border-purple-500 hover:bg-gray-100"
            aria-label="Next"
          >
            →
          </button>
        </>
      )}

      {showIndicators && normalizedItems.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-white flex gap-1">
          {normalizedItems.map((it, idx) => (
            <button
              key={it.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "w-3.5 bg-brand-500" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
