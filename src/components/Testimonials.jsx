import React from "react";

export default function Testimonials({ items = [] }) {
  // Responsive horizontal scroll (snap): lg:4, md:2, sm:1
  return (
    <section className="bg-brand-50 py-16">
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
            <h2 className="text-5xl leading-tight font-serif font-semibold text-gray-900">
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
          <div className="overflow-x-auto snap-x snap-mandatory flex gap-6 pb-4">
            {items.map((t, idx) => (
              <div
                key={idx}
                className="snap-start min-w-[88%] sm:min-w-[48%] lg:min-w-[23%] bg-brand-100 backdrop-blur rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-md"
                  />
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {t.name}
                    </div>
                    {t.role && (
                      <div className="text-xs text-gray-500">{t.role}</div>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
