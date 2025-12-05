import {React, useEffect, useRef, useState} from "react";
import ProductSection from "../components/ProductSection.jsx";


export default function CollectionPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const didFetchRef = useRef(false); // <<< prevents API double-call

  // Map API product fields to expected format
  const transformProduct = (apiProduct) => {
    // Get first image URL or use placeholder - handle both string and object formats
    let imageURL = "https://picsum.photos/300/300?random=1";
    if (apiProduct.images && apiProduct.images.length > 0) {
      const firstImage = apiProduct.images[0];
      // If image is a string, use it directly
      if (typeof firstImage === 'string') {
        imageURL = firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage}`;
      }
      // If image is an object with url property, extract the URL
      else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
        const url = firstImage.url;
        imageURL = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      }
    }
    
    // Get discount percentage - use API discount field if available, otherwise calculate from listPrice and price
    let discount = "0% Off";
    if (apiProduct.discount && apiProduct.discount > 0) {
      // Use discount percentage directly from API
      discount = `${Math.round(apiProduct.discount)}% Off`;
    } else if (apiProduct.listPrice && apiProduct.price && apiProduct.listPrice > apiProduct.price) {
      // Calculate discount from listPrice and price
      discount = `${Math.round(((apiProduct.listPrice - apiProduct.price) / apiProduct.listPrice) * 100)}% Off`;
    }

    return {
      id: apiProduct._id || apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      mrp: apiProduct.listPrice || apiProduct.price,
      discount: discount,
      rating: apiProduct.rating || 4.5,
      reviews: apiProduct.reviews || 0,
      isFeatured: apiProduct.isFeatured || false,
      isCustomizable: apiProduct.isCustomizable || false,
      imageURL: imageURL,
      material: apiProduct.attributes?.material || apiProduct.attributes?.primaryMaterial || "resin",
      size: apiProduct.dimensions?.size || "medium",
      sizeDescription: apiProduct.dimensions?.sizeDescription || "6 in - 10 in",
      category: apiProduct.category?.name || "Uncategorized",
    };
  };

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

  // Fetch products and categories, then group by category
  const fetchData = async () => {
    try {
      // Fetch both products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("http://localhost:3000/api/v1/products"),
        fetch("http://localhost:3000/api/v1/products/categories")
      ]);

      if (!productsResponse.ok) throw new Error(`Products Error: ${productsResponse.status}`);
      if (!categoriesResponse.ok) throw new Error(`Categories Error: ${categoriesResponse.status}`);

      const productsResult = await productsResponse.json();
      const categoriesResult = await categoriesResponse.json();

      const apiProducts = productsResult.data || [];
      const categories = categoriesResult.data || [];

      // Transform products to expected format
      const transformedProducts = apiProducts.map(transformProduct);

      // Group products by category
      const productsByCategory = {};
      transformedProducts.forEach(product => {
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
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchData();
  }, []);

  if (loading) {
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
