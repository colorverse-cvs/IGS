import React from "react";
import categoriesData from "../data/categories.json";
import CraftStoryPage from "./CraftStoryPage.jsx";
import RelatedCategoryPage from "./RelatedCategoryPage.jsx";

/**
 * ProductMoreInfoPage
 * Beginner-friendly version of the previous `ProductExtras`.
 * Purpose: show craft story (by category) and related products for a given productId.
 *
 * Notes for beginners:
 * - We read all products from `categories.json` (this project stores products inside categories).
 * - We find the product with `productId`, determine its category, and filter related items.
 * - This component is a presentational wrapper that passes data down to smaller components.
 */
export default function ProductMoreInfoPage({ productId }) {
  // Build a simple list of products from categories.json (single source of truth)
  const allProducts = React.useMemo(() => {
    const list = [];
    if (!categoriesData || !Array.isArray(categoriesData.sections)) return list;
    categoriesData.sections.forEach((section) => {
      (section.products || []).forEach((p) => {
        // Attach categoryId so we can find related items
        list.push({ ...p, categoryId: section.id });
      });
    });
    return list;
  }, []);

  // Find the requested product. If not found, render nothing (caller should handle fallback).
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return null;

  // Helper: convert a string to a slug (used when categoryId is missing)
  const toSlug = (val) => (val || "").toLowerCase().replace(/\s+/g, "-");

  // Determine category id for related items
  const categoryId = product.categoryId || toSlug(product.category);

  // Filter related products from same category excluding the current product
  const related = allProducts.filter(
    (p) => (p.categoryId || toSlug(p.category)) === categoryId && p.id !== product.id
  );

  return (
    <div>
      <CraftStoryPage categoryId={categoryId} />
      <RelatedCategoryPage items={related} />
    </div>
  );
}
