import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";

// Responsive 3-cards first row, 2-cards second row grid
export default function CategoryMosaic() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products: allProducts, status } = useSelector((state) => state.products);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch products if not already loaded
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Map category names to slugs for navigation
  const getCategorySlug = (categoryName) => {
    const categoryMap = {
      "Chhatrapati Shivaji Maharaj Statues": "shivaji",
      "Mavale Statues": "mavale",
      "God Statues": "god-statues",
      "Home Decor": "home-decor",
      "Motivational Statues": "motivational",
    };
    return categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/products/categories`);
        if (!response.ok) throw new Error(`Categories Error: ${response.status}`);
        const result = await response.json();
        setCategories(result.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Group products by category and create sections when products and categories are loaded
  useEffect(() => {
    if (allProducts.length === 0 || categories.length === 0) return;

    // Group products by category and create sections
    const sectionsArray = categories.map(category => {
      // Find products in this category (using transformed products from Redux)
      const categoryProducts = allProducts.filter(
        product => product.category === category.name || product.categoryName === category.name
      );

      // Get first product image for category card
      let imageURL = "https://picsum.photos/300/300?random=1";
      if (categoryProducts.length > 0) {
        imageURL = categoryProducts[0].imageURL || imageURL;
      }

      return {
        id: getCategorySlug(category.name),
        title: category.name,
        subtitle: category.description || `Explore our collection of ${category.name.toLowerCase()}`,
        imageURL: imageURL,
        products: categoryProducts
      };
    });

    setSections(sectionsArray);
  }, [allProducts, categories]);

  const goTo = (id) => navigate(`/filter?category=${id}`);

  if (status === 'loading') {
    return (
      <section>
        <div className="container mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading collections...</p>
          </div>
        </div>
      </section>
    );
  }

  // Build rows following pattern [3, 2, 3, 2, ...]
  const pattern = [3, 2];
  const rows = [];
  let start = 0;
  let pIndex = 0;
  while (start < sections.length && rows.length < 2) {
    // exactly first 2 rows per spec
    const size = pattern[pIndex % pattern.length];
    rows.push(sections.slice(start, start + size));
    start += size;
    pIndex += 1;
  }

  const Card = ({ section, overlay = "top" }) => {
    const img = section?.imageURL || "https://picsum.photos/300/300?random=1";
    const title = section?.title || "Collection";
    const subtitle = section?.subtitle || "";
    const posClass = overlay === "bottom" ? "bottom-3" : "top-3";
    return (
      <button
        onClick={() => goTo(section?.id)}
        className="group relative rounded-xl overflow-hidden aspect-[4/3]"
      >
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className={`absolute ${posClass} left-3 right-3 text-white text-left`}
        >
          <div className="text-md font-bold leading-tight">{title}</div>
          {subtitle && (
            <div className="text-sm opacity-90 line-clamp-2">{subtitle}</div>
          )}
        </div>
      </button>
    );
  };

  const row1 = rows[0] || [];
  const row2 = rows[1] || [];

  return (
    <section>
      <div className="container mx-auto">
        <div className="text-center py-12">
          <h2 className="text-4xl md:text-5xl   font-bold text-gray-900 mb-4">
            Explore Our Curated Collections
          </h2>
          <p className="text-gray-600 text-sm">
            Browse masterfully crafted sculptures, categorized to perfectly
            complement your unique taste, space, and occasions.
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No collections available
          </div>
        ) : (
          <>
            {/* First row: 3 cards with top, bottom, top overlays.
                Middle card replaced with Mavale category (opens mavale filter). */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {row1[0] && <Card section={row1[0]} overlay="top" />}
              {(() => {
                const mavale = sections.find((s) => s.id === "mavale") || row1[1];
                return mavale ? <Card section={mavale} overlay="bottom" /> : null;
              })()}
              {row1[2] && <Card section={row1[2]} overlay="top" />}
            </div>

            {/* Second row: 2 cards, both top aligned */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {row2[0] && <Card section={row2[0]} overlay="top" />}
              {row2[1] && <Card section={row2[1]} overlay="top" />}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
