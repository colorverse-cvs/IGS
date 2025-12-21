import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProductsAsync,
  selectAdminProducts,
} from "../../store/adminSlice";

export default function Inventory() {
  const dispatch = useDispatch();
  const products = useSelector(selectAdminProducts);
  const hasFetched = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    stockLevel: [],
    minStock: "",
    maxStock: "",
  });

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAllProductsAsync());
  }, [dispatch]);

  useEffect(() => {
    // Check if products is undefined or not an array to avoid errors
    const productList = Array.isArray(products) ? products : [];

    const debounceTimer = setTimeout(() => {
      let filtered = productList.map((p) => ({
        id: p._id || p.id,
        name: p.name,
        stock: p.stock || p.quantity || 0,
        lowStock: (p.stock || p.quantity || 0) < 5, // Threshold for low stock
      }));

      if (searchTerm) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredProducts(filtered);
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, products]);

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex dashboard-label-wrapper mb-6 px-2 items-center justify-between">
        <div>
          <p className="text-xl">Inventory</p>
          <p className="text-md">Manage product stock</p>
        </div>
      </div>

      <div className="search-bar-wrapper bg-white p-4 rounded-lg">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        <div className="space-y-3">
          {filteredProducts.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No products found
            </p>
          )}

          {filteredProducts.map((product) => {
            const isLowStock = product.lowStock || product.stock <= 5;

            return (
              <div
                key={product.id}
                className={`border rounded-xl p-4 shadow-sm ${
                  isLowStock
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-100 hover:border-violet-500"
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* PRODUCT INFO */}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isLowStock ? "text-gray-900" : "text-gray-800"
                      }`}
                    >
                      {product.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`text-sm font-medium ${
                          isLowStock ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>

                      {isLowStock && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⚠️</span>
                          <span className="text-orange-600 text-xs font-medium">
                            Low Stock Alert
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
