import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white">
      <div className="container mx-auto py-2">
        <nav className="text-sm text-gray-600">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2">&gt;</span>}
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
