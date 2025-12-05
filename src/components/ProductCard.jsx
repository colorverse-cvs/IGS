import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateQty,
  removeFromCart,
} from "../features/cart/cartSlice";
import { ShoppingCart, Star } from "lucide-react";

/**
 * ProductCard Component - Individual product display card
 *
 * Props:
 * - product: object - product data including id, name, price, rating, imageURL, etc.
 * - onOpenProduct: function (optional) - callback to open product in modal instead of navigating
 *
 * Features:
 * - Displays product image with featured/customizable badges
 * - Shows price, rating, and review count
 * - Add to cart button with quantity controls
 * - Hover effects (scale up, shadow)
 * - Handles both as a Link (navigates to product page) or as a button (opens modal)
 *
 * For beginners:
 * - Uses Redux dispatch to add/remove products from cart
 * - Uses React Router Link for navigation to product details page
 * - useSelectorgets current qty from Redux cart state
 */
const ProductCard = ({ product, onOpenProduct }) => {
  const dispatch = useDispatch();
  const {
    id,
    name,
    price,
    mrp,
    discount,
    rating,
    material,
    size,
    reviews,
    isFeatured,
    isCustomizable,
    imageURL,
  } = product;

  // Get quantity of this product currently in cart
  const qtyInCart = useSelector(
    (s) => s.cart.items.find((i) => i.id === id)?.qty || 0
  );

  // Add product to cart with all its details
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: id,
        title: name,
        price: price,
        image: imageURL,
        mrp: mrp,
        discount: discount,
        material: material,
        size: size,
      })
    );
  };

  // Card content - shared between Link and Button variants
  const content = (
    <div
      className="
      overflow-hidden 
      transition-all duration-200 ease-out
      flex flex-col
      rounded-2xl
      group
      h-full
      w-full
      min-w-0
      focus:outline-none focus:ring-2 focus:ring-brand-500
    "
    >
      {/* --- Image and Tag Section --- */}
      <div className="relative h-40 md:h-60 w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-1 border-gray-200 transition-all duration-200 ease-out  group-hover:-translate-y-1 group-hover:shadow-sm">
        <img
          src={imageURL}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-200 ease-out"
        />

        {/* Tags at the top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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

      {/* --- Product Details Section --- */}
      <div className="px-2 md:px-4 py-4 flex-grow flex flex-col justify-between min-h-[140px] min-w-0">
        {/* Product Title - Fixed height to prevent layout shifts */}
        <div className="w-full">
          <div className="text-base font-extrabold text-gray-800 mb-2 overflow-hidden leading-5 truncate w-full">
            {name}
          </div>
        </div>

        {/* Price Row */}
        <div className="flex flex-col md:flex-row items-baseline space-x-2 mb-2">
          <span className="text-lg font-extrabold text-brand-700">
            ₹{price}
          </span>
          <span className="text-xs line-through text-gray-500">
            MRP: ₹{mrp}
          </span>
          <span className="text-xs font-medium text-brand-600">{discount}</span>
        </div>

        {/* Rating and Add to Cart */}
        <div className="flex flex-col xl:flex-row justify-between first:items-start [&amp;:nth-child(2)]:items-center xl:items-center gap-2 mt-auto">
          <div>
            <div className="flex items-center text-sm text-gray-600">
              <span>{rating}</span>
              <Star
                size={14}
                fill="currentColor"
                className="text-yellow-500 mr-1"
              />
              <span className="text-xs text-gray-500">({reviews})</span>
            </div>
          </div>
          <div className="flex items-center md:justify-center">
            {qtyInCart === 0 ? (
              <button
                className="flex items-center justify-center py-2 px-3 text-white bg-brand-700 hover:bg-brand-800 font-semibold text-xs 
            transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-opacity-50
            rounded-sm md:opacity-0 md:translate-y-1 md:pointer-events-none
            md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto gap-2 md:text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                Add to Cart <ShoppingCart size={18} />
              </button>
            ) : (
              <div
                className="
              inline-flex items-center bg-brand-800 text-white border border-brand-700 rounded-sm md:translate-y-1 md:pointer-events-none md:group-hover:translate-y-0 md:group-hover:pointer-events-auto
            "
              >
                <button
                  className="px-3 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (qtyInCart > 1) {
                      dispatch(updateQty({ id, qty: qtyInCart - 1 }));
                    } else {
                      dispatch(removeFromCart(id));
                    }
                  }}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="px-2 select-none text-sm">{qtyInCart}</span>
                <button
                  className="px-3 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // use addToCart to increment by 1
                    dispatch(
                      addToCart({ id, title: name, price, image: imageURL })
                    );
                  }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  if (onOpenProduct) {
    return (
      <button
        type="button"
        className="text-left w-full"
        onClick={() => onOpenProduct(product)}
      >
        {content}
      </button>
    );
  }
  return (
    <Link
      to={`/product/${id}`}
      className="block w-full h-full"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {content}
    </Link>
  );
};

export default ProductCard;
