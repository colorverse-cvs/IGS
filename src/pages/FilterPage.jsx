import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import categoriesData from "../data/categories.json";
import products from "../data/products.json";

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

  // Get all products from categories
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
    return [...allProducts, ...products]; // Include standalone products too
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

    // In stock filter (placeholder - would need stock data in products)
    // if (filters.inStockOnly) {
    //   filtered = filtered.filter(product => product.inStock);
    // }

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

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when filters change
  };

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

  return (
    <div className="bg-white">
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 h-[88vh] overflow-y-auto">
          {/* Header Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
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
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a product"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className=" w-20% border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous page
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next page
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
