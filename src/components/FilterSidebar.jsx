import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

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

  const sidebarRef = useRef(null);

  const handleFilterChange = (filterType, value) => {
    // Preserve sidebar scroll position across parent updates which may re-render
    const prev = sidebarRef.current ? sidebarRef.current.scrollTop : 0;
    // If user selected custom pricing, ensure the price section is expanded immediately
    if (filterType === "priceRange" && value === "custom") {
      setExpandedSections((prev) => ({ ...prev, price: true }));
    }
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
    // restore after next paint(s)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = prev;
      })
    );
  };

  const handleMultiSelectChange = (filterType, value) => {
    // Ensure we treat the current filter value as an array whether
    // the parent passed a single string (backwards compatibility) or an array.
    const raw = filters[filterType];
    const currentValues = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    // If newValues is empty, set to null (meaning "no filter applied")
    // Otherwise, keep as array for multi-select
    const filterValue = newValues.length > 0 ? newValues : null;

    const prev = sidebarRef.current ? sidebarRef.current.scrollTop : 0;
    // Apply filter immediately on click
    onFiltersChange({
      ...filters,
      [filterType]: filterValue,
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = prev;
      })
    );
  };

  // Which thumb is currently active (being dragged or focused) - helps with z-index so
  // the active thumb is on top and can be dragged even when thumbs are close.
  const [activeThumb, setActiveThumb] = useState(null); // 'min' | 'max' | null

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3 cursor-pointer"
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
        className="mr-3"
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
        className="mr-3"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div
      ref={sidebarRef}
      className={`${
        isMobile
          ? "p-4"
          : "xl:w-70 w-70 bg-white py-6 px-4 border-r border-gray-200 h-[88dvh]"
      } overflow-y-auto`}
    >
      {/* Inline styles for checkboxes, radio buttons, and custom dual-range slider */}
      <style>{`
        /* Price range slider styles */
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
          background: #9333ea;
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
          width: 18px;
          height: 18px;
          background: white;
          border: 2px solid #9333ea;
          border-radius: 50%;
          margin-top: -7px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          position: relative;
          z-index: 3;
        }
        .price-range-input::-webkit-slider-thumb:hover {
          border-color: #7e22ce;
          box-shadow: 0 2px 6px rgba(147, 51, 234, 0.3);
        }
        .price-range-input::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }
        .price-range-input::-moz-range-track {
          height: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border: 2px solid #9333ea;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .price-range-input::-moz-range-thumb:hover {
          border-color: #7e22ce;
          box-shadow: 0 2px 6px rgba(147, 51, 234, 0.3);
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
        .price-range-input:focus::-webkit-slider-thumb {
          outline: 2px solid #c084fc;
          outline-offset: 2px;
        }
        .range-slider {
          position: relative;
          height: 40px;
          width: 100%;
          margin: 12px 0;
        }
        .range-slider[data-disabled="true"] {
          opacity: 0.4;
          pointer-events: none;
        }
        .range-slider[data-disabled="true"] .price-range-progress {
          background: #d1d5db;
        }
        .range-slider[data-disabled="true"] .price-range-input::-webkit-slider-thumb {
          border-color: #d1d5db;
        }
        .range-slider[data-disabled="true"] .price-range-input::-moz-range-thumb {
          border-color: #d1d5db;
        }
      `}</style>

      {!isMobile && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-gray-900">
            Filter Products
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center cursor-pointer"
          >
            <X size={14} className="mr-1" />
            Reset filters
          </button>
        </div>
      )}

      {/* Theme/Category */}
      <FilterSection title="Theme / Category" section="category">
        {/* Convert category filter to multi-select checkboxes. */}
        <CheckboxOption
          value="shivaji"
          label="Chhatrapati Shivaji Maharaj Statues"
          checked={
            Array.isArray(filters.category)
              ? filters.category.includes("shivaji")
              : filters.category === "shivaji"
          }
          onChange={(checked) => handleMultiSelectChange("category", "shivaji")}
        />
        <CheckboxOption
          value="mavale"
          label="Mavale Statues"
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
        <CheckboxOption
          value="x-large"
          label="Extra Large (Above 15 in)"
          checked={
            Array.isArray(filters.size)
              ? filters.size.includes("x-large")
              : filters.size === "x-large"
          }
          onChange={(checked) => handleMultiSelectChange("size", "x-large")}
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
          onChange={(value) => {
            handleFilterChange("priceRange", value);
            // Initialize min/max prices if not set when custom pricing is selected
            // if (value === "custom") {
            //   if (!filters.minPrice && filters.minPrice !== 0) {
            //     handleFilterChange("minPrice", 0);
            //   }
            //   if (!filters.maxPrice && filters.maxPrice !== 4000) {
            //     handleFilterChange("maxPrice", 4000);
            //   }
            // }
          }}
        />

        {filters.priceRange === "custom" && (
          <div className="mt-3 space-y-4">
            {/* Current Selected Values (below slider) */}
            <div className="flex justify-between text-xs text-gray-600 px-1 m-0">
              <span>
                ₹
                {filters.minPrice !== undefined && filters.minPrice !== ""
                  ? filters.minPrice
                  : 0}
              </span>
              <span>
                ₹
                {filters.maxPrice !== undefined && filters.maxPrice !== ""
                  ? filters.maxPrice
                  : 4000}
              </span>
            </div>
            {/* Dual-handle Price Range Slider */}
            <div className="range-slider !m-0" data-disabled={false}>
              {(() => {
                const min = 0;
                const max = 4000;
                const step = 50;
                const curMin =
                  filters.minPrice !== undefined && filters.minPrice !== ""
                    ? Number(filters.minPrice)
                    : 0;
                const curMax =
                  filters.maxPrice !== undefined && filters.maxPrice !== ""
                    ? Number(filters.maxPrice)
                    : 4000;
                const minPercent = Math.max(
                  0,
                  Math.min(100, (curMin / max) * 100)
                );
                const maxPercent = Math.max(
                  0,
                  Math.min(100, (curMax / max) * 100)
                );

                const handleMinChange = (e) => {
                  const value = Number(e.target.value);
                  const currentMax =
                    filters.maxPrice !== undefined && filters.maxPrice !== ""
                      ? Number(filters.maxPrice)
                      : max;
                  const newMin = Math.min(value, currentMax - step);
                  if (newMin >= 0 && newMin <= max) {
                    handleFilterChange("minPrice", newMin);
                  }
                };

                const handleMaxChange = (e) => {
                  const value = Number(e.target.value);
                  const currentMin =
                    filters.minPrice !== undefined && filters.minPrice !== ""
                      ? Number(filters.minPrice)
                      : min;
                  const newMax = Math.max(value, currentMin + step);
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
            </div>

            {/* Manual Input Fields */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Min price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={(e) => {
                    const v =
                      e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    handleFilterChange("minPrice", v);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-500 focus:ring-1 focus:ring-brand-300 focus:outline-none focus:border-transparent"
                  min="100"
                  max="4000"
                  step="10"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Max price
                </label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ""}
                  onChange={(e) => {
                    const v =
                      e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    handleFilterChange("maxPrice", v);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-500 focus:ring-1 focus:ring-brand-300 focus:outline-none focus:border-transparent"
                  min="0"
                  max="4000"
                  step="10"
                />
              </div>
            </div>
          </div>
        )}
      </FilterSection>

      {/* Availability */}
      {/* <FilterSection title="Availability" section="availability">
        <CheckboxOption
          value="inStock"
          label="In Stock Only"
          checked={filters.inStockOnly || false}
          onChange={(checked) => handleFilterChange("inStockOnly", checked)}
        />
      </FilterSection> */}

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
        <div className="sticky bottom-0 bg-white py-4 flex gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center w-[50%] justify-center border border-gray-300 hover:border-brand-500 rounded-lg px-4 py-3 cursor-pointer"
          >
            <X size={14} className="mr-1" />
            Reset filters
          </button>
          <button
            type="button"
            onClick={onApplyFilters}
            className="w-[50%] px-4 py-3 bg-brand-700 text-white rounded-lg font-semibold hover:bg-brand-800 transition cursor-pointer"
          >
            Show Results
          </button>
        </div>
      )}
    </div>
  );
}
