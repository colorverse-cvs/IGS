import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../../../utils/constants";
import { MdEditNote, MdDelete } from "react-icons/md";

import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductConfirmationModal from "./components/DeleteProductConfirmationModal";

export default function Products() {
  const [openAddProductModal, setAddProductModal] = useState(false);
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const [openDeleteProductModal, setOpenDeleteProductModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentProduct, setCurrentProduct] = useState("");

  const didFetchRef = useRef(false); // <<< prevents API double-call

  // Get products only once
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/products`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      setAllProducts(result.data);
      setFilteredProducts(result.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchProducts();
  }, []);

  // SEARCH by name
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = allProducts.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();

        return name.includes(searchLower);
      });

      setFilteredProducts(result);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, allProducts]);

  if (loading)
    return <div className="text-md text-center">Loading products...</div>;

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex product-label-top-wrapper flex-col sm:flex-row sm:items-center justify-between mb-4 p-4 gap-3">
        <div className="dashboard-label-wrapper">
          <p className="text-xl font-semibold">Products</p>
          <p className="text-sm text-gray-500">
            Manage your gift shop inventory
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg"
            onClick={() => setAddProductModal(true)}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Mobile Add Product Button - Centered */}
      <div className="md:hidden mb-4 space-y-3">
        <div className="flex gap-3">
          <button
            className="flex-1 bg-brand-600 px-5 py-3 cursor-pointer text-white rounded-lg flex items-center justify-center gap-2 font-medium"
            onClick={() => setAddProductModal(true)}
          >
            <span className="text-xl">+</span> Add Product
          </button>
        </div>
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-lg">
        {/* SEARCH */}
        <div className="search-bar-wrapper">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No products found
            </p>
          )}

          {/* MAP REAL API PRODUCTS */}
          {filteredProducts.map((product) => {
            const image = product.images?.[0]?.url
              ? `${BASE_URL}${product.images[0].url}`
              : "https://via.placeholder.com/80";

            const isLowStock = product.stock < 10; // <<< UPDATED

            return (
              <div
                key={product.name}
                className="border border-gray-100 hover:border-violet-500 rounded-xl p-4 bg-white shadow-sm"
              >
                {/* LEFT CONTENT */}
                <div className="flex gap-3 mb-3">
                  <img
                    src={image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-semibold text-sm leading-tight">
                        {product.name}
                      </p>

                      {isLowStock && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {product.category.name || "Uncategorized"}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {product.listPrice && (
                        <span className="line-through text-gray-400 text-xs">
                          ₹{product.listPrice}
                        </span>
                      )}
                      <span className="text-green-600 font-semibold text-sm">
                        ₹{product.price}
                      </span>
                      <span className="text-gray-500 text-xs">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 items-center justify-end">
                  <button
                    className="flex items-center justify-center gap-2 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setCurrentProduct(product);
                      setOpenEditProductModal(true);
                    }}
                  >
                    <MdEditNote className="w-4 h-4" /> Edit
                  </button>

                  <button
                    className="text-red-600 hover:bg-red-50 p-1 rounded-md cursor-pointer"
                    onClick={() => {
                      setCurrentProduct(product);
                      setOpenDeleteProductModal(true);
                    }}
                  >
                    <MdDelete className="text-red-500 w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      {openAddProductModal && (
        <AddProductModal
          onClose={() => setAddProductModal(false)}
          onProductAdded={fetchProducts}
        />
      )}

      {openEditProductModal && (
        <EditProductModal
          onClose={() => setOpenEditProductModal(false)}
          existingProduct={currentProduct} // 👈 pass product
          onUpdated={() => fetchProducts()} // 👈 refresh products
        />
      )}

      {openDeleteProductModal && (
        <DeleteProductConfirmationModal
          onClose={() => setOpenDeleteProductModal(false)}
          existingProduct={currentProduct} // pass clicked product
          onUpdated={() => fetchProducts()} // refresh list
        />
      )}
    </>
  );
}
