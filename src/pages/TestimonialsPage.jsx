import React from "react";
import {
  TESTIMONIALS_CAROUSEL_CONFIG,
  getResponsiveSettings,
} from "../config/carouselConfig";

/**
 * TestimonialsPage Component
 * 
 * Displays customer testimonials in a responsive carousel.
 * Shows customer reviews with ratings, names, and avatars.
 * 
 * For beginners:
 * - Uses centralized carousel config for responsive behavior
 * - Auto-plays through testimonials at configured intervals
 * - Supports drag/touch gestures for manual navigation
 * - Responsive: adjusts items per view based on screen size
 * 
 * @param {Array} items - Array of testimonial objects with name, text, avatar, stars, role
 */
export default function TestimonialsPage({ items = [] }) {
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
    () => getResponsiveSettings(viewportWidth, TESTIMONIALS_CAROUSEL_CONFIG),
    [viewportWidth]
  );

  const itemsPerView = responsiveSettings.itemsPerView;
  const stepSize = responsiveSettings.step;
  const widthPercent = 100 / itemsPerView;

  const baseItems = Array.isArray(items) ? items : [];
  const displayItems = baseItems;
  const carouselActive = true; // Always active to show all cards
  const maxIndex = Math.max(0, displayItems.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);

  React.useEffect(() => {
    if (displayItems.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) =>
        idx + stepSize > maxIndex ? 0 : idx + stepSize
      );
    }, TESTIMONIALS_CAROUSEL_CONFIG.autoplayMs);
    return () => clearInterval(id);
  }, [displayItems.length, itemsPerView, stepSize, maxIndex]);

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
      setFirstVisibleIndex((idx) =>
        delta < 0
          ? idx + stepSize > maxIndex
            ? 0
            : idx + stepSize
          : idx - stepSize < 0
          ? maxIndex
          : idx - stepSize
      );
    }
  };

  return (
    <section className="bg-brand-50 py-16">
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
            <h2 className="text-4xl md:text-5xl   leading-tight font-serif font-semibold text-gray-900">
              Experiences Shared by Our Clients
            </h2>
            <div className="flex">
              <div>
                <p className="text-sm text-gray-700 max-w-md">
                  Hear from satisfied customers who have transformed their
                  spaces with our statues
                </p>
                <a
                  href="#"
                  className="inline-block mt-4 text-sm bg-brand-900 text-white px-4 py-2 rounded-md hover:bg-brand-800 w-full text-center md:w-[50%]"
                >
                  View All →
                </a>
              </div>
            </div>
          </div>

          {displayItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No testimonials available
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
                      widthPercent * firstVisibleIndex
                    }%)`,
                  }}
                >
                  {displayItems.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: `0 0 ${widthPercent}%`,
                        width: `${widthPercent}%`,
                        maxWidth: `${widthPercent}%`,
                        minWidth: `${widthPercent}%`,
                      }}
                      className="px-1 min-w-0"
                    >
                      <div className="bg-brand-100 backdrop-blur rounded-xl p-5 h-full transition-all duration-200 ease-out hover:bg-white group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative border border-gray-200 rounded-md transition-all duration-200 ease-out group-hover:shadow-lg group-hover:scale-102 group-hover:-translate-y-1">
                            <img
                              src={t.avatar}
                              alt={t.name}
                              className="w-9 h-9 rounded-md transition-transform duration-200 ease-out group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {t.name}
                            </div>
                            {t.role && (
                              <div className="text-xs text-gray-500">
                                {t.role}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {t.text}
                        </p>
                        <div
                          className="text-yellow-500 text-lg"
                          aria-label={`${t.stars} star rating`}
                        >
                          {"★".repeat(t.stars || 5)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
