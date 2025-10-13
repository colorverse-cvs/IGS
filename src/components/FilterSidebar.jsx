import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

/**
 * FilterSidebar component with collapsible filter sections
 * Props:
 * - filters: object with current filter values
 * - onFiltersChange: function to update filters
 * - onResetFilters: function to reset all filters
 */
export default function FilterSidebar({
  filters,
  onFiltersChange,
  onResetFilters,
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    material: true,
    size: true,
    price: true,
    availability: true,
    discount: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
  };

  const handleMultiSelectChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFiltersChange({
      ...filters,
      [filterType]: newValues,
    });
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
      >
        {title}
        {expandedSections[section] ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>
      {expandedSections[section] && children}
    </div>
  );

  const RadioOption = ({ name, value, label, checked, onChange }) => (
    <label className="flex items-center mb-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mr-2 text-purple-600 focus:ring-purple-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  const CheckboxOption = ({ value, label, checked, onChange }) => (
    <label className="flex items-center mb-2 cursor-pointer">
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2 text-purple-600 focus:ring-purple-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="xl:w-80 w-70 bg-white p-6 border-r border-gray-200 h-[88vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filter Products</h2>
        <button
          onClick={onResetFilters}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
        >
          <X size={14} className="mr-1" />
          Reset filters
        </button>
      </div>

      {/* Theme/Category */}
      <FilterSection title="Theme/Category" section="category">
        <RadioOption
          name="category"
          value=""
          label="All Categories"
          checked={!filters.category}
          onChange={(value) => handleFilterChange("category", value || null)}
        />
        <RadioOption
          name="category"
          value="shivaji"
          label="Chhatrapati Shivaji Maharaj"
          checked={filters.category === "shivaji"}
          onChange={(value) => handleFilterChange("category", value)}
        />
        <RadioOption
          name="category"
          value="mavale"
          label="Mavale"
          checked={filters.category === "mavale"}
          onChange={(value) => handleFilterChange("category", value)}
        />
        <RadioOption
          name="category"
          value="god-statues"
          label="God Statues"
          checked={filters.category === "god-statues"}
          onChange={(value) => handleFilterChange("category", value)}
        />
        <RadioOption
          name="category"
          value="motivational"
          label="Motivational Statues"
          checked={filters.category === "motivational"}
          onChange={(value) => handleFilterChange("category", value)}
        />
        <RadioOption
          name="category"
          value="home-decor"
          label="Home Decor"
          checked={filters.category === "home-decor"}
          onChange={(value) => handleFilterChange("category", value)}
        />
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material" section="material">
        <RadioOption
          name="material"
          value=""
          label="All Materials"
          checked={!filters.material}
          onChange={(value) => handleFilterChange("material", value || null)}
        />
        <RadioOption
          name="material"
          value="marble"
          label="Marble"
          checked={filters.material === "marble"}
          onChange={(value) => handleFilterChange("material", value)}
        />
        <RadioOption
          name="material"
          value="resin"
          label="Resin"
          checked={filters.material === "resin"}
          onChange={(value) => handleFilterChange("material", value)}
        />
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size" section="size">
        <RadioOption
          name="size"
          value=""
          label="All Sizes"
          checked={!filters.size}
          onChange={(value) => handleFilterChange("size", value || null)}
        />
        <RadioOption
          name="size"
          value="small"
          label="Small (under 6 in)"
          checked={filters.size === "small"}
          onChange={(value) => handleFilterChange("size", value)}
        />
        <RadioOption
          name="size"
          value="medium"
          label="Medium (6 in - 10 in)"
          checked={filters.size === "medium"}
          onChange={(value) => handleFilterChange("size", value)}
        />
        <RadioOption
          name="size"
          value="large"
          label="Large (above 10 in)"
          checked={filters.size === "large"}
          onChange={(value) => handleFilterChange("size", value)}
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <RadioOption
          name="priceRange"
          value="all"
          label="All prices"
          checked={filters.priceRange === "all" || !filters.priceRange}
          onChange={(value) => handleFilterChange("priceRange", value)}
        />
        <RadioOption
          name="priceRange"
          value="custom"
          label="Custom pricing"
          checked={filters.priceRange === "custom"}
          onChange={(value) => handleFilterChange("priceRange", value)}
        />

        <div className="mt-3 space-y-3">
          {/* Price Range Slider - Always visible */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹4,000+</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={filters.maxPrice || 4000}
                onChange={(e) => {
                  if (filters.priceRange === "custom") {
                    const newMaxPrice = parseInt(e.target.value);
                    handleFilterChange("maxPrice", newMaxPrice);
                  }
                }}
                disabled={filters.priceRange !== "custom"}
                className={`w-full h-2 rounded-lg appearance-none slider ${
                  filters.priceRange === "custom"
                    ? "cursor-pointer bg-gray-200"
                    : "cursor-not-allowed opacity-50 bg-gray-100"
                }`}
                style={{
                  background:
                    filters.priceRange === "custom"
                      ? `linear-gradient(to right, #7c3aed 0%, #7c3aed ${
                          ((filters.maxPrice || 4000) / 4000) * 100
                        }%, #e5e7eb ${
                          ((filters.maxPrice || 4000) / 4000) * 100
                        }%, #e5e7eb 100%)`
                      : "#f3f4f6",
                }}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>₹{filters.minPrice || 0}</span>
                <span>₹{filters.maxPrice || 4000}</span>
              </div>
            </div>
          </div>

          {/* Manual Input Fields - Only when custom pricing is selected */}
          {filters.priceRange === "custom" && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice || ""}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                max="4000"
              />
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice || ""}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                max="4000"
              />
            </div>
          )}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" section="availability">
        <CheckboxOption
          value="inStock"
          label="In Stock Only"
          checked={filters.inStockOnly || false}
          onChange={(checked) => handleFilterChange("inStockOnly", checked)}
        />
      </FilterSection>

      {/* Discount */}
      <FilterSection title="Discount" section="discount">
        <RadioOption
          name="discount"
          value=""
          label="All discounts"
          checked={!filters.discount}
          onChange={(value) => handleFilterChange("discount", value || null)}
        />
        <RadioOption
          name="discount"
          value="10"
          label="10% off or more"
          checked={filters.discount === "10"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
        <RadioOption
          name="discount"
          value="20"
          label="20% off or more"
          checked={filters.discount === "20"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
        <RadioOption
          name="discount"
          value="30"
          label="30% off or more"
          checked={filters.discount === "30"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
        <RadioOption
          name="discount"
          value="40"
          label="40% off or more"
          checked={filters.discount === "40"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
        <RadioOption
          name="discount"
          value="50"
          label="50% off or more"
          checked={filters.discount === "50"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
        <RadioOption
          name="discount"
          value="60"
          label="60% off or more"
          checked={filters.discount === "60"}
          onChange={(value) => handleFilterChange("discount", value)}
        />
      </FilterSection>
    </div>
  );
}
