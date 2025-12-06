import { React, useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import ProductSection from "../components/ProductSection.jsx";
import { fetchProducts } from "../features/products/productSlice";

export default function CollectionPage() {
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

  // Products are already transformed in Redux store, so we can use them directly
  // But we need to group them by category
  useEffect(() => {
    if (allProducts.length === 0 || categories.length === 0) return;

    // Group products by category
    const productsByCategory = {};
    allProducts.forEach(product => {
      const categoryName = product.category || "Uncategorized";
      if (!productsByCategory[categoryName]) {
        productsByCategory[categoryName] = [];
      }
      productsByCategory[categoryName].push(product);
    });

    // Create sections array from grouped products
    const sectionsArray = Object.keys(productsByCategory).map(categoryName => {
      const metadata = getCategoryMetadata(categoryName, categories);
      return {
        id: metadata.id,
        title: metadata.title,
        subtitle: metadata.subtitle,
        products: productsByCategory[categoryName]
      };
    });

    setSections(sectionsArray);
  }, [allProducts, categories]);

  // Get category metadata (title, subtitle) - fallback to category name if not available
  const getCategoryMetadata = (categoryName, categories) => {
    // Try to find category in fetched categories
    const category = categories.find(c => c.name === categoryName);

    // Map category names to section metadata (matching old structure)
    const categoryMetadata = {
      "Chhatrapati Shivaji Maharaj Statues": {
        id: "shivaji",
        title: "Chhatrapati Shivaji Maharaj Statues",
        subtitle: "Iconic warrior king in detailed miniature form."
      },
      "Mavale Statues": {
        id: "mavale",
        title: "Mavale Statues",
        subtitle: "Brave companions of Shivaji Maharaj, finely sculpted collectibles."
      },
      "God Statues": {
        id: "god-statues",
        title: "God Statues",
        subtitle: "Sacred idols crafted for devotion and gifting."
      },
      "Home Decor": {
        id: "home-decor",
        title: "Home Decor",
        subtitle: "Art pieces designed to elevate and transform any interior space."
      },
      "Motivational Statues": {
        id: "motivational",
        title: "Motivational Statues",
        subtitle: "Inspiring figures symbolizing courage, leadership, and strength."
      }
    };

    // Return metadata if found, otherwise use category name as title
    return categoryMetadata[categoryName] || {
      id: categoryName.toLowerCase().replace(/\s+/g, "-"),
      title: categoryName,
      subtitle: `Explore our collection of ${categoryName.toLowerCase()}`
    };
  };


  if (status === 'loading') {
    return (
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container py-6 mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-15 lg:px-20">
      <div className="container py-6 mx-auto">
        <section className="container mx-auto pt-12 pb-12">
          <div className="text-left md:text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-gray-600 text-sm">
              Our most popular and highest-rated statues
            </p>
          </div>
        </section>

        {sections.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No products available
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} id={`section-${section.id}`}>
              <ProductSection
                title={section.title}
                subtitle={section.subtitle}
                products={section.products}
                showViewMore={true}
                maxItems={4}
                categoryId={section.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
