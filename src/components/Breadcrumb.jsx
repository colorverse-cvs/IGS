import React from "react";
import { Link } from "react-router-dom";

/**
 * Breadcrumb Component - Navigation path display
 * 
 * Props:
 * - items: Array of { label: string, link?: string }
 *   - label: Text to display
 *   - link: (optional) URL path - if provided, renders as Link, else plain text
 * 
 * Features:
 * - Shows navigation path with ">" separators between items
 * - Last item is bold (current page, no link)
 * - Earlier items are clickable links for navigation
 * 
 * Example:
 * <Breadcrumb items={[
 *   { label: "Home", link: "/" },
 *   { label: "Products", link: "/filter" },
 *   { label: "Statues" }  // Current page
 * ]} />
 * 
 * For beginners:
 * - Returns null if items array is empty (no breadcrumb shown)
 * - Uses React Router Link for navigation
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white">
      <div className="container mx-auto py-2">
        <nav className="text-sm text-gray-600">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {/* Separator ">" between items */}
              {index > 0 && <span className="mx-2">&gt;</span>}
              {/* Render as Link if path provided, else plain text */}
              {item.link ? (
                <Link to={item.link} className="hover:text-purple-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
