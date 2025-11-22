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

  // ✅ Debounced Search - NOW uses productList
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const filtered = productList.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, productList]);  // 👈 important

  // const increaseStock = (id) => {
  //   setProductList((prev) =>
  //     prev.map((product) =>
  //       product.id === id
  //         ? {
  //             ...product,
  //             stock: product.stock + 1,
  //             lowStock: product.stock + 1 <= 5,
  //           }
  //         : product
  //     )
  //   );
  // };

  // const decreaseStock = (id) => {
  //   setProductList((prev) =>
  //     prev.map((product) =>
  //       product.id === id
  //         ? {
  //             ...product,
  //             stock: product.stock > 0 ? product.stock - 1 : 0,
  //             lowStock: product.stock - 1 <= 5,
  //           }
  //         : product
  //     )
  //   );
  // };

  return (
    <>
      <div className="dashboard-label-wrapper mb-6 px-2">
        <p className="text-xl">Inventory</p>
        <p className="text-md">Manage product stock</p>
      </div>

      <div className="search-bar-wrapper bg-white p-4 rounded-md">
        <div className="relative flex-1 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="border border-gray-100 hover:border-violet-500 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="text-sm">{product.name}</p>
                <div className="text-sm mt-1 flex gap-2 items-center">
                  <span className="text-gray-500 text-xs">
                    Stock: {product.stock}
                  </span>
                  {product.lowStock && (
                    <span className="text-orange-600 text-xs px-2 py-1 rounded-full">
                      Low Stock alert
                    </span>
                  )}
                </div>
              </div>

              {/* <div className="flex items-center justify-evenly gap-2">
                <button
                  onClick={() => decreaseStock(product.id)}
                  className="py-1 px-3 cursor-pointer bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  -
                </button>

                <p className="count mx-2 font-medium">{product.stock}</p>

                <button
                  onClick={() => increaseStock(product.id)}
                  className="py-1 px-3 cursor-pointer bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
