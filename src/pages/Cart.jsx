import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQty,
  clearCart,
} from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import EmptyShoppingCart from "../assets/empty-shopping-cart.svg";

export default function Cart({ isDrawer = false, onClose }) {
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const WRAP_FEE_PER_UNIT = 20;
  const [wrapMap, setWrapMap] = React.useState({});

  React.useEffect(() => {
    setWrapMap((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (next[it.id] === undefined) next[it.id] = false;
      }
      return next;
    });
  }, [items]);

  const wrapTotal = React.useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (wrapMap[it.id] ? WRAP_FEE_PER_UNIT * it.qty : 0),
        0
      ),
    [items, wrapMap]
  );

  const grandTotal = total + wrapTotal;

  const handleQtyChange = (id, newQty) => {
    const qty = Number(newQty);
    if (qty >= 1) {
      dispatch(updateQty({ id, qty }));
    }
  };

  const handleRemoveItem = (id) => {
    console.log("Removing item from cart", id);
    import("../features/cart/cartSlice").then(({ removeItemFromCartAsync }) => {
      dispatch(removeItemFromCartAsync(id));
    });
  };

  const handleClearCart = () => {
    import("../features/cart/cartSlice").then(({ clearCartAsync }) => {
      dispatch(clearCartAsync());
    });
  };

  const handleProceedToCheckout = () => {
    if (onClose) onClose();
    navigate("/checkout");
  };

  const containerClasses = isDrawer ? "p-0" : "container mx-auto px-4 py-8";

  return (
    <div className={containerClasses}>
      {!isDrawer && (
        <h2 className="text-4xl text-center font-extrabold text-gray-900 py-2">
          Shopping Cart 🛒
        </h2>
      )}

      {items.length === 0 ? (
        <div
          className={`${isDrawer
            ? "text-center flex flex-col items-center"
            : "py-8 bg-white rounded-xl text-center justify-items-center"
            }`}
        >
          <img src={EmptyShoppingCart} className="w-[200px] lg:w-[300px]" alt="" />
          <p className="text-xl text-gray-600 mb-4">
            Your cart seems kind of empty.
          </p>
        </div>
      ) : (
        <div
          className={`flex ${isDrawer ? "flex-col h-[90vh]" : "flex-col md:flex-row gap-8 relative"
            }`}
        >
          {/* Cart Items */}
          <div
            className={`${isDrawer
              ? "flex-1 overflow-y-auto p-4"
              : "md:w-3/4 bg-white pt-0 p-2 md:p-6 rounded-xl shadow-lg"
              } space-y-6`}
          >
            {items.map((it) => {
              const lineWrap = wrapMap[it.id] ? WRAP_FEE_PER_UNIT * it.qty : 0;

              /* Drawer Layout */
              if (isDrawer) {
                return (
                  <div
                    key={it.id}
                    className="border border-gray-100 hover:shadow-lg p-2 rounded-lg flex items-start gap-4 text-sm"
                  >
                    <img src={it.image} alt={it.title} className="w-28 h-28 rounded object-cover" />

                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{it.title}</div>
                      <div className="text-gray-500">
                        Material: {it.material || "-"} &nbsp; Size: {it.size || "-"}
                      </div>
                      <div className="text-brand-700 font-semibold">₹{it.price}</div>

                      <div className="flex gap-6 lg:gap-4 py-2">
                        <button
                          type="button"
                          className="px-2"
                          onClick={() =>
                            dispatch(updateQty({ id: it.id, qty: it.qty + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => handleRemoveItem(it.id)}
                      >
                        <span className="hidden lg:block">Remove from cart</span>
                        <span className="lg:hidden">
                          <Trash2 size={20} className="text-red" />
                        </span>
                      </button>

                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!wrapMap[it.id]}
                          onChange={(e) =>
                            setWrapMap((prev) => ({
                              ...prev,
                              [it.id]: e.target.checked,
                            }))
                          }
                        />
                        Gift wrap this item (₹20)
                      </label>
                    </div>
                  </div>
                );
              }

              /* Full Page Layout */
              return (
                <div
                  key={it.id}
                  className="py-4 flex items-start gap-4 text-sm border border-gray-100 hover:shadow-lg rounded-lg p-2"
                >
                  <img src={it.image} alt={it.title} className="w-28 h-28 rounded object-cover" />

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{it.title}</div>

                    <div className="text-gray-500 flex flex-col gap-1">
                      <span>Material: {it.material || "-"}</span>
                      <span>Size: {it.size || "-"}</span>
                    </div>

                    <div className="text-brand-700 font-semibold">₹{it.price}</div>

                    <div className="flex items-center gap-5 py-2">
                      <div className="flex items-center gap-2 border border-gray-200 rounded">
                        <button
                          type="button"
                          className="px-2"
                          onClick={() =>
                            it.qty > 1
                              ? dispatch(updateQty({ id: it.id, qty: it.qty - 1 }))
                              : dispatch(removeFromCart(it.id))
                          }
                        >
                          -
                        </button>

                        <span>{it.qty}</span>

                        <button
                          type="button"
                          className="px-2"
                          onClick={() =>
                            dispatch(updateQty({ id: it.id, qty: it.qty + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => handleRemoveItem(it.id)}
                      >
                        <span className="hidden lg:block">Remove</span>
                        <span className="lg:hidden">
                          <Trash2 size={20} />
                        </span>
                      </button>
                    </div>

                    <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!wrapMap[it.id]}
                        onChange={(e) =>
                          setWrapMap((prev) => ({
                            ...prev,
                            [it.id]: e.target.checked,
                          }))
                        }
                      />
                      Gift wrap this item (₹20)
                    </label>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            {!isDrawer && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleClearCart}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X size={16} className="mr-2" /> Clear All Items
                </button>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {isDrawer ? (
            <div className="bottom-0 bg-white py-4 px-4 border-t shadow-lg z-10">
              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span>Total:</span>
                <span className="text-brand-700">₹{grandTotal}</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full px-4 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleClearCart}
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear cart
              </button>
            </div>
          ) : (
            <div className="md:w-1/4 bg-gray-50 p-6 rounded-xl shadow-lg h-fit sticky top-[15%]">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{total}</span>
                </div>

                {wrapTotal > 0 && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Gift wrap</span>
                    <span>₹{wrapTotal}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Order Total</span>
                  <span className="text-brand-700">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full mt-6 px-4 py-3 text-center bg-brand-700 text-white rounded-lg font-semibold hover:bg-brand-800 shadow-lg"
              >
                Proceed to Checkout
              </button>

              <div className="text-center text-xs text-gray-500 mt-4">
                Taxes and shipping calculated at checkout.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
