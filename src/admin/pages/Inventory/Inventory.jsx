import { useEffect, useState } from "react";

const products = [
  { id: 1, name: "Teddy Bear - Small", stock: 2, lowStock: true },
  { id: 2, name: "Photo Frame - Wooden", stock: 25, lowStock: false },
  { id: 3, name: "Panda - Small", stock: 2, lowStock: true },
  { id: 4, name: "Photo Frame - Wooden", stock: 25, lowStock: true },
  { id: 5, name: "Photo Frame - Wooden", stock: 25, lowStock: false },
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [productList, setProductList] = useState(products);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const filtered = productList.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, productList]);

  return (
    <>
      <div className="dashboard-label-wrapper mb-6 px-2">
        <p className="text-xl">Inventory</p>
        <p className="text-md">Manage product stock</p>
      </div>

      <div className="search-bar-wrapper bg-white p-4 rounded-md">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No products found</p>
          )}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-100 hover:border-violet-500 rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                {/* PRODUCT INFO */}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {product.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="text-gray-500">
                      Stock: {product.stock}
                    </span>

                    {product.lowStock && (
                      <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                        Low Stock Alert
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

