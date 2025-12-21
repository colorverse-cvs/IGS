import React from "react";
import CarouselRow from "../components/CarouselRow";
import { TESTIMONIALS_CAROUSEL_CONFIG } from "../config/carouselConfig";

export default function TestimonialsPage({ items = [] }) {
  const displayItems = Array.isArray(items) ? items : [];

  return (
    <section className="py-[8rem]">
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
            <h2 className="text-4xl md:text-5xl leading-tight font-serif font-semibold text-gray-900">
              Experiences Shared by Our Clients
            </h2>
            <div>
              <p className="text-sm text-gray-700 max-w-md">
                Hear from satisfied customers who have transformed their spaces
                with our statues
              </p>
              <a
                href="#"
                className="inline-block mt-4 text-sm bg-brand-900 text-white px-4 py-2 rounded-md hover:bg-purple-800 w-full text-center md:w-[50%]"
              >
                View All →
              </a>
            </div>
          </div>

          <CarouselRow
            items={displayItems}
            config={TESTIMONIALS_CAROUSEL_CONFIG}
            showIndicators={false}
            gapClass="px-2"
            renderItem={(t) => (
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
            )}
          />
        </div>
      </div>
    </section>
  );
}
