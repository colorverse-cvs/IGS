import React, { useState } from "react";
import indianStates from "../data/indianStates.json";

export default function AddressForm({ onSubmit, onCancel, initial, submitLabel = "Use this address" }) {
  const [name, setName] = useState(initial?.name || "");
  const [mobile, setMobile] = useState(initial?.mobile || "");
  const [flat, setFlat] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [makeDefault, setMakeDefault] = useState(initial?.isDefault || false);
  const [errors, setErrors] = useState({});

  const onlyDigits = (value) => value.replace(/\D/g, "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!name.trim()) validationErrors.name = "Name is required";

    const mobileDigits = onlyDigits(mobile);
    if (mobileDigits.length !== 10) validationErrors.mobile = "Enter a valid 10-digit mobile number";

    if (!/^[0-9]{6}$/.test(pincode)) validationErrors.pincode = "Pincode must be 6 digits";
    if (!state) validationErrors.state = "Please select your state";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const addressLine = [
      flat,
      area,
      landmark ? `Near ${landmark}` : "",
      city,
      state,
      pincode ? `- ${pincode}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const newAddress = {
      id: initial?.id || `addr_${Date.now()}`,
      name: name.trim(),
      tag: "Home",
      addressLine,
      mobile: `+91 ${mobileDigits}`,
      email: "",
      isDefault: makeDefault,
    };
    onSubmit?.(newAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          className={`w-full border rounded px-3 py-2 ${errors.name ? "border-red-500" : ""}`}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mobile Number *</label>
        <input
          type="tel"
          className={`w-full border rounded px-3 py-2 ${errors.mobile ? "border-red-500" : ""}`}
          placeholder="Enter 10 digits"
          value={mobile}
          onChange={(e) => setMobile(onlyDigits(e.target.value).slice(0, 10))}
          inputMode="numeric"
          maxLength={10}
        />
        {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Flat, House no., Building, Company, Apartment</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={flat}
          onChange={(e) => setFlat(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Area, Street, Sector, Village</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Near by Landmark</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Eg: Near Famous chowk"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Pincode *</label>
        <input
          type="text"
          className={`w-full border rounded px-3 py-2 ${errors.pincode ? "border-red-500" : ""}`}
          placeholder="6 digits [0-9]"
          value={pincode}
          onChange={(e) => setPincode(onlyDigits(e.target.value).slice(0, 6))}
          required
        />
        {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <select
            className={`w-full border rounded px-3 py-2 ${errors.state ? "border-red-500" : ""}`}
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          >
            <option value="">Select your state</option>
            {indianStates.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={makeDefault}
          onChange={(e) => setMakeDefault(e.target.checked)}
        />
        Make this my default address
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
