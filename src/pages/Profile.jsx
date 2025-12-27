import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  updateProfile,
  setDefaultAddress,
  removeAddress,
  addOrUpdateAddress,
  fetchAddressesAsync,
  addAddressAsync,
  updateAddressAsync,
  removeAddressAsync,
  setDefaultAddressAsync,
  fetchUserProfileAsync,
  updateProfileAsync,
} from "../features/user/userSlice";
import Modal from "../components/Modal";
import AddressForm from "../components/AddressForm";
import Dropdown from "../components/Dropdown";
import CustomCalendar from "../components/CustomCalendar";
import { ChevronDown } from "lucide-react";


export default function Profile() {
  const user = useSelector((s) => s.user);
  const orders = useSelector((s) => s.orders?.orders || []);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "profile";
  const [tab, setTab] = React.useState(initialTab); // 'profile' | 'orders' | 'addresses' | 'payments'

  // Update tab when query params change
  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Track if profile has been fetched to prevent redundant API calls
  const profileFetchedRef = React.useRef(false);

  // Fetch user profile when tab changes to 'profile'
  React.useEffect(() => {
    if (tab === "profile" && !profileFetchedRef.current) {
      dispatch(fetchUserProfileAsync());
      profileFetchedRef.current = true;
    }
  }, [tab, dispatch]);

  // Fetch addresses when tab changes to 'addresses'
  React.useEffect(() => {
    if (tab === "addresses" && user?.profile?.id) {
      dispatch(fetchAddressesAsync(user.profile.id));
    }
  }, [tab, user?.profile?.id, dispatch]);

  // Scroll to top when tab changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  // Profile form state
  const [name, setName] = React.useState(user?.profile?.name || "");
  const [firstName, setFirstName] = React.useState(user?.profile?.firstName || "");
  const [lastName, setLastName] = React.useState(user?.profile?.lastName || "");
  const [mobile, setMobile] = React.useState(user?.profile?.mobile || "");
  const [email, setEmail] = React.useState(user?.profile?.email || "");
  const [dob, setDob] = React.useState(user?.profile?.dob || "");
  const [gender, setGender] = React.useState(user?.profile?.gender || "Male");
  const [profileErrors, setProfileErrors] = React.useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  // Sync form state with Redux store when user profile data changes
  React.useEffect(() => {
    setName(user?.profile?.name || "");
    setFirstName(user?.profile?.firstName || "");
    setLastName(user?.profile?.lastName || "");
    setMobile(user?.profile?.mobile || "");
    setEmail(user?.profile?.email || "");
    setDob(user?.profile?.dob || "");
    setGender(user?.profile?.gender || "Male");
  }, [user?.profile]);

  const onlyDigits = (v) => v.replace(/\D/g, "");
  const strongEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const handleSaveProfile = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (onlyDigits(mobile).length !== 10) errs.mobile = "Enter 10-digit mobile";
    if (email && !strongEmail(email)) errs.email = "Enter a valid email";
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    // Use updateProfileAsync to call the API
    dispatch(
      updateProfileAsync({
        name: name.trim(),
        mobile: `${onlyDigits(mobile)}`,
        email: email.trim(),
        dob,
        gender,
      })
    );
    setIsProfileModalOpen(false);
  };

  // Addresses
  const addresses = user?.profile?.addresses || [];
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editAddress, setEditAddress] = React.useState(null);

  // Payments (saved cards kept in profile.cards)
  const [cards, setCards] = React.useState(user?.profile?.cards || []);
  React.useEffect(
    () => setCards(user?.profile?.cards || []),
    [user?.profile?.cards]
  );
  const defaultCardId = user?.profile?.defaultCardId;
  const billingCard =
    cards.find((c) => c.id === defaultCardId) || cards[0] || null;
  const [isCardModalOpen, setIsCardModalOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState(null); // when set, modal edits existing card
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvv, setCardCvv] = React.useState("");

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
  const onlyDigitsCard = (v) => v.replace(/\D/g, "");
  const cardDigits = onlyDigitsCard(cardNumber);
  const cardBrand = detectBrand(cardDigits);
  const isFutureExpiry = (mmYY) => {
    const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const mm = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    if (mm < 1 || mm > 12) return false;
    const year = 2000 + yy;
    const exp = new Date(year, mm, 0, 23, 59, 59, 999);
    return exp >= new Date();
  };
  const cardErrors = React.useMemo(() => {
    const errs = {};
    if (!cardName.trim()) errs.name = "Name on card is required";
    const expectedLen = cardBrand === "amex" ? 15 : 16;
    const isEditing = !!editingCard;
    // For editing, card number is optional; validate only if provided
    if (!isEditing || cardDigits.length > 0) {
      if (cardDigits.length !== expectedLen)
        errs.number =
          expectedLen === 15
            ? "AMEX requires 15 digits"
            : "Card number must be 16 digits";
      else if (!luhnCheck(cardDigits)) errs.number = "Invalid card number";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry) || !isFutureExpiry(cardExpiry))
      errs.expiry = "Enter valid MM/YY";
    const cvvLen = cardBrand === "amex" ? 4 : 3;
    if (!editingCard || onlyDigitsCard(cardCvv).length > 0) {
      if (onlyDigitsCard(cardCvv).length !== cvvLen)
        errs.cvv =
          cardBrand === "amex"
            ? "AMEX CVV must be 4 digits"
            : "CVV must be 3 digits";
    }
    return errs;
  }, [cardName, cardDigits, cardExpiry, cardCvv, cardBrand, editingCard]);
  const isCardValid = Object.keys(cardErrors).length === 0;
  const [openCardId, setOpenCardId] = React.useState(null);

  const saveCard = () => {
    if (!isCardValid) return;
    if (editingCard) {
      const current = editingCard;
      let updated = { ...current, name: cardName.trim(), expiry: cardExpiry };
      if (cardDigits.length > 0 && luhnCheck(cardDigits)) {
        const newMask = cardDigits.slice(-4);
        const newBrand = cardBrand;
        updated = {
          ...updated,
          brand: newBrand,
          mask: newMask,
          label: `${newBrand.toUpperCase()} card ending with ${newMask}`,
        };
      }
      const next = cards.map((c) => (c.id === current.id ? updated : c));
      setCards(next);
      dispatch(updateProfile({ cards: next }));
      setEditingCard(null);
    } else {
      const mask = cardDigits.slice(-4);
      const newCard = {
        id: `card_${cardBrand}_${mask}`,
        brand: cardBrand,
        mask,
        label: `${cardBrand.toUpperCase()} card ending with ${mask}`,
        name: cardName.trim(),
        expiry: cardExpiry,
      };
      const next = [...cards, newCard];
      setCards(next);
      const payload = { cards: next };
      if (!defaultCardId) payload.defaultCardId = newCard.id; // first saved card becomes billing by default
      dispatch(updateProfile(payload));
    }
    setIsCardModalOpen(false);
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  const BrandBadge = ({ brand }) => {
    const src = `/assets/logos/${(brand || "").toLowerCase()}.svg`;
    return (
      <img
        src={src}
        alt={brand}
        className="h-4 w-auto mr-2"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  };

  const AccordionBody = ({ isOpen, children }) => {
    const innerRef = React.useRef(null);
    const [maxHeight, setMaxHeight] = React.useState(0);
    React.useEffect(() => {
      if (innerRef.current) {
        setMaxHeight(innerRef.current.scrollHeight);
      }
    }, [children, isOpen]);
    return (
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? maxHeight : 0 }}
      >
        <div ref={innerRef} className="border-t p-4 text-sm space-y-3">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto py-6 px-4 md:px-15 lg:px-20 md:pb-6 pb-28 min-h-[30vh] xl:min-h-[70vh]">
      {/* <div className="py-1">
        <Breadcrumb items={[{ label: "Home", link: "/" }, { label: "Profile" }]} />
      </div> */}
      {/* Tabs - Desktop View */}
      <div className="hidden md:flex gap-6 text-sm mb-6">
        <button
          className={`${tab === "profile"
            ? "border-b-2 border-brand-700 text-brand-700"
            : "text-gray-600"
            }`}
          onClick={() => setTab("profile")}
        >
          Your Profile
        </button>
        {/* <button
          className={`${tab === "orders"
            ? "border-b-2 border-brand-700 text-brand-700"
            : "text-gray-600"
            }`}
          onClick={() => setTab("orders")}
        >
          Recent Orders
        </button> */}
        <button
          className={`${tab === "addresses"
            ? "border-b-2 border-brand-700 text-brand-700"
            : "text-gray-600"
            }`}
          onClick={() => setTab("addresses")}
        >
          Saved Addresses
        </button>
        {/* <button
          className={`${tab === "payments"
            ? "border-b-2 border-brand-700 text-brand-700"
            : "text-gray-600"
            }`}
          onClick={() => setTab("payments")}
        >
          Payment Options
        </button> */}
      </div>

      {/* Tabs - Mobile View (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 flex gap-2 px-2 py-2 z-40 overflow-x-auto">
        <button
          className={`px-3 py-2 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${tab === "profile"
            ? "bg-gray-100 text-gray-900 border-2 border-gray-200"
            : "bg-white text-gray-600 border border-gray-300"
            }`}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
        {/* <button
          className={`px-3 py-2 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${tab === "orders"
            ? "bg-gray-100 text-gray-900 border-2 border-gray-200"
            : "bg-white text-gray-600 border border-gray-300"
            }`}
          onClick={() => setTab("orders")}
        >
          Orders
        </button> */}
        <button
          className={`px-3 py-2 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${tab === "addresses"
            ? "bg-gray-100 text-gray-900 border-2 border-gray-200"
            : "bg-white text-gray-600 border border-gray-300"
            }`}
          onClick={() => setTab("addresses")}
        >
          Saved Addresses
        </button>
        {/* <button
          className={`px-3 py-2 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${tab === "payments"
            ? "bg-gray-100 text-gray-900 border-2 border-gray-200"
            : "bg-white text-gray-600 border border-gray-300"
            }`}
          onClick={() => setTab("payments")}
        >
          Payment Options
        </button> */}
      </div>

      {tab === "profile" && (
        <div className="bg-white py-4 max-w-5xl">
          <p className="text-2xl font-bold mb-4">Profile</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 block text-sm mb-1">Name *</label>
              <input
                className={`w-full border rounded px-3 py-2 ${profileErrors.name ? "border-red-500" : "border-gray-200"
                  } bg-gray-50 cursor-not-allowed`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled
                readOnly
              />
              {profileErrors.name && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-500 block text-sm mb-1">
                Mobile Number *
              </label>
              <input
                className={`w-full border rounded px-3 py-2 ${profileErrors.mobile ? "border-red-500" : "border-gray-200"
                  } bg-gray-50 cursor-not-allowed`}
                value={mobile}
                onChange={(e) =>
                  setMobile(onlyDigits(e.target.value).slice(0, 10))
                }
                placeholder="0000000000"
                inputMode="numeric"
                disabled
                readOnly
              />
              {profileErrors.mobile && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.mobile}
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-500 block text-sm mb-1">Email</label>
              <input
                className={`w-full border rounded px-3 py-2 ${profileErrors.email ? "border-red-500" : "border-gray-200"
                  } bg-gray-50 cursor-not-allowed`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@email.com"
                disabled
                readOnly
              />
              {profileErrors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.email}
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-500 block text-sm mb-1">
                Date of Birth
              </label>
              <input
                className="w-full border rounded px-3 py-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="DD/MM/YYYY"
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="text-gray-500 block text-sm mb-1">Gender</label>
              <Dropdown
                options={["Male", "Female", "Other"]}
                value={gender}
                onChange={(e) => setGender(e)}
                disabled
              />
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full md:w-auto mt-4 px-4 py-2 bg-brand-700 text-white rounded-md cursor-pointer"
          >
            Edit Profile
          </button>
          <Modal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            title="Edit Profile"
            className="max-w-3xl w-full m-4"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile();
                if (Object.keys(profileErrors).length === 0) {
                  setIsProfileModalOpen(false);
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    Name *
                  </label>
                  <input
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition ${profileErrors.name ? "border-red-500" : "border-gray-200"
                      }`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    Mobile Number *
                  </label>
                  <input
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition ${profileErrors.mobile
                      ? "border-red-500"
                      : "border-gray-200"
                      }`}
                    value={mobile}
                    onChange={(e) =>
                      setMobile(onlyDigits(e.target.value).slice(0, 10))
                    }
                    placeholder="0000000000"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    Email
                  </label>
                  <input
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition ${profileErrors.email ? "border-red-500" : "border-gray-200"
                      }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@email.com"
                  />
                </div>
                <div>
                  <CustomCalendar
                    label="Date of Birth"
                    value={dob}
                    onChange={(date) => setDob(date)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    Gender
                  </label>
                  <Dropdown
                    options={["Male", "Female", "Other"]}
                    value={gender}
                    onChange={(v) => setGender(v)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-700 text-white rounded cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {tab === "addresses" && (
        <div className="max-w-4xl">
          <p className="text-2xl font-bold mb-4">Saved Addresses</p>
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border-b border-gray-300 py-4 text-sm"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={addr.isDefault}
                    readOnly
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {addr.name || "Address"}
                      {addr.tag && (
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                          {addr.tag}
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="ml-2 text-xs bg-brand-50 px-2 py-0.5 rounded border border-brand-800 text-brand-900 font-extrabold ">
                          Default address
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      Delivery address: {addr.addressLine || [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode ? `- ${addr.postalCode}` : ""].filter(Boolean).join(", ")}
                    </div>
                    <div className="text-gray-600">
                      Mobile number: {addr.mobile || addr.phone}
                    </div>
                    {addr.email && (
                      <div className="text-gray-600">Email: {addr.email}</div>
                    )}
                    <div className="mt-2 flex gap-3">
                      <button
                        className="text-xs text-brand-700 cursor-pointer"
                        onClick={() => {
                          setEditAddress(addr);
                          setIsAddressModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-brand-700 cursor-pointer"
                        onClick={() => {
                          const addressId = addr._id || addr.id;
                          dispatch(removeAddressAsync(addressId));
                        }}
                      >
                        Remove
                      </button>
                      {!addr.isDefault && (
                        <button
                          className="ml-auto text-xs border border-gray-300 text-gray-700 rounded px-2 py-1 font-semibold cursor-pointer"
                          onClick={() => {
                            const addressId = addr._id || addr.id;
                            dispatch(setDefaultAddressAsync(addressId));
                          }}
                        >
                          Set as Default address
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-brand-700 text-white rounded cursor-pointer"
            onClick={() => {
              setEditAddress(null);
              setIsAddressModalOpen(true);
            }}
          >
            Add new address
          </button>
          <Modal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            title={editAddress ? "Edit Address" : "Add new Address"}
          >
            <AddressForm
              initial={editAddress || undefined}
              submitLabel={editAddress ? "Save address" : "Use this address"}
              onCancel={() => setIsAddressModalOpen(false)}
              onSubmit={(a) => {
                if (editAddress) {
                  const addressId = editAddress._id || editAddress.id;
                  dispatch(updateAddressAsync({
                    addressId: addressId,
                    addressData: a
                  }));
                } else {
                  // creating new address via API
                  dispatch(addAddressAsync(a));
                }
                setIsAddressModalOpen(false);
              }}
            />
          </Modal>
        </div>
      )}


      {/* {tab === "orders" && (
        <div className="space-y-6">
          <p className="text-2xl font-bold mb-4">Recent orders</p>
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700">
                <div className="col-span-2">Order ID</div>
                <div className="col-span-5">Items</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Order Date</div>
                <div className="col-span-2">Total</div>
              </div>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-stretch gap-3 px-4 py-3 border-t text-sm"
                >
                  <div className="col-span-2 flex items-center">{order.id}</div>
                  <div className="col-span-5 flex gap-4">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-gray-500">
                        Material: {it.material || "-"} &nbsp; Size:{" "}
                        {it.size || "-"}
                      </div>
                      <div className="text-brand-700 font-semibold">
                        ₹{it.price}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-xs px-2 py-1 rounded border text-yellow-700 border-yellow-300">
                      {order.status || "Placed"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex items-center">
                    ₹{order.totals?.payable}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-gray-500">No orders yet.</div>
          )}
        </div>
      )} */}


      {/* {tab === "payments" && (
        <div className="max-w-4xl">
          <p className="text-2xl font-bold mb-4">Payment Options</p>
          <div className="space-y-3">
            {cards.map((c) => {
              const isOpen = openCardId === c.id;
              const defaultAddr =
                addresses.find((a) => a.isDefault) || addresses[0] || null;
              return (
                <div key={c.id} className="border-y border-gray-300">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setOpenCardId(isOpen ? null : c.id)}
                  >
                    <div className="text-sm flex items-center gap-2">
                      <BrandBadge brand={c.brand} />
                      <div>
                        <div className="font-medium uppercase">{c.brand}</div>
                        <div className="text-gray-600">{c.label}</div>
                      </div>
                      {billingCard?.id === c.id && (
                        <span className="ml-2 px-2 py-1 text-xs rounded border-2 border-brand-300 bg-brand-50 text-brand-700 font-bold">
                          Billing card
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                         
                          setEditingCard(c);
                          setCardName(c.name || "");
                          setCardNumber("");
                          setCardExpiry(c.expiry || "");
                          setCardCvv("");
                          setIsCardModalOpen(true);
                        }}
                      >
                        Edit card details
                      </button>
                      <button
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = cards.filter((x) => x.id !== c.id);
                          setCards(next);
                          dispatch(
                            updateProfile({
                              cards: next,
                              defaultCardId: next[0]?.id || null,
                            })
                          );
                        }}
                      >
                        Delete Card
                      </button>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </div>
                  <AccordionBody isOpen={isOpen}>
                    <div className="text-gray-700">Billing address</div>
                    {defaultAddr ? (
                      <div className="text-gray-600 space-y-1">
                        <div>
                          {defaultAddr.name}
                          {defaultAddr.tag && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {defaultAddr.tag}
                            </span>
                          )}
                        </div>
                        <div>Delivery address: {defaultAddr.addressLine}</div>
                        <div>Mobile number: {defaultAddr.mobile}</div>
                        {defaultAddr.email && (
                          <div>Email: {defaultAddr.email}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        No address saved. Add one in Saved Addresses.
                      </div>
                    )}
                    {billingCard?.id !== c.id && (
                      <button
                        className="mt-2 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm"
                        onClick={() =>
                          dispatch(updateProfile({ defaultCardId: c.id }))
                        }
                      >
                        Set as Billing card
                      </button>
                    )}
                  </AccordionBody>
                </div>
              );
            })}
            {cards.length === 0 && (
              <div className="text-gray-500">No saved cards.</div>
            )}
          </div>
          

          <button
            className="mt-4 px-4 py-2 bg-brand-700 text-white rounded"
            onClick={() => {
              setEditingCard(null);
              setIsCardModalOpen(true);
            }}
          >
            Add new card
          </button>

          <Modal
            isOpen={isCardModalOpen}
            onClose={() => {
              setIsCardModalOpen(false);
              setEditingCard(null);
            }}
            title={editingCard ? "Edit card details" : "Add new card"}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCard();
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-gray-500 block text-sm mb-1">
                  Name on card
                </label>
                <input
                  className={`w-full border rounded px-3 py-2 border-gray-300`}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />
                {cardErrors.name ? (
                  <p className="text-xs text-red-600 mt-1">{cardErrors.name}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    Name on card is required
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-500 block text-sm mb-1">
                  Card number
                </label>
                <input
                  className={`w-full border rounded px-3 py-2 border-gray-300`}
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = onlyDigitsCard(e.target.value).slice(0, 19);
                    const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
                    setCardNumber(grouped);
                  }}
                  inputMode="numeric"
                  placeholder={
                    editingCard
                      ? "(leave blank to keep current)"
                      : "1234 5678 9012 3456"
                  }
                />
                {cardErrors.number ? (
                  <p className="text-xs text-red-600 mt-1">
                    {cardErrors.number}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    Card number must be 16 digits
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    className={`w-full border rounded px-3 py-2 border-gray-300`}
                    value={cardExpiry}
                    onChange={(e) => {
                      const v = onlyDigitsCard(e.target.value).slice(0, 4);
                      const mm = v.slice(0, 2);
                      const rest = v.slice(2);
                      setCardExpiry(mm + (rest ? "/" + rest : ""));
                    }}
                    placeholder="MM/YY"
                  />
                  {cardErrors.expiry ? (
                    <p className="text-xs text-red-600 mt-1">
                      {cardErrors.expiry}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Enter valid MM/YY
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-500 block text-sm mb-1">
                    CVV
                  </label>
                  <input
                    className={`w-full border rounded px-3 py-2 border-gray-300`}
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(onlyDigitsCard(e.target.value).slice(0, 4))
                    }
                    inputMode="numeric"
                    placeholder={
                      editingCard
                        ? "(optional)"
                        : cardBrand === "amex"
                          ? "4 digits"
                          : "3 digits"
                    }
                  />
                  {cardErrors.cvv ? (
                    <p className="text-xs text-red-600 mt-1">
                      {cardErrors.cvv}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      {cardBrand === "amex"
                        ? "CVV must be 4 digits"
                        : "CVV must be 3 digits"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCardModalOpen(false);
                    setEditingCard(null);
                  }}
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
      )} */}

    </div>
  );
}
