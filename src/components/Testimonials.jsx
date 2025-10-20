import React from "react";

export default function Testimonials({ items = [] }) {
  // Carousel settings: 2 visible on sm/md, 4 on lg; autoplay, arrows, drag
  const [viewportWidth, setViewportWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  React.useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLg = viewportWidth >= 1024;
  const isMedium = viewportWidth >= 768 && viewportWidth < 1024;
  const baseItems = Array.isArray(items) ? items : [];

  // Always show all testimonials in carousel
  const displayItems = baseItems;

  // Determine items per view, step size, and width
  let itemsPerView, stepSize, widthPercent;
  if (isLg) {
    itemsPerView = 4;
    stepSize = 4;
    widthPercent = 25; // 25% width for each of 4 cards on large screens
  } else if (isMedium) {
    // Medium: show 2 cards at 50% width each
    itemsPerView = 2;
    stepSize = 1; // Move one card at a time for strip effect
    widthPercent = 50;
  } else {
    // Mobile: show 1 card at full width
    itemsPerView = 1;
    stepSize = 1; // Move one card at a time for strip effect
    widthPercent = 100;
  }

  const carouselActive = true; // Always active to show all cards
  const maxIndex = Math.max(0, displayItems.length - itemsPerView);
  const [firstVisibleIndex, setFirstVisibleIndex] = React.useState(0);

  React.useEffect(() => {
    if (displayItems.length <= itemsPerView) return;
    const id = setInterval(() => {
      setFirstVisibleIndex((idx) =>
        idx + stepSize > maxIndex ? 0 : idx + stepSize
      );
    }, 3000);
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
                  className="inline-block mt-4 text-sm bg-brand-900 text-white px-4 py-2 rounded-md hover:bg-brand-800"
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

              {displayItems.length > itemsPerView && (
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
        </div>
      </div>
    </section>
  );
}
