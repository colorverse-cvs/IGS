import { useState, useEffect } from "react";

import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductConfirmationModal from "./components/DeleteProductConfirmationModal";

const products = [
  {
    id: 1,
    name: "Teddy Bear - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 2,
    name: "Photo Frame - Wooden",
    category: "Home Decor",
    price: "₹450",
    stock: 25,
    image: "https://via.placeholder.com/80",
    lowStock: false,
  },
  {
    id: 3,
    name: "Panda - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 4,
    name: "Photo Frame - Wooden",
    category: "Home Decor",
    price: "₹450",
    stock: 25,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 5,
    name: "Photo Frame - Wooden",
    category: "Home Decor",
    price: "₹450",
    stock: 25,
    image: "https://via.placeholder.com/80",
    lowStock: false,
  },
];

export default function Products() {
  const [openAddProductModal, setAddProductModal] = useState(false);
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const [openDeleteProductModal, setOpenDeleteProductModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // ✅ Debounced search - 100ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(result);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <>
      <div className="product-label-top-wrapper flex items-center justify-between mb-4 p-4">
        <div className="dashboard-label-wrapper">
          <p className="text-xl">Products</p>
          <p className="text-md">Manage your gift shop inventory</p>
        </div>
        <button
          className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg"
          onClick={() => setAddProductModal(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
        <div className="search-bar-wrapper">
          <div className="relative">
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
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No products found</p>
          )}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-100 hover:border-violet-500 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{product.name}</p>

                    {product.lowStock && (
                      <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500">{product.category}</p>

                  <div className="text-sm mt-1 flex gap-2 items-center">
                    {product.oldPrice && (
                      <span className="line-through text-gray-400">
                        {product.oldPrice}
                      </span>
                    )}
                    <span className="text-green-600 font-semibold">
                      {product.price}
                    </span>
                    <span className="text-gray-500 text-xs">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 border px-3 py-1.5 cursor-pointer rounded-md hover:bg-gray-50"
                  onClick={() => setOpenEditProductModal(true)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="text-red-600 hover:bg-red-50 p-2 rounded-md cursor-pointer"
                  onClick={() => setOpenDeleteProductModal(true)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {openAddProductModal && (
        <AddProductModal onClose={() => setAddProductModal(false)} />
      )}

      {openEditProductModal && (
        <EditProductModal onClose={() => setOpenEditProductModal(false)} />
      )}

      {openDeleteProductModal && (
        <DeleteProductConfirmationModal onClose={() => setOpenDeleteProductModal(false)} />
      )}
    </>
  );
}
