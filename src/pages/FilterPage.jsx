import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
import { Link } from "react-router-dom";
import categoriesData from "../data/categories.json";
// import Breadcrumb from "../components/Breadcrumb.jsx";
import IshitaGalleryLogo from "../assets/ishita-gallery-logo.jpg";
import { User } from "lucide-react";

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

  // Build a unified list of products from categories and standalone list
  const getAllProducts = () => {
    const allProducts = [];
    categoriesData.sections.forEach((section) => {
      section.products.forEach((product) => {
        allProducts.push({
          ...product,
          categoryId: section.id,
          categoryName: section.title,
        });
      });
    });
    return allProducts; // single source: categories.json
  };

  // Filter products based on current filters
  const getFilteredProducts = () => {
    let filtered = getAllProducts();

    // Category filter
    if (filters.category) {
      const categoryMap = {
        shivaji: "shivaji",
        mavale: "mavale",
        "god-statues": "god-statues",
        motivational: "motivational",
        "home-decor": "home-decor",
      };

      const selected = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];

      filtered = filtered.filter((product) =>
        selected.some(
          (cat) =>
            product.categoryId === categoryMap[cat] ||
            product.category
              .toLowerCase()
              .includes((cat || "").replace("-", " "))
        )
      );
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Material filter (supports multi-select)
    if (filters.material) {
      const selected = Array.isArray(filters.material)
        ? filters.material
        : [filters.material];
      filtered = filtered.filter((product) =>
        selected.includes((product.material || "").toLowerCase())
      );
    }

    // Size filter (supports multi-select)
    if (filters.size) {
      const selected = Array.isArray(filters.size)
        ? filters.size
        : [filters.size];
      filtered = filtered.filter((product) => selected.includes(product.size));
    }

    // Price filter
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

    // Discount filter (supports multi-select thresholds)
    if (filters.discount) {
      const selected = Array.isArray(filters.discount)
        ? filters.discount
        : [filters.discount];
      const mins = selected.map((s) => parseInt(s));
      filtered = filtered.filter((product) => {
        const discountMatch = (product.discount || "").match(/(\d+)%/);
        if (!discountMatch) return false;
        const d = parseInt(discountMatch[1]);
        return mins.some((min) => d >= min);
      });
    }

    // In stock filter (placeholder for future stock data)

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

  // Update filters state and URL params
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);

    // Update URL params from non-empty filter values
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
      } else if (value && value !== "all" && value !== "") {
        params.set(key, value);
      }
    });
    setSearchParams(params);
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
    setSearchParams({});
    setCurrentPage(1);
  };

  const {
    products: paginatedProducts,
    total,
    totalPages,
  } = getPaginatedProducts();

  // const breadcrumbItems = [{ label: "Home", link: "/" }, { label: "Products" }];

  // Handle profile icon click
  const handleProfileClick = () => {
    if (user.isAuthenticated) {
      navigate("/profile");
    }
  };

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

  return (
    <div className="bg-white">
      {/* Mobile Header - Only show on mobile */}
      <div className="lg:hidden">
        {/* Top Bar with Logo and Profile */}
        {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <img
              src={IshitaGalleryLogo}
              alt="Ishita Gallery"
              className="h-12 w-auto"
            />
          </Link>
          {user.isAuthenticated && (
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition"
              aria-label="Profile"
            >
              <User size={20} className="text-gray-700" />
            </button>
          )}
        </div> */}

        {/* Search Bar */}
        <div className="flex items-center justify-between px-4 gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-600 hover:text-gray-900 w-[10%] md:w-[5%]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="px-0 py-3 border-b border-gray-200 w-[90%] md:w-[95%]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for a product"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              <Search size={18} className="absolute right-3 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Sort and Filter Buttons */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-1 w-[60%] lg:w-full">
            <span className="text-sm text-gray-700 whitespace-nowrap w-[30%] md:w-[15%] lg:w-full">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent w-[50%] md:w-[60%] lg:w-full"
            >
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
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

      {/* Desktop Breadcrumb - Only show on desktop */}
      {/* <div className="hidden lg:block py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div> */}
      {/* Header Controls - Desktop Only */}
      <div className="hidden lg:block bg-brand-25 rounded-lg shadow-sm p-6 sticky top-0 z-1">
        <div className="flex lg:flex-row lg:items-center lg:justify-end gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent p-1 focus-visible:outline-0"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent p-1 focus-visible:outline-0"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
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
                className=" w-20% border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent p-1 focus-visible:outline-0"
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
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
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

          {/* No products message */}
          {paginatedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found matching your criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
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
