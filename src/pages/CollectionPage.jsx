import React from "react";
import categoriesData from "../data/categories.json";
import ProductSection from "../components/ProductSection.jsx";

/**
 * CollectionPage Component
 * 
 * Displays the featured collections page showing all product categories.
 * Each category section displays a carousel of products from that category.
 * 
 * For beginners:
 * - Reads product data from categories.json
 * - Maps through each category section and renders a ProductSection component
 * - ProductSection handles the carousel display of products
 */
export default function CollectionPage() {
  return (
    <div className="px-4 md:px-15 lg:px-20">
      <div className="container py-6 mx-auto">
        <section className="container mx-auto pt-12 pb-12">
          <div className="text-left md:text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-gray-600 text-sm">
              Our most popular and highest-rated statues
            </p>
          </div>
        </section>

        {categoriesData.sections.map((section) => (
          <div key={section.id} id={`section-${section.id}`}>
            <ProductSection
              title={section.title}
              subtitle={section.subtitle}
              products={section.products}
              showViewMore={true}
              maxItems={4}
              categoryId={section.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
