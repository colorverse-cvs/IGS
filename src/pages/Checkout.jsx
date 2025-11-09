import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCart,
  updateQty,
  removeFromCart,
} from "../features/cart/cartSlice";
// No sample addresses fallback; unauthenticated users add addresses fresh
import { addOrUpdateAddress } from "../features/user/userSlice";
import { addOrder } from "../features/orders/ordersSlice";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import AddressForm from "../components/AddressForm";
import Breadcrumb from "../components/Breadcrumb.jsx";

// Minimal brand/bank/app icons and logo fallback
const VisaIcon = () => (
  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-[#1a1f71] border border-[#1a1f71] rounded">
    VISA
  </span>
);
const MastercardIcon = () => (
  <span className="inline-flex items-center">
    <span className="w-3 h-3 rounded-full bg-[#EB001B]"></span>
    <span className="w-3 h-3 -ml-1 rounded-full bg-[#F79E1B]"></span>
  </span>
);
const PhonePeIcon = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5F259F] text-white text-[10px] font-semibold">
    P
  </span>
);
const GPayIcon = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#34A853] text-white text-[10px] font-semibold">
    G
  </span>
);
const BankLogo = ({ code }) => (
  <span className="inline-flex items-center justify-center w-6 h-6 text-[10px] font-semibold rounded-full bg-gray-100 border text-gray-700">
    {code}
  </span>
);
const Logo = ({ name, alt, className = "h-4", fallback }) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) return fallback || null;
  return (
    <img
      src={`/assets/logos/${name}.svg`}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default function Checkout() {
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.user);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const delivery = items.length > 0 ? 40 : 0;
  const mrpTotal = useMemo(
    () => items.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0),
    [items]
  );
  const discount = Math.max(0, mrpTotal - subtotal);
  const dispatch = useDispatch();
  // Gift wrap state (₹20 per unit)
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
  const wrapTotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + (wrapMap[i.id] ? WRAP_FEE_PER_UNIT * i.qty : 0),
        0
      ),
    [items, wrapMap]
  );
  const payable = useMemo(
    () => subtotal + delivery + wrapTotal,
    [subtotal, delivery, wrapTotal]
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

  // Payment selection
  const [paymentType, setPaymentType] = useState(""); // 'upi' | 'card' | 'netbanking' | 'cod'

  // Cards
  const [cards, setCards] = useState([
    {
      id: "card_boi_0000",
      brand: "visa",
      mask: "0000",
      label: "Bank of India debit card ending with 0000",
    },
    {
      id: "card_hdfc_0000",
      brand: "mastercard",
      mask: "0000",
      label: "HDFC Bank credit card ending with 0000",
    },
  ]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId),
    [cards, selectedCardId]
  );

  // Netbanking
  const [selectedBank, setSelectedBank] = useState("");

  // UPI (simplified: either enter UPI ID or scan QR)
  const [upiOption, setUpiOption] = useState(""); // 'id' | 'qr'
  const [upiId, setUpiId] = useState("");
  const [upiStatus, setUpiStatus] = useState("idle"); // 'idle' | 'valid' | 'invalid'

  // Modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Step completion indicators
  const [done, setDone] = useState({ address: false, payment: false });

  // Prevent scroll jump when toggling radios/selects
  const keepScroll = () => {
    const y = window.scrollY;
    setTimeout(() => window.scrollTo(0, y), 0);
  };

  // Add Card form (controlled with validation)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState(""); // formatted with spaces
  const [cardExpiry, setCardExpiry] = useState(""); // MM/YY
  const [cardCvv, setCardCvv] = useState("");
  const onlyDigits = (v) => v.replace(/\D/g, "");
  const detectBrand = (digits) => {
    if (/^4/.test(digits)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
    if (/^3[47]/.test(digits)) return "amex";
    return "card";
  };
  const luhnCheck = (num) => {
    let sum = 0;
    let dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num[i], 10);
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  };
  const isFutureExpiry = (mmYY) => {
    const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const mm = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    if (mm < 1 || mm > 12) return false;
    const year = 2000 + yy;
    const exp = new Date(year, mm, 0, 23, 59, 59, 999); // last ms of month
    return exp >= new Date();
  };
  const cardDigits = onlyDigits(cardNumber);
  const cardBrand = detectBrand(cardDigits);
  const cardErrors = React.useMemo(() => {
    const errs = {};
    if (!cardName.trim()) errs.name = "Name on card is required";
    const len = cardDigits.length;
    const brand = cardBrand;
    const expectedLen = brand === "amex" ? 15 : 16;
    if (len !== expectedLen)
      errs.number =
        brand === "amex"
          ? "AMEX requires 15 digits"
          : "Card number must be 16 digits";
    else if (!luhnCheck(cardDigits)) errs.number = "Invalid card number";
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry) || !isFutureExpiry(cardExpiry))
      errs.expiry = "Enter a valid future MM/YY";
    const cvvLen = brand === "amex" ? 4 : 3;
    if (onlyDigits(cardCvv).length !== cvvLen)
      errs.cvv =
        brand === "amex" ? "AMEX CVV must be 4 digits" : "CVV must be 3 digits";
    return errs;
  }, [cardName, cardDigits, cardExpiry, cardCvv, cardBrand]);
  const isCardValid = Object.keys(cardErrors).length === 0;

  // Consider the Payment section primary if it's open (prevents CTA/desync when address is also open)
  const currentStep = open.payment ? 2 : open.address ? 1 : 3;
  const ctaLabel = (() => {
    if (currentStep === 1) return "Deliver to this address";
    if (currentStep === 2) return "Use this payment method";
    if (paymentType === "card" && selectedCard)
      return `Pay with debit card **${selectedCard.mask}`;
    if (paymentType === "upi") return "Pay with UPI";
    if (paymentType === "netbanking") return "Pay via Netbanking";
    if (paymentType === "cod") return "Place order (COD)";
    return "Place order";
  })();

  const isValidUpiId = (id) => /^[a-zA-Z0-9_.-]{3,}@[a-zA-Z]{3,}$/.test(id);

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

  const isPaymentValid = React.useMemo(() => {
    if (currentStep !== 2) return true;
    switch (paymentType) {
      case "upi":
        if (upiOption === "qr") return true;
        if (upiOption === "id")
          return isValidUpiId(upiId) && upiStatus === "valid";
        return false;
      case "card":
        return Boolean(selectedCardId);
      case "netbanking":
        return Boolean(selectedBank);
      case "cod":
        return true;
      default:
        return false;
    }
  }, [
    currentStep,
    paymentType,
    upiOption,
    upiId,
    upiStatus,
    selectedCardId,
    selectedBank,
  ]);

  const handlePay = async () => {
    const order = {
      id: `ABC-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      address: selectedAddress,
      payment: {
        type: paymentType,
        label:
          paymentType === "card"
            ? `debit card **${selectedCard?.mask || "0000"}`
            : paymentType === "upi"
            ? `UPI ${upiOption === "id" ? upiId || "(ID verified)" : "QR"}`
            : paymentType === "netbanking" && selectedBank
            ? `Netbanking ${selectedBank}`
            : paymentType,
      },
      totals: {
        mrpTotal,
        discount,
        delivery,
        wrap: wrapTotal,
        payable,
        subtotal,
      },
      items,
    };
    dispatch(addOrder(order));
    dispatch(clearCart());
    return order;
  };

  const handlePrimaryAction = () => {
    if (currentStep === 1) {
      // Require a selected address before proceeding
      if (!selectedAddress) return;
      setOpen({ address: false, payment: true, review: false });
      setDone((d) => ({ ...d, address: true }));
    } else if (currentStep === 2) {
      if (!isPaymentValid) return;
      setOpen({ address: false, payment: false, review: true });
      setDone((d) => ({ ...d, payment: true }));
    } else {
      // Place order then show pre-success page
      (async () => {
        const order = await handlePay();
        navigate("/order-placed", { state: { order } });
      })();
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
    actionText,
    completed,
  }) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          {completed && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-green-600 text-white">
              ✓
            </span>
          )}
        </span>
        <span className="text-sm text-purple-700">{actionText}</span>
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
                actionText="Change"
                completed={done.address}
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
                        className="mt-1 text-purple-700"
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
                        <div className="text-gray-600">{addr.addressLine}</div>
                        <div className="text-gray-600">
                          Mobile: {addr.mobile}
                        </div>
                        <div className="text-gray-600">Email: {addr.email}</div>
                        <button
                          type="button"
                          className="text-xs text-purple-700 mt-1"
                          onClick={() => {
                            setEditAddress(addr);
                            setIsAddressModalOpen(true);
                          }}
                        >
                          Edit address
                        </button>
                      </div>
                    </label>
                  ))}
                  <div className="flex justify-between items-center">
                    <button
                      className="text-sm text-purple-700"
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      Add new address
                    </button>
                    <button
                      className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedAddress}
                      onClick={() => {
                        setDone((d) => ({ ...d, address: true }));
                        setOpen({
                          address: false,
                          payment: true,
                          review: false,
                        });
                      }}
                    >
                      Deliver to this address
                    </button>
                  </div>
                </div>
              </Section>

              {/* Payment Details */}
              <Section
                title="Payment Details"
                isOpen={open.payment}
                onToggle={() => setOpen((p) => ({ ...p, payment: !p.payment }))}
                actionText="Change"
                completed={done.payment}
              >
                {/* UPI */}
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">UPI</div>
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paytype"
                        checked={paymentType === "upi" && upiOption === "id"}
                        onChange={() => {
                          setPaymentType("upi");
                          setUpiOption("id");
                          setUpiStatus("idle");
                          keepScroll();
                        }}
                      />
                      <span className="flex items-center gap-2">
                        Other UPI App
                        {paymentType === "upi" && upiOption === "id" && (
                          <>
                            <input
                              className={`ml-3 border px-2 py-1 rounded text-sm ${
                                upiId && !isValidUpiId(upiId)
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              placeholder="Enter UPI ID"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiStatus("idle");
                              }}
                            />
                            <button
                              type="button"
                              className={`text-purple-700 text-sm ${
                                isValidUpiId(upiId)
                                  ? ""
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                              disabled={!isValidUpiId(upiId)}
                              onClick={() => {
                                // Mock verification: treat IDs ending with a digit as valid
                                const ok =
                                  isValidUpiId(upiId) && /\d$/.test(upiId);
                                setUpiStatus(ok ? "valid" : "invalid");
                              }}
                            >
                              {upiStatus === "valid"
                                ? "Verified ✓"
                                : upiStatus === "invalid"
                                ? "Invalid ✕"
                                : "Verify ID"}
                            </button>
                          </>
                        )}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paytype"
                        checked={paymentType === "upi" && upiOption === "qr"}
                        onChange={() => {
                          setPaymentType("upi");
                          setUpiOption("qr");
                          setUpiStatus("idle");
                          keepScroll();
                        }}
                      />
                      <span>Scan QR Code and pay</span>
                    </label>
                  </div>
                </div>

                {/* Cards */}
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">
                    Credit or Debit Card
                  </div>
                  {cards.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 mb-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="paytype_card"
                        checked={
                          paymentType === "card" && selectedCardId === c.id
                        }
                        onChange={() => {
                          setPaymentType("card");
                          setSelectedCardId(c.id);
                          keepScroll();
                        }}
                      />
                      <span className="inline-flex items-center gap-2">
                        {c.brand === "visa" ? (
                          <Logo
                            name="visa"
                            alt="VISA"
                            fallback={<VisaIcon />}
                          />
                        ) : (
                          <Logo
                            name="mastercard"
                            alt="Mastercard"
                            fallback={<MastercardIcon />}
                          />
                        )}
                        <span>{c.label}</span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    className="text-purple-700 text-sm"
                    onClick={() => {
                      setPaymentType("card");
                      setIsCardModalOpen(true);
                    }}
                  >
                    Add new card
                  </button>
                </div>

                {/* Netbanking */}
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">Netbanking</div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-gray-200 rounded px-2 py-1 text-sm"
                      value={selectedBank}
                      onChange={(e) => {
                        setSelectedBank(e.target.value);
                        setPaymentType("netbanking");
                        keepScroll();
                      }}
                    >
                      <option value="">Select your bank</option>
                      <option value="SBI">SBI</option>
                      <option value="HDFC">HDFC</option>
                      <option value="ICICI">ICICI</option>
                      <option value="AXIS">AXIS</option>
                      <option value="KOTAK">KOTAK</option>
                    </select>
                    {selectedBank && (
                      <Logo
                        name={selectedBank.toLowerCase()}
                        alt={selectedBank}
                        fallback={<BankLogo code={selectedBank} />}
                      />
                    )}
                  </div>
                </div>

                {/* COD */}
                <div>
                  <div className="text-sm font-semibold mb-2">
                    Cash on Delivery
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="paytype"
                      checked={paymentType === "cod"}
                      onChange={() => {
                        setPaymentType("cod");
                        const y = window.scrollY;
                        setTimeout(() => window.scrollTo(0, y), 0);
                      }}
                    />
                    Cash on Delivery
                  </label>
                </div>
                {/* Inline CTA as per design */}
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isPaymentValid}
                    onClick={() => {
                      if (!isPaymentValid) return;
                      setOpen({ address: false, payment: false, review: true });
                      setDone((d) => ({ ...d, payment: true }));
                    }}
                  >
                    Use this payment method
                  </button>
                </div>
              </Section>

              {/* No inline CTA. Use the right-side primary CTA */}

              {/* Review Products */}
              <Section
                title="Review Products"
                isOpen={open.review}
                onToggle={() => setOpen((p) => ({ ...p, review: !p.review }))}
                actionText=""
              >
                <div>
                  {items.map((i) => {
                    const lineWrap = wrapMap[i.id]
                      ? WRAP_FEE_PER_UNIT * i.qty
                      : 0;
                    const lineTotal = i.price * i.qty + lineWrap;
                    return (
                      <>
                        <div
                          key={i.id}
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
                            <div className="text-purple-700 font-semibold">
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
                                      : dispatch(removeFromCart(i.id));
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
                                  dispatch(removeFromCart(i.id));
                                }}
                              >
                                Remove from cart
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
                            <span className="text-purple-700 font-semibold">
                              ₹{lineTotal}
                            </span>
                          </div>
                          {lineWrap > 0 && (
                            <div className="text-[11px] text-gray-500">
                              incl. wrap ₹{lineWrap}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="py-6 text-gray-500">
                      Your cart is empty.
                    </div>
                  )}
                </div>
              </Section>
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
                    <span>₹{delivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gift wrap:</span>
                    <span>₹{wrapTotal}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Payable Price:</span>
                    <span>₹{payable}</span>
                  </div>
                </div>
                <button
                  onClick={handlePrimaryAction}
                  className="w-full mt-4 px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    items.length === 0 ||
                    (currentStep === 1 && !selectedAddress) ||
                    (currentStep === 2 && !isPaymentValid)
                  }
                >
                  {ctaLabel}
                </button>
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
                  dispatch(addOrUpdateAddress(newAddr));
                } else {
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
                setSelectedAddressId(newAddr.id);
                setEditAddress(null);
                setIsAddressModalOpen(false);
              }}
            />
          </Modal>
          {/* Add Card Modal */}
          <Modal
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            title="Add new card"
          >
            {/* Inline validated card form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isCardValid) return;
                const mask = cardDigits.slice(-4);
                const card = {
                  id: `card_${cardBrand}_${mask}`,
                  brand: cardBrand,
                  mask,
                  label:
                    cardBrand === "visa"
                      ? `VISA card ending with ${mask}`
                      : cardBrand === "mastercard"
                      ? `Mastercard ending with ${mask}`
                      : cardBrand === "amex"
                      ? `Amex card ending with ${mask}`
                      : `Card ending with ${mask}`,
                };
                setCards((prev) => [...prev, card]);
                setSelectedCardId(card.id);
                setPaymentType("card");
                setIsCardModalOpen(false);
                // reset form
                setCardName("");
                setCardNumber("");
                setCardExpiry("");
                setCardCvv("");
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">Name on card</label>
                <input
                  className={`w-full border border-gray-200 rounded px-3 py-2 ${
                    cardErrors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />
                {cardErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{cardErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Card number</label>
                <input
                  className={`w-full border border-gray-200 rounded px-3 py-2 ${
                    cardErrors.number ? "border-red-500" : "border-gray-200"
                  }`}
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value).slice(0, 19);
                    const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
                    setCardNumber(grouped);
                  }}
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                />
                {cardErrors.number && (
                  <p className="text-xs text-red-600 mt-1">
                    {cardErrors.number}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Expiry (MM/YY)</label>
                  <input
                    className={`w-full border border-gray-200 rounded px-3 py-2 ${
                      cardErrors.expiry ? "border-red-500" : "border-gray-200"
                    }`}
                    value={cardExpiry}
                    onChange={(e) => {
                      const v = onlyDigits(e.target.value).slice(0, 4);
                      const mm = v.slice(0, 2);
                      const rest = v.slice(2);
                      setCardExpiry(mm + (rest ? "/" + rest : ""));
                    }}
                    placeholder="MM/YY"
                  />
                  {cardErrors.expiry && (
                    <p className="text-xs text-red-600 mt-1">
                      {cardErrors.expiry}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">CVV</label>
                  <input
                    className={`w-full border border-gray-200 rounded px-3 py-2 ${
                      cardErrors.cvv ? "border-red-500" : "border-gray-200"
                    }`}
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(onlyDigits(e.target.value).slice(0, 4))
                    }
                    inputMode="numeric"
                    placeholder={cardBrand === "amex" ? "4 digits" : "3 digits"}
                  />
                  {cardErrors.cvv && (
                    <p className="text-xs text-red-600 mt-1">
                      {cardErrors.cvv}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isCardValid}
                  className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save card
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
}
