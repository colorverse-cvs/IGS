import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Dropdown - Unified dropdown component for forms and navigation
 *
 * Two modes:
 * 1. Form Select: Pass options array, value, onChange - renders select dropdown
 * 2. Navigation Dropdown: Pass trigger function, children - renders custom content
 *
 * Features:
 * - Smart positioning: opens in available space (top/bottom)
 * - Fixed positioning: prevents parent container scrollbars
 * - Prevents body overflow when dropdown is open
 */
export default function Dropdown({
  // Form mode props
  options = [],
  value,
  onChange,
  placeholder = "Select",
  searchable = false,
  name,
  disabled = false,

  // Navigation mode props
  trigger,
  children,
  isOpen,
  onToggle,
  align = "left",

  // Common props
  className = "",
  id,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [panelPosition, setPanelPosition] = useState({
    top: "auto",
    bottom: "auto",
    left: 0,
  });
  const [panelSize, setPanelSize] = useState({ width: null });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  // Use external isOpen/onToggle if provided (navigation mode), otherwise use internal state (form mode)
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onToggle !== undefined ? onToggle : setInternalOpen;

  // Form mode: normalize options
  const isFormMode = options.length > 0 && onChange !== undefined;
  const normalized = isFormMode
    ? options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      )
    : [];

  const selected = isFormMode
    ? normalized.find((o) => o.value === value) || null
    : null;

  // Calculate panel position (top/bottom) based on available viewport space
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !panelRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const viewport = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const gap = 8; // gap between button and panel

    // Calculate space available
    const spaceBelow = viewport - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Determine if panel should open upward or downward
    const openUpward =
      spaceBelow < panelRect.height + gap && spaceAbove > spaceBelow;

    // Calculate position
    // Determine desired width: don't exceed viewport minus small margin
    const desiredWidth = Math.min(
      panelRect.width,
      Math.max(120, viewportWidth - 16)
    );

    // Compute left aligned value based on `align`, then clamp horizontally
    let left =
      align === "right" ? buttonRect.right - desiredWidth : buttonRect.left;
    const minLeft = 8; // 8px margin from screen edge
    const maxLeft = Math.max(minLeft, viewportWidth - desiredWidth - 8);
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    const top = openUpward
      ? buttonRect.top - panelRect.height - gap
      : buttonRect.bottom + gap;

    setPanelSize({ width: desiredWidth });
    setPanelPosition({
      top: `${top}px`,
      bottom: "auto",
      left: `${left}px`,
    });
  }, [open, align]);

  // Prevent body overflow when dropdown is open
  useEffect(() => {
    if (open) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, setOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  useEffect(() => {
    if (open && isFormMode) setHighlight(0);
  }, [open, filter, isFormMode]);

  const visible = isFormMode
    ? normalized.filter((o) =>
        o.label.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  const onKeyDown = (e) => {
    if (!open || !isFormMode) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = visible[highlight];
      if (opt) {
        onChange?.(opt.value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      onKeyDown={onKeyDown}
    >
      {/* Trigger: always render (form-mode button OR custom trigger) */}
      {!isFormMode && trigger && (
        <div ref={buttonRef} onClick={() => setOpen((v) => !v)}>
          {trigger(open)}
        </div>
      )}

      {isFormMode && !trigger && (
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={id}
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          className={`w-full text-left border rounded px-3 py-2 border-gray-200 flex items-center justify-between bg-white ${
            disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
          }`}
        >
          <span className="truncate text-sm text-gray-700">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`ml-2 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      )}

      {/* Background Overlay - Prevents scrolling and closes dropdown on click */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            pointerEvents: "auto",
          }}
          aria-label="Close dropdown overlay"
        />
      )}

      {/* Dropdown Panel - Fixed positioning to avoid scrollbars */}
      {open && (
        <div
          ref={panelRef}
          className="fixed rounded-md shadow-lg bg-white ring-1 ring-purple-600 ring-opacity-5 z-50"
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelSize.width ? `${panelSize.width}px` : undefined,
            maxWidth: "calc(100vw - 16px)",
            pointerEvents: "auto",
          }}
          role="menu"
        >
          {/* Form Mode: List of options */}
          {isFormMode && (
            <div className="p-2">
              {searchable && (
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 border rounded mb-2 text-sm border-gray-200"
                  autoFocus
                />
              )}
              <ul
                role="listbox"
                aria-activedescendant={visible[highlight]?.value}
                tabIndex={-1}
                className="max-h-56 overflow-auto"
              >
                {visible.map((opt, idx) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={value === opt.value}
                    className={`px-3 py-2 text-sm text-gray-700 cursor-pointer ${
                      idx === highlight
                        ? "bg-purple-50 text-brand-700"
                        : "hover:bg-purple-50 hover:text-brand-700"
                    }`}
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
                {visible.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    No options
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Navigation Mode: Custom children */}
          {!isFormMode && children && <div className="py-1">{children}</div>}
        </div>
      )}
    </div>
  );
}
