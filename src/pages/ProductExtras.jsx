import React from "react";
import categoriesData from "../data/categories.json";
import CraftStorySection from "../components/CraftStorySection.jsx";
import RelatedCategoryCarousel from "../components/RelatedCategoryCarousel.jsx";

/**
 * ProductExtras
 * Shows the craft story and related products for the current product.
 * Data flow:
 * - Build a unified product list with categoryId from categories and standalone products.
 * - Find the current product by productId.
 * - Derive categoryId (slug) and filter related products from the same category.
 */
export default function ProductExtras({ productId }) {
  const allProducts = React.useMemo(() => {
    const fromCategories = [];
    categoriesData.sections.forEach((section) =>
      section.products.forEach((p) =>
        fromCategories.push({ ...p, categoryId: section.id })
      )
    );
    return fromCategories; // single source: categories.json
  }, []);

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return null;

  const toSlug = (val) => (val || "").toLowerCase().replace(/\s+/g, "-");
  const categoryId = product.categoryId || toSlug(product.category);
  const related = allProducts.filter(
    (p) => (p.categoryId || toSlug(p.category)) === categoryId && p.id !== product.id
  );

  return (
    <div>
      <CraftStorySection categoryId={categoryId} />
      <RelatedCategoryCarousel items={related} />
    </div>
  );
}
