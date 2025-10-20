import React from "react";
import ProductCard from "../components/ProductCard";
import categoriesData from "../data/categories.json";

export default function ProductCollections() {
  const products = React.useMemo(() => {
    const arr = [];
    categoriesData.sections.forEach((s) => s.products.forEach((p) => arr.push(p)));
    return arr;
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
