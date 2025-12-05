import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ExploreCollections Page Component
 * 
 * Displays a visual grid of category cards in a mosaic layout.
 * First row: 3 cards, Second row: 2 cards
 * Clicking a card navigates to the filter page with that category selected.
 * 
 * For beginners:
 * - Uses useNavigate hook from React Router to navigate between pages
 * - Fetches categories from API
 * - Creates a responsive grid layout for displaying category cards
 * - Each card shows the category image, title, and subtitle
 */
export default function ExploreCollections() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const didFetchRef = useRef(false);

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

  // Fetch categories and products from API
  useEffect(() => {
    const fetchData = async () => {
      if (didFetchRef.current) return;
      didFetchRef.current = true;

      try {
        setLoading(true);
        // Fetch both categories and products in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch("http://localhost:3000/api/v1/products/categories"),
          fetch("http://localhost:3000/api/v1/products")
        ]);

        if (!categoriesResponse.ok) throw new Error(`Categories Error: ${categoriesResponse.status}`);
        if (!productsResponse.ok) throw new Error(`Products Error: ${productsResponse.status}`);

        const categoriesResult = await categoriesResponse.json();
        const productsResult = await productsResponse.json();

        const categories = categoriesResult.data || [];
        const products = productsResult.data || [];

        // Group products by category and create sections
        const sectionsArray = categories.map(category => {
          // Find products in this category
          const categoryProducts = products.filter(
            product => product.category?._id === category._id || product.category?.name === category.name
          );

          // Get first product image for category card
          let imageURL = "https://picsum.photos/300/300?random=1";
          if (categoryProducts.length > 0) {
            const firstProduct = categoryProducts[0];
            if (firstProduct.images && firstProduct.images.length > 0) {
              const firstImage = firstProduct.images[0];
              if (typeof firstImage === 'string') {
                imageURL = firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage}`;
              } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
                const url = firstImage.url;
                imageURL = url.startsWith('http') ? url : `http://localhost:3000${url}`;
              }
            }
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
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Navigate to filter page with selected category
   * @param {string} id - Category slug to filter by
   */
  const goToCategory = (id) => navigate(`/filter?category=${id}`);

  if (loading) {
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

  // Build rows following pattern [3, 2]
  const pattern = [3, 2];
  const rows = [];
  let start = 0;
  let pIndex = 0;
  
  while (start < sections.length && rows.length < 2) {
    const size = pattern[pIndex % pattern.length];
    rows.push(sections.slice(start, start + size));
    start += size;
    pIndex += 1;
  }

  /**
   * Category Card Component
   * Displays a single category card with image, title, and subtitle
   */
  const CategoryCard = ({ section, overlay = "top" }) => {
    const img = section?.imageURL || "https://picsum.photos/300/300?random=1";
    const title = section?.title || "Collection";
    const subtitle = section?.subtitle || "";
    const posClass = overlay === "bottom" ? "bottom-3" : "bottom-3 md:top-3";
    
    return (
      <button
        onClick={() => goToCategory(section?.id)}
        className="group relative rounded-xl overflow-hidden aspect-[4/3]"
      >
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className={`absolute ${posClass} left-3 right-3 text-white text-left`}>
          <div className="text-xl pb-2 !font-[500]">{title}</div>
          {subtitle && (
            <div className="text-sm opacity-90 line-clamp-2 leading-tight">{subtitle}</div>
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
        <div className="text-left md:text-center pb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {row1[0] && <CategoryCard section={row1[0]} overlay="top" />}
              {(() => {
                const mavale = sections.find((s) => s.id === "mavale") || row1[1];
                return mavale ? <CategoryCard section={mavale} overlay="bottom" /> : null;
              })()}
              {row1[2] && <CategoryCard section={row1[2]} overlay="top" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {row2[0] && <CategoryCard section={row2[0]} overlay="top" />}
              {row2[1] && <CategoryCard section={row2[1]} overlay="top" />}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
