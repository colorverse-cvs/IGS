import React, { useState } from "react";
import indianStates from "../data/indianStates.json";
import Dropdown from "./Dropdown";
import CustomSearchDropdown from "./CustomSearchDropdown";
import { validatePincode } from "../utils/helpers";
/**
 * AddressForm Component - Delivery address input form
 * 
 * Props:
 * - onSubmit: function(addressObject) - called with complete form data
 * - onCancel: function() - called when user clicks cancel
 * - initial: object (optional) - pre-fill form with existing address data
 * - submitLabel: string (default: "Use this address") - button label
 * 
 * Features:
 * - Full address form with Indian states dropdown
 * - Validates mobile (10 digits) and pincode (6 digits)
 * - Address aliases (Home, Work, Other) for saving multiple addresses
 * - Set as default address option
 * - Displays validation errors inline
 * 
 * For beginners:
 * - Uses indianStates.json for state dropdown options
 * - onlyDigits() helper removes non-numeric characters from input
 * - Form validation runs before calling onSubmit
 */
export default function AddressForm({
  onSubmit,
  onCancel,
  initial,
  submitLabel = "Use this address",
}) {
  const [mobile, setMobile] = useState(initial?.mobile || initial?.phone || "");

  // Initialize granular fields from API structure
  const [flat, setFlat] = useState(initial?.line1 || initial?.flat || "");
  const [area, setArea] = useState(initial?.line2 || initial?.area || "");
  const [landmark, setLandmark] = useState(initial?.line3 || initial?.landmark || "");
  const [pincode, setPincode] = useState(initial?.postalCode || initial?.pincode || "");
  const [city, setCity] = useState(initial?.city || "");
  const [state, setState] = useState(initial?.state || "");

  // Address type aliases
  const DEFAULT_ALIASES = ["Home", "Work", "Other"];
  const aliasOptions = React.useMemo(() => {
    const existing = initial?.tag;
    return existing && !DEFAULT_ALIASES.includes(existing)
      ? [existing, ...DEFAULT_ALIASES]
      : DEFAULT_ALIASES;
  }, [initial?.tag]);
  const [alias, setAlias] = useState(initial?.tag || "Home");
  const [makeDefault, setMakeDefault] = useState(initial?.isDefault || false);
  const [errors, setErrors] = useState({});

  // Remove all non-digit characters
  const onlyDigits = (value) => value.replace(/\D/g, "");

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};

    const mobileDigits = onlyDigits(mobile);
    if (mobileDigits.length !== 10)
      validationErrors.mobile = "Enter a valid 10-digit mobile number";

    if (!/^[0-9]{6}$/.test(pincode))
      validationErrors.pincode = "Pincode must be 6 digits";
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
      tag: alias.trim() || "Home",
      addressLine,
      mobile: `${mobileDigits}`,
      isDefault: makeDefault,
      // Granular fields for API
      line1: flat,
      line2: area,
      line3: landmark,
      city,
      state,
      postalCode: pincode,
      country: "India",
      phone: `${mobileDigits}`,
    };

    // If editing, preserve the existing ID
    if (initial?.id) {
      newAddress.id = initial.id;
    }
    if (initial?._id) {
      newAddress._id = initial._id;
    }

    onSubmit?.(newAddress);
  };

  const handleMobileChange = (e) => {
    let val = e.target.value;
    val = val.replace(/^(\+91|91)/, "");
    val = val.replace(/\D/g, "");
    val = val.slice(0, 10);
    setMobile(val);
  };

  // Debounce Pincode Change
  React.useEffect(() => {
    const validateAndFetchPincode = async () => {
      if (pincode.length !== 6) {
        // Only show error if user has typed something invalid length (and not empty initially or just starting)
        // Actually for better UX, maybe only error on submit or if length > 6 or < 6 after pause?
        // Let's stick to simple: if 6 digits, fetch. If not 6 digits, clear city/state if they were auto-filled?
        return;
      }

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (!data || data[0].Status !== "Success") {
          setErrors((prev) => ({ ...prev, pincode: "Invalid Pincode" }));
          return;
        }

        // Auto-fill city and state from API response
        const postOffice = data[0].PostOffice[0];
        setCity(postOffice.Block);
        setState(postOffice.State);

        // Clear pincode error if valid
        setErrors((prev) => ({ ...prev, pincode: "" }));
      } catch (error) {
        console.error("Pincode validation failed:", error);
        setErrors((prev) => ({ ...prev, pincode: "Invalid Pincode" }));
      }
    };

    const timer = setTimeout(() => {
      if (pincode.length === 6) {
        validateAndFetchPincode();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [pincode]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Mobile Number *
        </label>

        <div className="flex items-center">
          {/* <span className="px-2 text-gray-600">+91</span> */}
          <input
            type="tel"
            className={`w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.mobile ? "border-red-500" : ""
              }`}
            placeholder="Enter 10 digits"
            value={mobile}
            onChange={(e) => { handleMobileChange(e) }}
            inputMode="numeric"
            maxLength={10}
          />
        </div>
        {errors.mobile && (
          <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Flat, House no., Building, Company, Apartment
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          value={flat}
          onChange={(e) => setFlat(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Area, Street, Sector, Village
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Near by Landmark
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          placeholder="Eg: Near Famous chowk"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Pincode *
        </label>
        <input
          type="text"
          className={`w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.pincode ? "border-red-500" : ""
            }`}
          placeholder="6 digits [0-9]"
          value={pincode}
          onChange={(e) => setPincode(onlyDigits(e.target.value).slice(0, 6))}
          required
        />
        {errors.pincode && (
          <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            City
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={city}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              setCity(value);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            State *
          </label>
          {/* <Dropdown
            options={indianStates}
            value={state}
            onChange={(v) => setState(v)}
            placeholder="Select your state"
            className={`${errors.state ? "ring-2 ring-red-400" : ""}`}
          /> */}

          <CustomSearchDropdown
            options={indianStates}
            value={state}
            onChange={(v) => setState(v)}
            placeholder="Select your state"
            searchable
            className={errors.state ? "ring-2 ring-red-400" : ""}
          />

          {errors.state && (
            <p className="mt-1 text-xs text-red-600">{errors.state}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Alias
        </label>
        <Dropdown
          options={aliasOptions}
          value={alias}
          onChange={(v) => setAlias(v)}
          placeholder="Alias"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={makeDefault}
          onChange={(e) => setMakeDefault(e.target.checked)}
        />
        Make this my default address
      </label>

      <div className="flex justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-2 md:px-4 py-2 bg-brand-700 text-white rounded"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
