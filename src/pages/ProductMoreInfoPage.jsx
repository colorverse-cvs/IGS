import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import CraftStoryPage from "./CraftStoryPage.jsx";
import RelatedCategoryPage from "./RelatedCategoryPage.jsx";

export default function ProductMoreInfoPage({ productId }) {
  const dispatch = useDispatch();
  const { products: allProducts, status } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

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
