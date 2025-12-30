import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSearchDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  searchable = true,
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openAbove, setOpenAbove] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const normalized = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selected = normalized.find((o) => o.value === value) || null;

  // Filtered Options
  const visibleOptions = normalized.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Detect open direction
  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setOpenAbove(spaceBelow < 200 && spaceAbove > spaceBelow);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between bg-white border rounded px-3 py-2 text-sm
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                border-gray-300`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`absolute left-0 w-full bg-white border border-gray-200 rounded ring-1 ring-brand-600 ring-opacity-5 shadow-lg z-50 focus:outline-none
                    ${openAbove ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {/* Search box */}
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="
                                w-full px-3 py-2 border-b border-gray-300 text-sm outline-none
                            "
            />
          )}

          <ul className="max-h-60 overflow-y-auto">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((opt) => (
                <li
                  key={opt.value}
                  className="px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700 cursor-pointer"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
