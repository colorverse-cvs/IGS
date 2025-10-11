import React from "react";
import ProductCard from "../components/ProductCard";
import products from "../data/products.json";

export default function ProductCollections() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
