import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import products from "../data/products.json";
import categoriesData from "../data/categories.json";
import { Star, Truck, Shield, ShoppingCart } from "lucide-react";
import aboutDefaults from "../data/aboutDefaults.json";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedMaterial, setSelectedMaterial] = useState("marble");
  const [selectedSize, setSelectedSize] = useState("small");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("idle"); // 'idle'|'invalid'|'ok'|'no-service'
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Build a unified product list from categories and standalone products
  const getAllProducts = () => {
    const all = [];
    categoriesData.sections.forEach((section) => {
      section.products.forEach((p) => {
        all.push({ ...p, categoryId: section.id, categoryName: section.title });
      });
    });
    return [...all, ...products];
  };

  const allProducts = getAllProducts();
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="text-center mt-10 text-gray-500">Product not found.</div>
    );
  }

  const title = product.name || product.title || "Product";
  const imageSrc = product.imageURL || product.image;
  const mrp = product.mrp;
  const discount = product.discount;
  const rating = product.rating;
  const reviews = product.reviews;
  const isCustomizable = product.isCustomizable;
  const isFeatured = product.isFeatured;

  // Images – prefer product.images from JSON if present
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

  // Materials – derive dynamically from JSON if provided
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

  // Sizes – derive dynamically from JSON if provided
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
  // Exact rows per design, populated dynamically
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

  const [quantity, setQuantity] = useState(1);
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
    // Use client-side navigation so Redux cart state is preserved
    navigate("/checkout");
  };

  return (
    <div className="bg-white  px-4 md:px-15 lg:px-20">
      <div className=" container mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-purple-700">
                Home
              </Link>
              <span className="mx-2">&gt;</span>
              <Link to="/filter" className="hover:text-purple-700">
                Products
              </Link>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900">{product.category}</span>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900">{title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Product Images */}
            <div className="space-y-4">
              {/* Main Product Image */}
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={title}
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-1 cursor-pointer transition-all duration-200 ${
                      index === selectedImageIndex
                        ? "border-2 border-purple-700 shadow-2xl shadow-purple-500"
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
                      className="text-xs 
              font-bold
              px-2 
              py-1 
              rounded-md 
              bg-brand-50 
              text-purple-800 
              border 
              border-brand-500
              whitespace-nowrap"
                    >
                      Featured
                    </span>
                  )}
                  {isCustomizable && (
                    <span
                      className="text-xs 
              font-semibold 
              px-2 
              py-1 
              rounded-md 
              bg-white 
              text-gray-500 
              border 
              border-gray-300
              whitespace-nowrap"
                    >
                      Customizable
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-purple-700">
                  ₹{product.price}
                </span>
                {mrp && (
                  <span className="text-lg line-through text-gray-500">
                    ₹{mrp}
                  </span>
                )}
                {discount && (
                  <span className="text-lg font-medium text-purple-600">
                    {discount}
                  </span>
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
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
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
                      className={`relative cursor-pointer p-3 border border-gray-300 rounded-xl transition-all shadow-sm hover:shadow-lg duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        selectedSize === option.value
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
              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex items-center border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={decrement}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <div className="px-4 py-2 text-sm min-w-10 text-center">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={increment}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="px-2 py-2 bg-white text-purple-700 border border-brand-700 rounded-lg hover:bg-brand-50 transition flex items-center gap-2"
                >
                  Add to Cart <ShoppingCart size={15} />
                </button>
                <button
                  onClick={handleBuyNow}
                  className="px-2 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition"
                >
                  Buy Now
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 text-xl">💳</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Cash on Delivery available
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck size={20} className="text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Free delivery above ₹1,000
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield size={20} className="text-purple-600" />
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
                        className={`py-2 px-4 text-sm text-gray-600 w-[30%] ${
                          i === 0 ? "rounded-tl-lg" : ""
                        }`}
                      >
                        {row.label}
                      </dt>
                      <dd
                        className={`py-2 px-4 text-sm text-gray-900 w-[70%] ${
                          i === 0 ? "rounded-tr-lg" : ""
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
  );
}
