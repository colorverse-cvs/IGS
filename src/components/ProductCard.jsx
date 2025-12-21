import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDiscountedPrice } from "../utils/helpers";
import {
  addToCart,
  updateQty,
  removeFromCart,
  addToCartAsync,
} from "../features/cart/cartSlice";
import { ShoppingCart, Star } from "lucide-react";
import useAuth from "../hooks/useAuth";
import AuthModal from "./AuthModal";
import toast from "react-hot-toast";
import { generateRatingAndReviews } from "../utils/ratingGenerator";

const ProductCard = ({ product, onOpenProduct }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  // Generate rating and reviews based on product ID
  const { rating: generatedRating, reviews: generatedReviews } = generateRatingAndReviews(product.id);

  const {
    id,
    name,
    price,
    listPrice,
    discount,
    material,
    size,
    isFeatured,
    isCustomizable,
    imageURL,
  } = product;

  // Use generated rating and reviews
  const rating = generatedRating;
  const reviews = generatedReviews;

  // Get quantity of this product currently in cart
  const qtyInCart = useSelector(
    (s) => s.cart.items.find((i) => i.id === id)?.qty || 0
  );

  // Add product to cart with all its details
  const handleAddToCart = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // prevent navigating to product page
    }

    if (!isAuthenticated) {
      toast.error("You need to log in first to add this product to your cart.");
      setIsAuthModalOpen(true);
      return;
    }

    // Use price directly as it's already the discounted price
    dispatch(
      addToCartAsync({
        id: id,
        title: name,
        price: price,
        image: imageURL,
        listPrice: listPrice,
        discount: discount,
        material: material,
        size: size,
        qty: 1,
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
      focus:outline-none focus:ring-1 focus:ring-purple-500
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
        <div className="flex flex-col gap-1 mb-2">
          {/* Main Price (Already Discounted) */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-brand-700">
              ₹{price}
            </span>

            {/* List Price Strikethrough */}
            {listPrice && listPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                MRP: ₹{listPrice}
              </span>
            )}

            {/* Discount Percentage */}
            {discount && discount > 0 && (
              <span className="text-xs font-semibold text-brand-600">
                {discount}% Off
              </span>
            )}
          </div>
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
                className="cursor-pointer flex items-center justify-center py-2 px-3 text-white bg-brand-700 hover:bg-purple-800 font-semibold text-xs 
                  transition-all duration-300 ease-out focus:outline-none focus:ring-1 focus:ring-purple-500 focus:ring-opacity-50
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
                      // Use API thunk for quantity update
                      import("../features/cart/cartSlice").then(({ updateCartItemQuantityAsync }) => {
                        dispatch(updateCartItemQuantityAsync({ productId: id, quantity: qtyInCart - 1 }));
                      });
                    } else {
                      // Use API thunk for removal
                      import("../features/cart/cartSlice").then(({ removeItemFromCartAsync }) => {
                        dispatch(removeItemFromCartAsync(id));
                      });
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
                    // Use API thunk for quantity update
                    import("../features/cart/cartSlice").then(({ updateCartItemQuantityAsync }) => {
                      dispatch(updateCartItemQuantityAsync({ productId: id, quantity: qtyInCart + 1 }));
                    });
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
      <>
        <button
          type="button"
          className="text-left w-full"
          onClick={() => onOpenProduct(product)}
        >
          {content}
        </button>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab="login"
        />
      </>
    );
  }
  return (
    <>
      <Link
        to={{
          pathname: `/product/${id}`,
          state: { product },
        }}
        className="block w-full h-full"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {content}
      </Link>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab="login"
      />
    </>
  );
};

export default ProductCard;
