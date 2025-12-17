import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../utils/api";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { useNavigate } from 'react-router-dom';

import { addOrder } from "../features/orders/ordersSlice";
import { clearCart } from "../features/cart/cartSlice";
import { Trash2 } from "lucide-react";
import Modal from "../components/Modal.jsx";
import AddressForm from "../components/AddressForm.jsx";
import { addAddressAsync, updateAddressAsync } from "../features/user/userSlice";

import { removeFromCart, updateQty, removeItemFromCartAsync } from "../features/cart/cartSlice";

/**
 * CheckoutPage Component
 *
 * Handles the complete checkout process including:
 * 1. Address selection/addition
 * 2. Order review
 * 3. Payment (Razorpay only)
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.user);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );

  const mrpTotal = useMemo(
    () => items.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0),
    [items]
  );
  const discount = Math.max(0, mrpTotal - subtotal);
  const dispatch = useDispatch();

  /**
   * Gift wrap functionality
   * Users can add gift wrap to items for ₹20 per unit
   */
  const WRAP_FEE_PER_UNIT = 20;
  const [wrapMap, setWrapMap] = useState({});
  React.useEffect(() => {
    setWrapMap((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (next[it.id] === undefined) next[it.id] = false;
      }
      return next;
    });
  }, [items]);

  const payable = useMemo(
    () => subtotal,
    [subtotal]
  );

  const [open, setOpen] = useState({
    address: true,
    payment: false,
    review: false,
  });
  const [addrList, setAddrList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const selectedAddress = useMemo(
    () => addrList.find((a) => a.id === selectedAddressId),
    [selectedAddressId, addrList]
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  // Prevent scroll jump when toggling radios/selects
  const keepScroll = () => {
    const y = window.scrollY;
    setTimeout(() => window.scrollTo(0, y), 0);
  };

  const currentStep = open.payment ? 2 : open.address ? 1 : 3;

  // Delivery ETA: 7 days from now
  const now = new Date();
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const etaExact = addDays(now, 7);
  const formatEta = (d) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "long" });

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        alert("Please select an address");
        return;
      }

      const paymentMethod = "razorpay";

      const payload = {
        paymentMethod,
        name: user?.profile?.name || "Guest",
        email: user?.profile?.email || "",
        phone: user?.profile?.mobile || "",
        address: {
          line1: selectedAddress.line1 || selectedAddress.addressLine || "",
          line2: selectedAddress.line2 || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "",
          postalCode: selectedAddress.postalCode || "",
          country: selectedAddress.country || "India",
          phone: selectedAddress.phone || selectedAddress.mobile || "",
          isDefault: !!selectedAddress.isDefault,
        },
      };

      console.log("Checkout payload:", payload);

      // 1️⃣ Create order (backend)
      const data = await api.post("/api/v1/cart/checkout", payload);
      console.log("Checkout response:", data);

      // 2️⃣ Razorpay options
      const options = {
        key: data.keyId,
        amount: data.orderRecord.total,
        currency: data.orderRecord.currency,
        order_id: data.order.paymentDetails.razorpayOrderId,

        name: "Ishita Gallery",
        description: "Checkout Payment",

        handler: async function (rzpResponse) {
          console.log("Razorpay response:", rzpResponse);
          try {
            const verifyResult = await api.post("/api/v1/payments/verify", rzpResponse);

            if (verifyResult.status === "ok") {
              dispatch(clearCart());
              dispatch(addOrder(verifyResult.order));
              navigate("/payment-success", {
                state: { order: verifyResult.order },
              });
            } else {
              // Payment verification failed
            }
          } catch (err) {
            console.error("Verification failed:", err);
          }
        },

        prefill: {
          name: data.customer?.name || "",
          email: data.customer?.email || "",
          contact: data.customer?.phone || "",
        },

        theme: { color: "#3399cc" },
      };

      // 3️⃣ Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    }
  };


  // Sync address list from user profile if logged in; otherwise use sample JSON
  React.useEffect(() => {
    if (user?.isAuthenticated) {
      const list = user.profile.addresses || [];
      setAddrList(list);
      setSelectedAddressId(
        list.find((a) => a.isDefault)?.id || list[0]?.id || null
      );
    } else {
      // When not logged in, do not prefill with sample addresses; force add new
      setAddrList([]);
      setSelectedAddressId(null);
    }
  }, [user?.isAuthenticated, user?.profile?.addresses]);

  // Address modal now opens only when user clicks "Add new address"

  const Section = ({
    title,
    isOpen,
    onToggle,
    children,
  }) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
        </span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Cart", link: "/cart" },
    { label: "Checkout" },
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
      <div className="py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="py-6 px-4 md:px-15 lg:px-20">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">Secure Checkout</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Steps */}
            <div className="lg:col-span-2">
              {/* Address */}
              <Section
                title="User Address Details"
                isOpen={open.address}
                onToggle={() => setOpen((p) => ({ ...p, address: !p.address }))}
              >
                <div className="space-y-3">
                  {addrList.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex gap-3 items-start p-3 border border-gray-200 rounded-md"
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          const y = window.scrollY;
                          setTimeout(() => window.scrollTo(0, y), 0);
                        }}
                        className="mt-1 text-brand-700"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {addr.name}
                          {addr.tag && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                              {addr.tag}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1">
                          <div>{addr.line1 || addr.addressLine}</div>
                          {addr.line2 && <div>{addr.line2}</div>}
                          <div>
                            {[addr.city, addr.state, addr.postalCode]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                          {addr.country && <div>{addr.country}</div>}
                        </div>
                      </div>
                    </label>
                  ))}
                  <div className="flex flex-col md:flex-row gap-5 justify-between items-center">
                    <button
                      className="text-sm text-brand-700"
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      Add new address
                    </button>
                  </div>
                </div>
              </Section>


              {/* Review Products */}
              <Section
                title="Review Products"
                isOpen={open.review}
                onToggle={() => setOpen((p) => ({ ...p, review: !p.review }))}
              >
                <div>
                  {items.map((i) => {
                    const lineWrap = wrapMap[i.id]
                      ? WRAP_FEE_PER_UNIT * i.qty
                      : 0;
                    const lineTotal = i.price * i.qty + lineWrap;
                    return (
                      <React.Fragment key={i.id}>
                        <div
                          className="py-4 flex items-start gap-4 text-sm "
                        >
                          <img
                            src={i.image}
                            alt={i.title}
                            className="w-30 h-40 rounded object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {i.title}
                            </div>
                            <div className="text-gray-500">
                              Material: {i.material || "-"} &nbsp; Size:{" "}
                              {i.size || "-"}
                            </div>
                            <div className="text-brand-700 font-semibold">
                              ₹{i.price}
                            </div>
                            <div className="flex gap-5 py-2">
                              <div className="flex items-center gap-2 border border-gray-200 rounded">
                                <button
                                  type="button"
                                  className="px-2"
                                  onClick={() => {
                                    keepScroll();
                                    i.qty > 1
                                      ? dispatch(
                                        updateQty({
                                          id: i.id,
                                          qty: i.qty - 1,
                                        })
                                      )
                                      : dispatch(removeItemFromCartAsync(i.id));
                                  }}
                                >
                                  -
                                </button>
                                <span>{i.qty}</span>
                                <button
                                  type="button"
                                  className="px-2"
                                  onClick={() => {
                                    keepScroll();
                                    dispatch(
                                      updateQty({ id: i.id, qty: i.qty + 1 })
                                    );
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                className="text-red-600 text-xs"
                                onClick={() => {
                                  keepScroll();
                                  dispatch(removeItemFromCartAsync(i.id));
                                }}
                              >
                                <span className="hidden lg:block">
                                  Remove from cart
                                </span>
                                <span className="lg:hidden">
                                  <Trash2 size={20} className="text-red" />{" "}
                                </span>
                              </button>
                            </div>
                            <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!wrapMap[i.id]}
                                onChange={(e) => {
                                  keepScroll();
                                  setWrapMap((prev) => ({
                                    ...prev,
                                    [i.id]: e.target.checked,
                                  }));
                                }}
                              />
                              Gift wrap this item (₹20 for wrapping)
                            </label>
                            <div className="text-xs text-gray-500 mt-1">
                              Estimated Delivery –{" "}
                              <span className="font-semibold">
                                By {formatEta(etaExact)}, 8am - 10pm
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-medium">
                          <div>
                            Subtotal (<span>{i.qty}</span> item):{" "}
                            <span className="text-brand-700 font-semibold">
                              ₹{lineTotal}
                            </span>
                          </div>
                          {lineWrap > 0 && (
                            <div className="text-[11px] text-gray-500">
                              incl. wrap ₹{lineWrap}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="py-6 text-gray-500">
                      Your cart is empty.
                    </div>
                  )}
                </div>
              </Section>

              {/* Payment Details */}
              <Section
                title="Payment Details"
                isOpen={open.payment}
                onToggle={() => setOpen((p) => ({ ...p, payment: !p.payment }))}
              >
                <div className="flex items-start gap-5">
                  <img src="../../public/assets/logos/razorpay-icon.png" alt="" />
                  <div className="flex flex-col items-start gap-5">
                    <p>Payment System : Razorpay</p>
                    <p>After placing the order, you'll be redirected to Razorpay to complete payment.</p>
                  </div>
                </div>
              </Section>

              <button
                onClick={() => handlePlaceOrder()}
                className="w-full mt-4 px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  items.length === 0 ||
                  (currentStep === 1 && !selectedAddress)
                }
              >
                Place Order
              </button>

            </div>

            {/* Right: Pricing Summary */}
            <div>
              <div className="border border-gray-200 rounded-lg p-4 sticky top-2/12 bg-white shadow">
                <h2 className="font-semibold mb-3 text-gray-800">
                  Pricing Details
                </h2>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>₹{mrpTotal}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fees:</span>
                    <span>Free</span>
                  </div>

                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Payable Price:</span>
                    <span>₹{payable}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
          {/* Add Address Modal */}
          <Modal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            title="Add new Address"
          >
            <AddressForm
              initial={editAddress || undefined}
              submitLabel={editAddress ? "Save address" : "Use this address"}
              onCancel={() => {
                setEditAddress(null);
                setIsAddressModalOpen(false);
              }}
              onSubmit={(newAddr) => {
                if (user?.isAuthenticated) {
                  if (editAddress) {
                    dispatch(updateAddressAsync({
                      addressId: editAddress.id,
                      addressData: { ...newAddr, id: undefined } // ensure no ID in payload if possible, or thunk handles it
                    }));
                  } else {
                    dispatch(addAddressAsync(newAddr));
                  }
                } else {
                  // Guest mode (local state only)
                  setAddrList((prev) => {
                    let list = prev;
                    if (editAddress) {
                      list = prev.map((a) =>
                        a.id === editAddress.id ? newAddr : a
                      );
                    } else {
                      list = [...prev, newAddr];
                    }
                    if (newAddr.isDefault) {
                      list = list.map((a) => ({
                        ...a,
                        isDefault: a.id === newAddr.id,
                      }));
                    }
                    return list;
                  });
                }
                // If it was a new address or edit, select it
                if (!editAddress) setSelectedAddressId(newAddr.id);

                setEditAddress(null);
                setIsAddressModalOpen(false);
              }}
            />
          </Modal>
        </div>
      </div>
    </>
  );
}

// card Number
//   4386 2894 0766 0153   - VISA