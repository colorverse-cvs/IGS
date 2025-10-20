import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import { Search, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import categoriesData from "../data/categories.json";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function FilterPage() {
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

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    const material = searchParams.get("material");
    const size = searchParams.get("size");
    const priceRange = searchParams.get("priceRange") || "all";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const discount = searchParams.get("discount");

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
      filtered = filtered.filter(
        (product) =>
          product.categoryId === categoryMap[filters.category] ||
          product.category
            .toLowerCase()
            .includes(filters.category.replace("-", " "))
      );
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Material filter
    if (filters.material) {
      filtered = filtered.filter(
        (product) => (product.material || "").toLowerCase() === filters.material
      );
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter((product) => product.size === filters.size);
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

    // Discount filter
    if (filters.discount) {
      const minDiscount = parseInt(filters.discount);
      filtered = filtered.filter((product) => {
        const discountMatch = product.discount.match(/(\d+)%/);
        return discountMatch && parseInt(discountMatch[1]) >= minDiscount;
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
      if (value && value !== "all" && value !== "") {
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

  const breadcrumbItems = [{ label: "Home", link: "/" }, { label: "Products" }];

  return (
    <div className="bg-white">
      <div className="py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 h-[88vh] overflow-y-auto relative">
          {/* Header Controls */}
          <div className="bg-brand-25 rounded-lg shadow-lg p-6 mb-6 sticky top-0 z-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-gray-700">
                Displaying {paginatedProducts.length} out of {total} products
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">
                    Items per page:
                  </label>
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

          {/* Products Grid - Responsive Design */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
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
            <div className="flex items-center mt-4  justify-between">
              <div className="lg:invisible sm:hidden md:hidden lg:block items-center gap-2 text-sm text-gray-700">
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
                  className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-md text-sm border disabled:opacity-50"
                >
                  <ArrowLeft size={16} /> Previous page
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-md text-sm border disabled:opacity-50"
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
                  className="w-14 px-2 py-1 border rounded text-center"
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
