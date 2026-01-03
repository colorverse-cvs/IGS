import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";

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
    const panelHeight = panelRect.height;

    // Always prefer opening below, only open above if not enough space
    let openUpward = false;
    if (spaceBelow < panelHeight + gap && spaceAbove > panelHeight + gap) {
      openUpward = true;
    }

    // Calculate position
    const desiredWidth = Math.min(
      panelRect.width,
      Math.max(120, viewportWidth - 16)
    );

    let left =
      align === "right" ? buttonRect.right - desiredWidth : buttonRect.left;
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, viewportWidth - desiredWidth - 8);
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    let top;
    if (openUpward) {
      top = buttonRect.top - panelHeight - gap;
      if (top < 8) top = 8; // Clamp to top of viewport
    } else {
      top = buttonRect.bottom + gap;
      if (top + panelHeight > viewport - 8) {
        top = viewport - panelHeight - 8; // Clamp to bottom of viewport
        if (top < buttonRect.bottom + gap) top = buttonRect.bottom + gap; // Don't overlap button
      }
    }

    setPanelSize({ width: desiredWidth });
    setPanelPosition({
      top: `${top}px`,
      bottom: "auto",
      left: `${left}px`,
    });
  }, [open, align]);

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
    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
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

  // Prevent background scroll when dropdown is open
  useEffect(() => {
    if (open) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [open]);

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
          className={`w-full text-left border rounded gap-2 px-3 py-1.5 border-gray-200 flex items-center justify-between bg-white ${
            disabled
              ? "opacity-60 cursor-not-allowed bg-gray-50"
              : "cursor-pointer"
          }`}
        >
          <span className="truncate text-sm text-gray-700">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${
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
          // style={{
          //   backgroundColor: "rgba(0, 0, 0, 0.1)",
          //   pointerEvents: "auto",
          // }}
          aria-label="Close dropdown overlay"
        />
      )}

      {/* Dropdown Panel - Use absolute for form mode, fixed for navigation mode */}
      {open && (
        <div
          ref={panelRef}
          onScroll={(e) => e.stopPropagation()}
          className={`${
            isFormMode ? "absolute" : "fixed"
          } rounded-md shadow-lg bg-white ring-1 ring-brand-600 ring-opacity-5 z-50`}
          style={(() => {
            if (!isFormMode) {
              return {
                top: panelPosition.top,
                left: panelPosition.left,
                width: panelSize.width ? `${panelSize.width}px` : undefined,
                maxWidth: "calc(100dvw - 16px)",
                pointerEvents: "auto",
              };
            }
            // Form mode: open above if not enough space below
            if (buttonRef.current && panelRef.current) {
              const inputRect = buttonRef.current.getBoundingClientRect();
              const panelHeight = panelRef.current.offsetHeight || 200;
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - inputRect.bottom;
              const spaceAbove = inputRect.top;
              // Prefer below, but open above if not enough space below and more space above
              if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
                return {
                  bottom: `100%`,
                  left: 0,
                  width: "100%",
                  marginBottom: 4,
                  pointerEvents: "auto",
                };
              }
            }
            // Default: open below
            return {
              top: "100%",
              left: 0,
              width: "100%",
              marginTop: 4,
              pointerEvents: "auto",
            };
          })()}
          role="menu"
        >
          {/* Form Mode: List of options */}
          {isFormMode && (
            <div className="">
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
                onScroll={(e) => e.stopPropagation()}
              >
                {visible.map((opt, idx) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={value === opt.value}
                    aria-disabled={opt.disabled}
                    className={`px-3 py-2 text-sm ${
                      opt.disabled
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : idx === highlight
                        ? "bg-brand-50 text-brand-700 cursor-pointer"
                        : "text-gray-700 cursor-pointer hover:bg-brand-50 hover:text-brand-700"
                    } ${idx === 0 ? "rounded-t-lg" : ""} ${
                      idx === visible.length - 1 ? "rounded-b-lg" : ""
                    }`}
                    onMouseEnter={() => !opt.disabled && setHighlight(idx)}
                    onClick={() => {
                      if (opt.disabled) return;
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
          {!isFormMode && children && (
            <div
              className=""
              onClick={(e) => {
                // Prevent clicks inside the panel from closing the dropdown
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                // Prevent mousedown from triggering click-outside handler
                e.stopPropagation();
              }}
            >
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
