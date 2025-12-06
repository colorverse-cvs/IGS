import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../utils/constants";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductMoreInfoPage from "./ProductMoreInfoPage";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { Star, Banknote, Truck, ShieldCheck, ShoppingCart } from "lucide-react";
import aboutDefaults from "../data/aboutDefaults.json";
import Breadcrumb from "../components/Breadcrumb.jsx";


export default function ProductInfoPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState("marble");
  const [selectedSize, setSelectedSize] = useState("small");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("idle");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const didFetchRef = useRef(false);

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Transform API product to expected format
  const transformProduct = (apiProduct) => {
    if (!apiProduct) return null;

    // Get images - handle both string arrays and object arrays
    let images = [];
    if (apiProduct.images && apiProduct.images.length > 0) {
      images = apiProduct.images.map((img) => {
        // If image is a string, use it directly
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `${BASE_URL}${img}`;
        }
        // If image is an object with url property, extract the URL
        if (img && typeof img === 'object' && img.url) {
          const url = img.url;
          return url.startsWith('http') ? url : `${BASE_URL}${url}`;
        }
        // Fallback
        return img;
      });
    } else {
      images = ["https://picsum.photos/300/300?random=1"];
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

    // Get category slug
    const categoryName = apiProduct.category?.name || "Uncategorized";
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

    return {
      id: apiProduct._id || apiProduct.id,
      name: apiProduct.name,
      title: apiProduct.name,
      price: apiProduct.price,
      mrp: apiProduct.listPrice || apiProduct.price,
      discount: discount,
      rating: apiProduct.rating || 4.5,
      reviews: apiProduct.reviews || 0,
      isFeatured: apiProduct.isFeatured || false,
      isCustomizable: apiProduct.isCustomizable || false,
      imageURL: images[0] || "https://picsum.photos/300/300?random=1",
      images: images,
      material: apiProduct.attributes?.material || apiProduct.attributes?.primaryMaterial || "resin",
      primaryMaterial: apiProduct.attributes?.primaryMaterial,
      size: apiProduct.dimensions?.size || "medium",
      sizeDescription: apiProduct.dimensions?.sizeDescription || "6 in - 10 in",
      category: categoryName,
      categoryId: categorySlug,
      categoryName: categoryName,
      weight: apiProduct.weight,
      dimensions: apiProduct.dimensions?.sizeDescription,
      finish: apiProduct.attributes?.finish,
      origin: apiProduct.attributes?.origin,
      description: apiProduct.description,
    };
  };

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (didFetchRef.current) return;
      didFetchRef.current = true;

      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/v1/products/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setProduct(null);
            setLoading(false);
            return;
          }
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        const transformedProduct = transformProduct(result.data);
        setProduct(transformedProduct);

        // Set default material and size from product if available
        if (transformedProduct?.material) {
          setSelectedMaterial(transformedProduct.material.toLowerCase());
        }
        if (transformedProduct?.size) {
          setSelectedSize(transformedProduct.size.toLowerCase());
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Reset fetch ref when id changes
    return () => {
      didFetchRef.current = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center mt-10 text-gray-500">Product not found.</div>
    );
  }

  const categorySlug = product.categoryId || (product.category || "").toLowerCase().replace(/\s+/g, "-");

  const title = product.name || product.title || "Product";
  const imageSrc = product.imageURL || product.image;
  const mrp = product.mrp;
  const discount = product.discount;
  const rating = product.rating;
  const reviews = product.reviews;
  const isCustomizable = product.isCustomizable;
  const isFeatured = product.isFeatured;

  // Images: prefer product.images from JSON if present
  const productImages =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [
        imageSrc,
        `https://picsum.photos/300/300?random=${product.id}-1`,
        `https://picsum.photos/300/300?random=${product.id}-2`,
      ];

  const currentImage = productImages[selectedImageIndex];

  const handleCheckDelivery = () => {
    const pin = pincode.replace(/\D/g, "");
    if (pin.length !== 6) {
      setPincodeStatus("invalid");
      setDeliveryEstimate("");
      return;
    }
    const prefix = parseInt(pin.slice(0, 2), 10);
    const serviceable =
      (prefix >= 40 && prefix <= 49) ||
      (prefix >= 56 && prefix <= 59) ||
      (prefix >= 60 && prefix <= 69);
    if (!serviceable) {
      setPincodeStatus("no-service");
      setDeliveryEstimate("");
      return;
    }
    const eta = new Date();
    eta.setDate(eta.getDate() + 7);
    const formatted = eta.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
    });
    setDeliveryEstimate(`By ${formatted}, 8am - 10pm`);
    setPincodeStatus("ok");
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  // Material options: derive dynamically from product JSON if provided
  const materialOptions = (
    Array.isArray(product.materials) && product.materials.length
      ? product.materials
      : [
        { value: "marble", label: "Marble", description: "Hand-Carved" },
        { value: "resin", label: "Resin", description: "High-Density" },
      ]
  ).map((m) =>
    typeof m === "string"
      ? {
        value: m.toLowerCase(),
        label: m.charAt(0).toUpperCase() + m.slice(1),
      }
      : m
  );

  // Size options: derive dynamically from product JSON if provided
  const sizeOptions = (
    Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : [
        { value: "small", label: "Small", description: "Under 6 in" },
        { value: "medium", label: "Medium", description: "6 in - 10 in" },
        { value: "large", label: "Large", description: "10 in - 15 in" },
        {
          value: "extra-large",
          label: "Extra Large",
          description: "Above 15 in",
        },
      ]
  ).map((s) =>
    typeof s === "string"
      ? { value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }
      : s
  );

  const selectedSizeMeta = sizeOptions.find((o) => o.value === selectedSize);
  const selectedMaterialKey = (
    selectedMaterial ||
    product.material ||
    ""
  ).toLowerCase();
  const primaryMaterialStr =
    product.primaryMaterial ||
    aboutDefaults.primaryMaterialByMaterial[selectedMaterialKey] ||
    materialOptions.find((o) => o.value === selectedMaterial)?.label ||
    null ||
    product.material ||
    "—";
  // About section rows (dynamic values per selection/defaults)
  const aboutRows = [
    { label: "Primary Material", value: primaryMaterialStr || "—" },
    {
      label: "Dimensions",
      value:
        product.dimensions ||
        aboutDefaults.dimensions ||
        selectedSizeMeta?.description ||
        "—",
    },
    { label: "Weight", value: product.weight || aboutDefaults.weight || "—" },
    {
      label: "Finish",
      value:
        product.finish ||
        aboutDefaults.finishByMaterial[selectedMaterialKey] ||
        null ||
        "—",
    },
    { label: "Origin", value: product.origin || aboutDefaults.origin || "—" },
  ];

  const increment = () => setQuantity((q) => Math.min(99, q + 1));
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      dispatch(
        addToCart({
          id: product.id,
          title,
          price: product.price,
          image: imageSrc,
          mrp: mrp,
          discount,
          material: selectedMaterial,
          size: selectedSize,
        })
      );
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Products", link: "/filter" },
    {
      label: product.category || "Category",
      link: `/filter?category=${categorySlug}`,
    },
    { label: title },
  ];

  return (
    <>
      {/* Inline styles for checkboxes, radio buttons, and custom dual-range slider */}
      <style>{`

        /* Custom radio button styling */
        input[type="radio"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          background-color: white;
          width: 10px;
          height: 10px;
        }
        input[type="radio"]:checked {
          border-radius: 50%;
          background-color: #9333ea;
          border-color: #9333ea;
          outline: 2px solid #c084fc;
          outline-offset: 2px;
        }
        input[type="radio"]:checked::after {
          border-radius: 50%;
          background-color: #9333ea;
          border-color: #9333ea;
        }
        input[type="radio"]:hover {
          border-color: #9333ea;
        }
      `}</style>
      <div className="bg-white px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
        <div className=" container mx-auto">
          <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Left: Product Images */}
              <div className="flex flex-col w-full lg:justify-start lg:flex-col gap-4">
                {/* Main Product Image */}
                <div className="bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={title}
                    className="rounded-lg w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-3">
                  {productImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-1 cursor-pointer transition-all duration-200 ${index === selectedImageIndex
                          ? "border-2 border-brand-700 shadow-2xl shadow-purple-500"
                          : "border-gray-200"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${title} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Product Details */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">{rating}</span>
                      <Star
                        size={16}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                      <span className="ml-1">({reviews})</span>
                    </div>
                    {isFeatured && (
                      <span
                        className="
              w-18 lg:w-auto
              text-xs 
              font-bold
              px-2 
              py-1 
              rounded-md 
              bg-brand-50 
              text-brand-500 
              border-2 
              border-brand-500
              whitespace-nowrap
              truncate
            "
                      >
                        Featured
                      </span>
                    )}
                    {isCustomizable && (
                      <span
                        className="
              w-18 lg:w-auto
              text-xs 
              font-semibold 
              px-2 
              py-1 
              rounded-md 
              bg-white 
              text-gray-500 
              border-2 
              border-gray-300
              whitespace-nowrap
              truncate
            "
                      >
                        Customizable
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-2">
                  {/* Discounted Price (Current Price) */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-brand-700">
                      ₹{product.price}
                    </span>
                    {discount && (
                      <span className="text-lg font-medium text-brand-600">
                        {discount}
                      </span>
                    )}
                  </div>
                  {/* Original Price (MRP) */}
                  {mrp && mrp !== product.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg line-through text-gray-500">
                        ₹{mrp}
                      </span>
                      <span className="text-sm text-gray-600">
                        (You save ₹{mrp - product.price})
                      </span>
                    </div>
                  )}
                </div>

                {/* Purchase Stats */}
                <p className="text-sm text-gray-600">
                  50 purchased in last month
                </p>

                {/* Delivery Check */}
                <div className="space-y-2">
                  <p className="text-md font-semibold text-gray-900">
                    Check Delivery
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="6-digit pincode"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        setPincodeStatus("idle");
                        setDeliveryEstimate("");
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent w-40"
                    />
                    <button
                      onClick={handleCheckDelivery}
                      className="px-4 py-2 bg-brand-700 text-white text-md rounded-lg hover:bg-brand-800 transition"
                    >
                      Verify
                    </button>
                  </div>
                  {pincodeStatus === "invalid" && (
                    <p className="text-sm text-red-600">
                      Please enter a valid 6-digit pincode
                    </p>
                  )}
                  {pincodeStatus === "no-service" && (
                    <p className="text-sm text-red-600">
                      Sorry, we currently don't deliver to {pincode}.
                    </p>
                  )}
                  {pincodeStatus === "ok" && (
                    <p className="text-sm text-green-600">
                      Delivery available to {pincode}. Estimated delivery{" "}
                      {deliveryEstimate}
                    </p>
                  )}
                </div>

                {/* Material Selection */}
                <div className="space-y-3">
                  <p className="text-md font-semibold text-gray-900">
                    Select material
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {materialOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative cursor-pointer p-3 border border-gray-300 rounded-xl transition-all shadow-sm hover:shadow-lg duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500
 ${selectedMaterial === option.value ? "shadow-lg" : "border-gray-300"}`}
                      >
                        <input
                          type="radio"
                          name="material"
                          value={option.value}
                          checked={selectedMaterial === option.value}
                          onChange={(e) => setSelectedMaterial(e.target.value)}
                          className="absolute right-3 top-3 text-brand-600 focus:ring-brand-600"
                        />
                        <div className="text-gray-900 font-medium">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                  <p className="text-md font-semibold text-gray-900">
                    Select size
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sizeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative cursor-pointer p-3 border border-gray-300 rounded-xl transition-all shadow-sm hover:shadow-lg duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 ${selectedSize === option.value
                            ? "shadow-lg"
                            : " border-gray-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="size"
                          value={option.value}
                          checked={selectedSize === option.value}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="absolute right-3 top-3 text-brand-600 focus:ring-brand-600"
                        />
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-1 lg:justify-start lg:flex-nowrap">
                  <div className="inline-flex items-center border justify-between rounded-lg overflow-hidden w-[46%] lg:w-auto">
                    <button
                      type="button"
                      onClick={decrement}
                      className="w-[35%] p-2 text-gray-700 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <div className="w-[35%] p-2 text-sm min-w-10 text-center">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={increment}
                      className="w-[35%] p-2 text-gray-700 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="px-2 py-2 bg-white text-brand-700 border border-brand-700 rounded-lg hover:bg-brand-50 transition flex items-center gap-2 w-[46%] lg:w-auto"
                  >
                    Add to Cart <ShoppingCart size={15} />
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="px-2 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition w-full lg:w-auto"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Banknote size={20} className="text-brand-600" />
                    </div>
                    <p className="text-xs text-gray-600">
                      Cash on Delivery available
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck size={20} className="text-brand-600" />
                    </div>
                    <p className="text-xs text-gray-600">
                      Free delivery above ₹1,000
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck size={20} className="text-brand-600" />
                    </div>
                    <p className="text-xs text-gray-600">Secure Payments</p>
                  </div>
                </div>

                {/* About This Item (exact two-column definition list) */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    About this item
                  </p>
                  <dl className="gap-x-6 bg-white border-b border-gray-200">
                    {aboutRows.map((row, i) => (
                      <div key={i} className="flex border-none">
                        <dt
                          className={`py-2 px-4 text-sm text-gray-600 w-[30%] ${i === 0 ? "rounded-tl-lg" : ""
                            }`}
                        >
                          {row.label}
                        </dt>
                        <dd
                          className={`py-2 px-4 text-sm text-gray-900 w-[70%] ${i === 0 ? "rounded-tr-lg" : ""
                            }`}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections below the main product details */}
      <ProductMoreInfoPage productId={product.id} />
    </>
  );
}
