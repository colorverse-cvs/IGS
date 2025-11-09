import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

/**
 * FilterSidebar component with collapsible filter sections
 * Props:
 * - filters: object with current filter values
 * - onFiltersChange: function to update filters
 * - onResetFilters: function to reset all filters
 * - isMobile: boolean - if true, renders in mobile drawer mode
 * - onApplyFilters: function - called when "Show Results" is clicked (mobile only)
 */
export default function FilterSidebar({
  filters,
  onFiltersChange,
  onResetFilters,
  isMobile = false,
  onApplyFilters,
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
    // Ensure we treat the current filter value as an array whether
    // the parent passed a single string (backwards compatibility) or an array.
    const raw = filters[filterType];
    const currentValues = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    // If newValues is empty, keep it as an empty array (meaning "no specific selection").
    onFiltersChange({
      ...filters,
      [filterType]: newValues,
    });
  };

  // Which thumb is currently active (being dragged or focused) - helps with z-index so
  // the active thumb is on top and can be dragged even when thumbs are close.
  const [activeThumb, setActiveThumb] = useState(null); // 'min' | 'max' | null

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        type="button"
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
    <label className="flex items-center mb-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="w-4 h-4 mr-3 text-purple-600 focus:ring-2 focus:ring-purple-300 focus:ring-offset-0"
      />
      <span className="text-base text-gray-900">{label}</span>
    </label>
  );

  const CheckboxOption = ({ value, label, checked, onChange }) => (
    <label className="flex items-center mb-2 cursor-pointer">
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2 text-purple-600 focus:ring-brand-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div
      className={`${
        isMobile
          ? "p-4"
          : "xl:w-70 w-70 bg-white py-6 px-4 border-r border-gray-200 h-[88vh]"
      } overflow-y-auto`}
    >
      {/* Inline styles for the custom dual-range slider */}
      <style>{`
        .price-range-track {
          height: 4px;
          width: 100%;
          background: #e5e7eb;
          position: absolute;
          border-radius: 4px;
          top: 50%;
          transform: translateY(-50%);
        }
        .price-range-progress {
          height: 100%;
          background: #7c3aed;
          position: absolute;
          border-radius: 4px;
        }
        .price-range-input {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: all;
        }
        .price-range-input::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #7c3aed;
          border-radius: 50%;
          margin-top: -8px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
        }
        .price-range-input::-moz-range-track {
          height: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .price-range-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #7c3aed;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .price-range-input:focus {
          outline: none;
        }
        .price-range-input.min {
          z-index: 3;
        }
        .price-range-input.max {
          z-index: 2;
        }
        .price-range-input:focus {
          outline: none;
        }
        .range-slider {
          position: relative;
          height: 40px;
          width: 100%;
        }
        .range-slider[data-disabled="true"] {
          opacity: 0.4;
          pointer-events: none;
        }
      `}</style>
      {!isMobile && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter Products
          </h2>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
          >
            <X size={14} className="mr-1" />
            Reset filters
          </button>
        </div>
      )}

      {isMobile && (
        <div className="mb-4">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
          >
            <X size={14} className="mr-1" />
            Reset filters
          </button>
        </div>
      )}

      {/* Theme/Category */}
      <FilterSection title="Theme/Category" section="category">
        {/* Convert category filter to multi-select checkboxes. */}
        <CheckboxOption
          value="shivaji"
          label="Chhatrapati Shivaji Maharaj"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("shivaji")
              : filters.category === "shivaji"
          }
          onChange={(checked) => handleMultiSelectChange("category", "shivaji")}
        />
        <CheckboxOption
          value="mavale"
          label="Mavale"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("mavale")
              : filters.category === "mavale"
          }
          onChange={(checked) => handleMultiSelectChange("category", "mavale")}
        />
        <CheckboxOption
          value="god-statues"
          label="God Statues"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("god-statues")
              : filters.category === "god-statues"
          }
          onChange={(checked) =>
            handleMultiSelectChange("category", "god-statues")
          }
        />
        <CheckboxOption
          value="motivational"
          label="Motivational Statues"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("motivational")
              : filters.category === "motivational"
          }
          onChange={(checked) =>
            handleMultiSelectChange("category", "motivational")
          }
        />
        <CheckboxOption
          value="home-decor"
          label="Home Decor"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("home-decor")
              : filters.category === "home-decor"
          }
          onChange={(checked) =>
            handleMultiSelectChange("category", "home-decor")
          }
        />
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material" section="material">
        {/* Multi-select materials */}
        <CheckboxOption
          value="marble"
          label="Marble"
          checked={
            Array.isArray(filters.material)
              ? filters.material.includes("marble")
              : filters.material === "marble"
          }
          onChange={(checked) => handleMultiSelectChange("material", "marble")}
        />
        <CheckboxOption
          value="resin"
          label="Resin"
          checked={
            Array.isArray(filters.material)
              ? filters.material.includes("resin")
              : filters.material === "resin"
          }
          onChange={(checked) => handleMultiSelectChange("material", "resin")}
        />
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size" section="size">
        {/* Multi-select sizes */}
        <CheckboxOption
          value="small"
          label="Small (under 6 in)"
          checked={
            Array.isArray(filters.size)
              ? filters.size.includes("small")
              : filters.size === "small"
          }
          onChange={(checked) => handleMultiSelectChange("size", "small")}
        />
        <CheckboxOption
          value="medium"
          label="Medium (6 in - 10 in)"
          checked={
            Array.isArray(filters.size)
              ? filters.size.includes("medium")
              : filters.size === "medium"
          }
          onChange={(checked) => handleMultiSelectChange("size", "medium")}
        />
        <CheckboxOption
          value="large"
          label="Large (above 10 in)"
          checked={
            Array.isArray(filters.size)
              ? filters.size.includes("large")
              : filters.size === "large"
          }
          onChange={(checked) => handleMultiSelectChange("size", "large")}
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
          {/* Dual-handle Price Range Slider */}
          <div className="space-y-2">
            {filters.priceRange === "custom" && (
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>₹0</span>
                <span>₹4,000+</span>
              </div>
            )}

            <div
              className="range-slider"
              data-disabled={filters.priceRange !== "custom"}
            >
              {(() => {
                const min = 0;
                const max = 4000;
                const step = 100;
                const curMin = Number(filters.minPrice) || 0;
                const curMax = Number(filters.maxPrice) || 4000;
                const minPercent = (curMin / max) * 100;
                const maxPercent = (curMax / max) * 100;

                const handleMinChange = (e) => {
                  if (filters.priceRange !== "custom") return;
                  const value = Number(e.target.value);
                  // Ensure min price doesn't exceed max price - step
                  const newMin = Math.min(
                    value,
                    (Number(filters.maxPrice) || max) - step
                  );
                  if (newMin >= 0 && newMin <= max) {
                    handleFilterChange("minPrice", newMin);
                  }
                };

                const handleMaxChange = (e) => {
                  if (filters.priceRange !== "custom") return;
                  const value = Number(e.target.value);
                  // Ensure max price doesn't go below min price + step
                  const newMax = Math.max(
                    value,
                    (Number(filters.minPrice) || min) + step
                  );
                  if (newMax >= 0 && newMax <= max) {
                    handleFilterChange("maxPrice", newMax);
                  }
                };

                return (
                  <>
                    <div className="price-range-track">
                      <div
                        className="price-range-progress"
                        style={{
                          left: `${minPercent}%`,
                          right: `${100 - maxPercent}%`,
                        }}
                      />
                    </div>

                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={curMin}
                      onChange={handleMinChange}
                      className="price-range-input min"
                      disabled={filters.priceRange !== "custom"}
                      onMouseDown={() => setActiveThumb("min")}
                      onTouchStart={() => setActiveThumb("min")}
                      onFocus={() => setActiveThumb("min")}
                      onMouseUp={() => setActiveThumb(null)}
                      onTouchEnd={() => setActiveThumb(null)}
                      onBlur={() => setActiveThumb(null)}
                      style={{ zIndex: activeThumb === "min" ? 4 : 2 }}
                    />

                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={curMax}
                      onChange={handleMaxChange}
                      className="price-range-input max"
                      disabled={filters.priceRange !== "custom"}
                      onMouseDown={() => setActiveThumb("max")}
                      onTouchStart={() => setActiveThumb("max")}
                      onFocus={() => setActiveThumb("max")}
                      onMouseUp={() => setActiveThumb(null)}
                      onTouchEnd={() => setActiveThumb(null)}
                      onBlur={() => setActiveThumb(null)}
                      style={{ zIndex: activeThumb === "max" ? 4 : 2 }}
                    />
                  </>
                );
              })()}

              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>₹{filters.minPrice || 0}</span>
                <span>₹{filters.maxPrice || 4000}</span>
              </div>
            </div>

            {/* Manual Input Fields - Only when custom pricing is selected */}
            {filters.priceRange === "custom" && (
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ""}
                  onChange={(e) => {
                    const v =
                      e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    handleFilterChange("minPrice", v);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-500"
                  min="0"
                  max="4000"
                  step="100"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ""}
                  onChange={(e) => {
                    const v =
                      e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    handleFilterChange("maxPrice", v);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-500"
                  min="0"
                  max="4000"
                  step="100"
                />
              </div>
            )}
          </div>
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
        {/* Multi-select discounts */}
        <CheckboxOption
          value="10"
          label="10% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("10")
              : filters.discount === "10"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "10")}
        />
        <CheckboxOption
          value="20"
          label="20% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("20")
              : filters.discount === "20"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "20")}
        />
        <CheckboxOption
          value="30"
          label="30% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("30")
              : filters.discount === "30"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "30")}
        />
        <CheckboxOption
          value="40"
          label="40% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("40")
              : filters.discount === "40"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "40")}
        />
        <CheckboxOption
          value="50"
          label="50% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("50")
              : filters.discount === "50"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "50")}
        />
        <CheckboxOption
          value="60"
          label="60% off or more"
          checked={
            Array.isArray(filters.discount)
              ? filters.discount.includes("60")
              : filters.discount === "60"
          }
          onChange={(checked) => handleMultiSelectChange("discount", "60")}
        />
      </FilterSection>

      {/* Mobile "Show Results" Button */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-4 -mx-4">
          <button
            type="button"
            onClick={onApplyFilters}
            className="w-full px-4 py-3 bg-brand-700 text-white rounded-lg font-semibold hover:bg-brand-800 transition"
          >
            Show Results
          </button>
        </div>
      )}
    </div>
  );
}
