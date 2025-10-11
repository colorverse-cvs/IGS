import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
// ... (Your Redux and Data logic remains the same as previously defined)

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const allProducts = useSelector((state) => state.products.products);

  const getCategoryName = (slug) => {
    if (slug === "god-statue") return "God Statue";
    if (slug === "motivational-statue") return "Motivational Statue";
    return "";
  };

  const categoryName = getCategoryName(categorySlug);

  const filteredProducts = allProducts.filter(
    (product) => product.category === categoryName
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {categoryName || "All Products"} Collection
      </h2>

      {/* Tailwind Responsive Grid for Cards */}
      <div
        className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        gap-8
      "
      >
        {filteredProducts.map((product) => (
          // The ProductCard handles its own max-width and margin for centering on smaller screens
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No products found in the {categoryName} category.
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
