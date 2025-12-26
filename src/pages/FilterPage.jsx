import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
// import { Link } from "react-router-dom";
// import IshitaGalleryLogo from "../assets/ishita-gallery-logo.jpg";
// import { User } from "lucide-react";

export default function FilterPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: null,
    material: null,
    size: null,
    priceRange: "all",
    minPrice: "",
    maxPrice: "",
    inStockOnly: false,
    discount: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isItemsPerPageDropdownOpen, setIsItemsPerPageDropdownOpen] =
    useState(false);
  const dispatch = useDispatch();
  const { products: allProducts, status } = useSelector((state) => state.products);

  // Sort options with labels
  const sortOptions = [
    { value: "popular", label: "Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    // { value: "rating", label: "Rating" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Popular";

  // Items per page options
  const itemsPerPageOptions = [
    { value: 4, label: "4" },
    { value: 8, label: "8" },
    { value: 12, label: "12" },
    { value: 16, label: "16" },
  ];

  // Map category names to slugs for filtering
  const getCategorySlug = (categoryName) => {
    const categoryMap = {
      "Chhatrapati Shivaji Maharaj Statues": "shivaji",
      "Mavale Statues": "mavale",
      "God Statues": "god-statues",
      "Home Decor": "home-decor",
      "Motivational Statues": "motivational",
    };
    return categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  // Fetch products if not already loaded
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = categoryParam
      ? categoryParam.includes(",")
        ? categoryParam.split(",")
        : categoryParam
      : null;
    const materialParam = searchParams.get("material");
    const material = materialParam
      ? materialParam.includes(",")
        ? materialParam.split(",")
        : materialParam
      : null;
    const sizeParam = searchParams.get("size");
    const size = sizeParam
      ? sizeParam.includes(",")
        ? sizeParam.split(",")
        : sizeParam
      : null;
    const priceRange = searchParams.get("priceRange") || "all";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const discountParam = searchParams.get("discount");
    const discount = discountParam
      ? discountParam.includes(",")
        ? discountParam.split(",")
        : discountParam
      : null;

    setFilters({
      category,
      material,
      size,
      priceRange,
      minPrice,
      maxPrice,
      inStockOnly,
      discount,
    });
  }, [searchParams]);

  // Get all products (from API)
  const getAllProducts = () => {
    return allProducts;
  };

  // Filter products based on current filters
  // All filters use AND logic - product must match ALL selected filters
  // Within each filter type, multi-select uses OR logic (e.g., "marble" OR "resin")
  const getFilteredProducts = () => {
    let filtered = getAllProducts();

    // Category filter - OR within category (shivaji OR mavale), AND with other filters
    if (filters.category) {
      const selected = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];

      filtered = filtered.filter((product) =>
        selected.some((cat) => {
          // Match by categoryId (slug) or category name
          const categorySlug = product.categoryId || getCategorySlug(product.category || "");
          return categorySlug === cat ||
            (product.category || "").toLowerCase().includes((cat || "").replace("-", " "));
        })
      );
    }

    // Search query - AND with other filters
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Material filter - OR within material (marble OR resin), AND with other filters
    if (filters.material) {
      const selected = Array.isArray(filters.material)
        ? filters.material
        : [filters.material];
      filtered = filtered.filter((product) => {
        const productMaterial = (product.material || "").toLowerCase();
        return selected.some(mat => productMaterial.startsWith(mat.toLowerCase()));
      });
    }

    // Size filter - OR within size (small OR medium), AND with other filters
    if (filters.size) {
      const selected = Array.isArray(filters.size)
        ? filters.size
        : [filters.size];
      filtered = filtered.filter((product) => selected.includes(product.size));
    }

    // Price filter - AND with other filters
    if (filters.priceRange === "custom") {
      if (filters.minPrice) {
        filtered = filtered.filter(
          (product) => product.price >= parseInt(filters.minPrice)
        );
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(
          (product) => product.price <= parseInt(filters.maxPrice)
        );
      }
    }

    // Discount filter - OR within discount (10% OR 20%), AND with other filters
    // Shows only products with exact discount percentage match
    if (filters.discount) {
      const selected = Array.isArray(filters.discount)
        ? filters.discount
        : [filters.discount];
      const discountValues = selected.map((s) => parseInt(s));
      filtered = filtered.filter((product) => {
        const discountMatch = (product.discount || "").match(/(\d+)%/);
        if (!discountMatch) return false;
        const productDiscount = parseInt(discountMatch[1]);
        // Match exact discount percentage only
        return discountValues.includes(productDiscount);
      });
    }

    // In stock filter - AND with other filters
    if (filters.inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    return filtered;
  };

  // Sort products
  const getSortedProducts = () => {
    const filtered = getFilteredProducts();

    switch (sortBy) {
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "rating":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case "popular":
      default:
        return [...filtered].sort((a, b) => b.reviews - a.reviews);
    }
  };

  // Pagination
  const getPaginatedProducts = () => {
    const sorted = getSortedProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      products: sorted.slice(startIndex, endIndex),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / itemsPerPage),
    };
  };

  // Keep page input in sync when currentPage changes elsewhere
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Update filters state and URL params - applies immediately on checkbox click
  const handleFiltersChange = (newFilters) => {
    // Apply filters immediately
    setFilters(newFilters);

    // Update URL params from non-empty filter values
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
      } else if (value && value !== "all" && value !== "" && value !== false) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Clear all filters and reset URL/query/pagination
  const handleResetFilters = () => {
    const resetFilters = {
      category: null,
      material: null,
      size: null,
      priceRange: "all",
      minPrice: "",
      maxPrice: "",
      inStockOnly: false,
      discount: null,
    };
    setFilters(resetFilters);
    setSearchQuery("");
    setSearchParams({});
    setCurrentPage(1);
  };

  const {
    products: paginatedProducts,
    total,
    totalPages,
  } = getPaginatedProducts();

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSortDropdownOpen) {
        const dropdown = event.target.closest(".sort-dropdown-container");
        if (!dropdown) {
          setIsSortDropdownOpen(false);
        }
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Close items per page dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isItemsPerPageDropdownOpen) {
        const dropdown = event.target.closest(
          ".items-per-page-dropdown-container"
        );
        if (!dropdown) {
          setIsItemsPerPageDropdownOpen(false);
        }
      }
    };

    if (isItemsPerPageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isItemsPerPageDropdownOpen]);

  // Lock body scroll when filter drawer is open (mobile)
  useEffect(() => {
    if (isFilterDrawerOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterDrawerOpen]);

  const handleSortSelect = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    setIsSortDropdownOpen(false);
  };

  const handleItemsPerPageSelect = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setIsItemsPerPageDropdownOpen(false);
  };

  return (
    <div className="bg-white">
      {/* Mobile Header - Only show on mobile */}
      <div className="lg:hidden">
        {/* Search Bar */}
        <div className="flex items-center justify-between px-4 gap-2">
          <button
            onClick={() => navigate("/")}
            className="p-1 text-gray-600 hover:text-gray-900 w-[10%] md:w-[5%]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="px-0 py-3 w-[90%] md:w-[95%]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for a product"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
              <Search size={18} className="absolute right-3 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Sort and Filter Buttons */}
        <div className="px-4 py-2 bg-brand-50 border-b border-gray-200 flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-1 w-[60%] lg:w-full">
            <span className="text-sm text-gray-700 whitespace-nowrap w-[30%] md:w-[15%] lg:w-auto">
              Sort By:
            </span>
            <div className="relative sort-dropdown-container flex-1 w-[50%] md:w-full">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition text-left"
              >
                <span className="truncate">{currentSortLabel}</span>
                <ChevronDown
                  size={16}
                  className={`ml-2 transition-transform ${isSortDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
              {isSortDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-purple-600 ring-opacity-5 z-40">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortSelect(option.value)}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === option.value
                          ? "bg-purple-50 text-brand-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition w-[40%] lg:w-full justify-center "
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Header Controls - Desktop Only */}
      <div className="hidden lg:block bg-brand-25 rounded-lg shadow-sm p-6 sticky top-0 z-1">
        <div className="flex lg:flex-row lg:items-center lg:justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-1 text-gray-600 hover:text-gray-900 w-[10%] md:w-[5%]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <div className="relative items-per-page-dropdown-container">
                <button
                  onClick={() =>
                    setIsItemsPerPageDropdownOpen(!isItemsPerPageDropdownOpen)
                  }
                  className="cursor-pointer flex items-center justify-between px-2 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition min-w-[80px]"
                >
                  <span>{itemsPerPage}</span>
                  <ChevronDown
                    size={16}
                    className={`ml-2 transition-transform ${isItemsPerPageDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>
                {isItemsPerPageDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-20 rounded-md shadow-lg bg-white ring-1 ring-purple-600 ring-opacity-5 z-40">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {itemsPerPageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleItemsPerPageSelect(option.value)}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${itemsPerPage === option.value
                            ? "bg-purple-50 text-brand-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort By:</label>
              <div className="relative sort-dropdown-container">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="cursor-pointer flex items-center justify-between px-2 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition min-w-[160px]"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    size={16}
                    className={`ml-2 transition-transform ${isSortDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-purple-600 ring-opacity-5 z-40">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortSelect(option.value)}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === option.value
                            ? "bg-purple-50 text-brand-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative flex justify-between items-center">
              <input
                type="text"
                placeholder="Search for a product"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className=" w-20% border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent px-2 py-1 focus-visible:outline-0 focus:outline-none"
              />
              <Search
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        {/* Filter Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
            isMobile={false}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            {/* Drawer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="text-lg font-semibold text-gray-900">Filters</div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onResetFilters={handleResetFilters}
                  isMobile={true}
                  onApplyFilters={() => setIsFilterDrawerOpen(false)}
                />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 h-[88vh] overflow-y-auto relative">
          {status === 'loading' ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Mobile Results Count */}
              <div className="text-center md:text-left text-sm text-gray-700 mb-4 px-2">
                Displaying {paginatedProducts.length} out of {total} products
              </div>

              {/* Products Grid - Responsive Design */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* No products message */}
          {status !== 'loading' && paginatedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found matching your criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-brand-600 hover:text-purple-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {status !== 'loading' && totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center gap-4  justify-between">
              <div className="lg:invisible hidden lg:block items-center gap-2 text-sm text-gray-700">
                <span>Page</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pageInput}
                  onChange={(e) => {
                    // allow empty while typing; only digits
                    const digits = e.target.value.replace(/\D/g, "");
                    setPageInput(digits);
                  }}
                  onBlur={() => {
                    const v = parseInt(pageInput, 10);
                    if (Number.isNaN(v)) {
                      setPageInput(String(currentPage));
                      return;
                    }
                    const clamped = Math.max(1, Math.min(totalPages, v));
                    setCurrentPage(clamped);
                    setPageInput(String(clamped));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-14 px-2 py-1 border rounded text-center"
                />
                <span>of {totalPages}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-md text-sm border border-gray-300 disabled:opacity-50 disabled:via-indigo-200 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} /> Previous page
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-md text-sm border border-gray-300 disabled:opacity-50 disabled:via-indigo-200 disabled:cursor-not-allowed"
                >
                  Next page <ArrowRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Page</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pageInput}
                  onChange={(e) => {
                    // allow empty while typing; only digits
                    const digits = e.target.value.replace(/\D/g, "");
                    setPageInput(digits);
                  }}
                  onBlur={() => {
                    const v = parseInt(pageInput, 10);
                    if (Number.isNaN(v)) {
                      setPageInput(String(currentPage));
                      return;
                    }
                    const clamped = Math.max(1, Math.min(totalPages, v));
                    setCurrentPage(clamped);
                    setPageInput(String(clamped));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span>of {totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
