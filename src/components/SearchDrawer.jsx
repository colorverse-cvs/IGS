import React from "react";
import { X, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";


import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";

export default function SearchDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [query, setQuery] = React.useState("");

  const { products: allProducts, status } = useSelector((state) => state.products);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  // Convert text to URL-friendly format for category slugs
  const toSlug = (val) => (val || "").toLowerCase().replace(/\s+/g, "-");

  // Filter products based on search query across multiple fields
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qNum = Number(q);
    return allProducts.filter((p) => {
      const priceStr = String(p.price || "");
      const ratingStr = String(p.rating || "");
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.material || "").toLowerCase().includes(q) ||
        (p.size || "").toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q) ||
        priceStr.includes(q) ||
        ratingStr.includes(q) ||
        (!Number.isNaN(qNum) &&
          ((p.price || 0) === qNum || (p.rating || 0) === qNum))
      );
    });
  }, [query, allProducts]);

  // Navigate to product details page
  const handleClick = (p) => {
    onClose?.();
    navigate(`/product/${p.id}`, { state: { product: p } });
  };

  // Prevent background scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Clear query when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay - click to close */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer panel - slides in from right side */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 md:w-80 lg:w-80 bg-white z-50 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        {/* Search input header */}
        <div className="p-4 border-b border-gray-300">
          <div className="relative flex items-center">
            <Search size={18} className="text-gray-400 absolute left-3" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Explore collection"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2  focus:ring-purple-500"
            />
            <button
              onClick={onClose}
              className="cursor-pointer absolute right-2 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search results list */}
        <div className="flex-1 overflow-y-auto p-3">
          {query.trim() === "" ? (
            <div className="text-sm text-gray-500 p-4">
              Type to search products by name, material, size, price, or rating
            </div>
          ) : results.length === 0 ? (
            <div className="text-sm text-gray-500 p-4">No results found.</div>
          ) : (
            <ul className="space-y-2">
              {/* Show first 30 results */}
              {results.slice(0, 30).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => handleClick(p)}
                    className="w-full text-left"
                  >
                    {/* Product result card */}
                    <div className="border border-gray-100 hover:shadow-lg rounded-lg p-2 flex items-start gap-3">
                      <img
                        src={p.imageURL}
                        alt={p.name}
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.categoryName} • {p.material || ""}{" "}
                          {p.size ? `• ${p.size}` : ""}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{p.price}
                          </span>
                          <span className="flex items-center text-yellow-500 text-xs">
                            <Star size={12} className="fill-current" />
                            <span className="ml-1 text-gray-600">
                              {p.rating}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
