import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateProfile,
  setDefaultAddress,
  removeAddress,
  addOrUpdateAddress,
} from "../features/user/userSlice";
import Modal from "../components/Modal";
import AddressForm from "../components/AddressForm";

export default function Profile() {
  const user = useSelector((s) => s.user);
  const orders = useSelector((s) => s.orders?.orders || []);
  const dispatch = useDispatch();

  const [tab, setTab] = React.useState("profile"); // 'profile' | 'orders' | 'addresses' | 'payments'

  // Profile form state
  const [name, setName] = React.useState(user?.profile?.name || "");
  const [mobile, setMobile] = React.useState(user?.profile?.mobile || "");
  const [email, setEmail] = React.useState(user?.profile?.email || "");
  const [dob, setDob] = React.useState(user?.profile?.dob || "");
  const [gender, setGender] = React.useState(user?.profile?.gender || "Male");
  const [profileErrors, setProfileErrors] = React.useState({});

  const onlyDigits = (v) => v.replace(/\D/g, "");
  const strongEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const handleSaveProfile = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (onlyDigits(mobile).length !== 10) errs.mobile = "Enter 10-digit mobile";
    if (email && !strongEmail(email)) errs.email = "Enter a valid email";
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch(
      updateProfile({
        name: name.trim(),
        mobile: `+91 ${onlyDigits(mobile)}`,
        email: email.trim(),
        dob,
        gender,
      })
    );
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
    if (cardDigits.length !== expectedLen)
      errs.number =
        expectedLen === 15
          ? "AMEX requires 15 digits"
          : "Card number must be 16 digits";
    else if (!luhnCheck(cardDigits)) errs.number = "Invalid card number";
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry) || !isFutureExpiry(cardExpiry))
      errs.expiry = "Enter valid MM/YY";
    const cvvLen = cardBrand === "amex" ? 4 : 3;
    if (onlyDigitsCard(cardCvv).length !== cvvLen)
      errs.cvv =
        cardBrand === "amex"
          ? "AMEX CVV must be 4 digits"
          : "CVV must be 3 digits";
    return errs;
  }, [cardName, cardDigits, cardExpiry, cardCvv, cardBrand]);
  const isCardValid = Object.keys(cardErrors).length === 0;

  const saveCard = () => {
    if (!isCardValid) return;
    const mask = cardDigits.slice(-4);
    const newCard = {
      id: `card_${cardBrand}_${mask}`,
      brand: cardBrand,
      mask,
      label: `${cardBrand.toUpperCase()} card ending with ${mask}`,
    };
    const next = [...cards, newCard];
    setCards(next);
    const payload = { cards: next };
    if (!defaultCardId) payload.defaultCardId = newCard.id; // first saved card becomes billing by default
    dispatch(updateProfile(payload));
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-6 text-sm mb-6">
        <button
          className={`pb-2 ${
            tab === "profile"
              ? "border-b-2 border-brand-700 text-purple-700"
              : "text-gray-600"
          }`}
          onClick={() => setTab("profile")}
        >
          Your Profile
        </button>
        <button
          className={`pb-2 ${
            tab === "orders"
              ? "border-b-2 border-brand-700 text-purple-700"
              : "text-gray-600"
          }`}
          onClick={() => setTab("orders")}
        >
          Recent Orders
        </button>
        <button
          className={`pb-2 ${
            tab === "addresses"
              ? "border-b-2 border-brand-700 text-purple-700"
              : "text-gray-600"
          }`}
          onClick={() => setTab("addresses")}
        >
          Saved Addresses
        </button>
        <button
          className={`pb-2 ${
            tab === "payments"
              ? "border-b-2 border-brand-700 text-purple-700"
              : "text-gray-600"
          }`}
          onClick={() => setTab("payments")}
        >
          Payment options
        </button>
      </div>

      {tab === "profile" && (
        <div className="bg-white py-6 max-w-5xl">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <input
                className={`w-full border rounded px-3 py-2 ${
                  profileErrors.name ? "border-red-500" : "border-gray-200"
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              {profileErrors.name && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Mobile Number *</label>
              <input
                className={`w-full border rounded px-3 py-2 ${
                  profileErrors.mobile ? "border-red-500" : "border-gray-200"
                }`}
                value={mobile}
                onChange={(e) =>
                  setMobile(onlyDigits(e.target.value).slice(0, 10))
                }
                placeholder="0000000000"
                inputMode="numeric"
              />
              {profileErrors.mobile && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.mobile}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                className={`w-full border rounded px-3 py-2 ${
                  profileErrors.email ? "border-red-500" : "border-gray-200"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@email.com"
              />
              {profileErrors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {profileErrors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Date of Birth</label>
              <input
                className="w-full border rounded px-3 py-2 border-gray-200"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Gender</label>
              <select
                className="w-full border rounded px-3 py-2 border-gray-200"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            className="mt-4 px-4 py-2 bg-brand-700 text-white rounded"
          >
            Edit Profile
          </button>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Recent orders</h2>
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
                      <div className="text-purple-700 font-semibold">
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
      )}

      {tab === "addresses" && (
        <div className="max-w-4xl">
          <h2 className="text-lg font-semibold mb-4">Saved Addresses</h2>
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
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
                      {addr.name}
                      {addr.tag && (
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                          {addr.tag}
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                          Default address
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      Delivery address: {addr.addressLine}
                    </div>
                    <div className="text-gray-600">
                      Mobile number: {addr.mobile}
                    </div>
                    {addr.email && (
                      <div className="text-gray-600">Email: {addr.email}</div>
                    )}
                    <div className="mt-2 flex gap-3">
                      <button
                        className="text-xs text-purple-700"
                        onClick={() => {
                          setEditAddress(addr);
                          setIsAddressModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-purple-700"
                        onClick={() => dispatch(removeAddress(addr.id))}
                      >
                        Remove
                      </button>
                      {!addr.isDefault && (
                        <button
                          className="ml-auto text-xs border rounded px-2 py-1"
                          onClick={() => dispatch(setDefaultAddress(addr.id))}
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
            className="mt-4 px-4 py-2 bg-brand-700 text-white rounded"
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
                dispatch(addOrUpdateAddress(a));
                setIsAddressModalOpen(false);
              }}
            />
          </Modal>
        </div>
      )}

      {tab === "payments" && (
        <div className="max-w-4xl">
          <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
          <div className="space-y-4">
            {cards.map((c) => (
              <div
                key={c.id}
                className="border rounded p-4 flex items-center justify-between"
              >
                <div className="text-sm flex items-center">
                  <BrandBadge brand={c.brand} />
                  <div>
                    <div className="font-medium uppercase">{c.brand}</div>
                    <div className="text-gray-600">{c.label}</div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {billingCard?.id === c.id && (
                    <span className="px-2 py-1 text-xs rounded border border-green-300 text-green-700">
                      Billing card
                    </span>
                  )}
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={() => {
                      /* stretch goal: edit card */
                    }}
                  >
                    Edit card details
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={() => {
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
                  {billingCard?.id !== c.id && (
                    <button
                      className="px-3 py-1 border rounded text-sm"
                      onClick={() =>
                        dispatch(updateProfile({ defaultCardId: c.id }))
                      }
                    >
                      Set as Billing card
                    </button>
                  )}
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="text-gray-500">No saved cards.</div>
            )}
          </div>
          {billingCard && (
            <div className="mt-6 border rounded p-4 text-sm">
              <div className="font-semibold mb-2">Billing card</div>
              <div className="flex items-center uppercase text-gray-700">
                <BrandBadge brand={billingCard.brand} />
                {billingCard.brand}
              </div>
              <div className="text-gray-600">{billingCard.label}</div>
            </div>
          )}
          {/* Billing address */}
          {addresses.find((a) => a.isDefault) && (
            <div className="mt-6 border-y border-gray-300 ounded p-4 text-sm">
              <div className="font-semibold mb-2">Billing address</div>
              <div>
                {addresses.find((a) => a.isDefault).name}{" "}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {addresses.find((a) => a.isDefault).tag}
                </span>
              </div>
              <div className="text-gray-600">
                Delivery address:{" "}
                {addresses.find((a) => a.isDefault).addressLine}
              </div>
              <div className="text-gray-600">
                Mobile number: {addresses.find((a) => a.isDefault).mobile}
              </div>
              {addresses.find((a) => a.isDefault).email && (
                <div className="text-gray-600">
                  Email: {addresses.find((a) => a.isDefault).email}
                </div>
              )}
            </div>
          )}

          <button
            className="mt-6 px-4 py-2 border rounded text-sm"
            onClick={() => setIsCardModalOpen(true)}
          >
            Add new card
          </button>

          <Modal
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            title="Add new card"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCard();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">Name on card</label>
                <input
                  className={`w-full border rounded px-3 py-2 ${
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
                  className={`w-full border rounded px-3 py-2 ${
                    cardErrors.number ? "border-red-500" : "border-gray-200"
                  }`}
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = onlyDigitsCard(e.target.value).slice(0, 19);
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
                    className={`w-full border rounded px-3 py-2 ${
                      cardErrors.expiry ? "border-red-500" : "border-gray-200"
                    }`}
                    value={cardExpiry}
                    onChange={(e) => {
                      const v = onlyDigitsCard(e.target.value).slice(0, 4);
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
                    className={`w-full border rounded px-3 py-2 ${
                      cardErrors.cvv ? "border-red-500" : "border-gray-200"
                    }`}
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(onlyDigitsCard(e.target.value).slice(0, 4))
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
                  className="px-4 py-2 bg-brand-700 text-white rounded disabled:opacity-50"
                >
                  Save card
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
