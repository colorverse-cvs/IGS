import { useRef, useState } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    shopName: "",
    contact: "",
    email: "",
    address: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "shopName" && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (name === "contact" && !/^[0-9]*$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const phoneValid = formData.contact.length === 10;

  const isShopFormValid =
    formData.shopName &&
    phoneValid &&
    emailValid &&
    formData.address &&
    preview;

  const passwordMatch =
    passwordData.newPassword === passwordData.confirmPassword;

  const isPasswordValid =
    passwordData.currentPassword &&
    passwordData.newPassword.length >= 6 &&
    passwordMatch;

  return (
    <>
      {/* SHOP SETTINGS */}
      <div className="space-y-6 bg-white p-4 rounded-md shadow">
        <p className="text-lg font-semibold">Shop Information</p>

        {/* SHOP NAME */}
        <div>
          <label>Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {!formData.shopName && (
            <p className="text-red-500 text-sm">Shop name is required</p>
          )}
        </div>

        {/* CONTACT & EMAIL */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Contact Number</label>
            <input
              type="text"
              name="contact"
              maxLength={10}
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {!phoneValid && formData.contact && (
              <p className="text-red-500 text-sm">
                Enter valid 10 digit number
              </p>
            )}
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {!emailValid && formData.email && (
              <p className="text-red-500 text-sm">
                Invalid email format
              </p>
            )}
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <label>Address</label>
          <textarea
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {!formData.address && (
            <p className="text-red-500 text-sm">Address is required</p>
          )}
        </div>

        {/* LOGO */}
        <div>
          <label>Shop Logo</label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={openFileDialog}
              className="w-24 h-24 border-2 border-gray-100 border-dashed flex items-center justify-center rounded-xl cursor-pointer"
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Upload />
              )}
            </div>
          </div>
          {!preview && (
            <p className="text-red-500 text-sm">Logo is required</p>
          )}
        </div>

        <button
          disabled={!isShopFormValid}
          className={`px-5 py-2 rounded-lg text-white
          ${isShopFormValid ? "bg-purple-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Save Shop Settings
        </button>
      </div>

      {/* PASSWORD SECTION */}
      <div className="space-y-5 bg-white p-4 rounded-md shadow mt-6">
        <p className="text-lg font-semibold">Change Admin Password</p>

        {/* PASSWORD FIELD COMPONENT */}
        {[
          { key: "currentPassword", label: "Current Password", show: "current" },
          { key: "newPassword", label: "New Password", show: "new" },
          { key: "confirmPassword", label: "Confirm Password", show: "confirm" }
        ].map((item) => (
          <div key={item.key} className="relative">
            <label>{item.label}</label>
            <input
              type={showPassword[item.show] ? "text" : "password"}
              name={item.key}
              value={passwordData[item.key]}
              onChange={handlePasswordChange}
              className="w-full border border-gray-100 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <span
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  [item.show]: !showPassword[item.show]
                })
              }
              className="absolute right-3 top-8 cursor-pointer text-gray-500"
            >
              {showPassword[item.show] ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        ))}

        {passwordData.newPassword && passwordData.newPassword.length < 6 && (
          <p className="text-red-500 text-sm">
            Password must be at least 6 characters
          </p>
        )}

        {passwordData.confirmPassword && !passwordMatch && (
          <p className="text-red-500 text-sm">
            Passwords do not match
          </p>
        )}

        <button
          disabled={!isPasswordValid}
          className={`px-5 py-2 rounded-lg text-white
          ${isPasswordValid ? "bg-purple-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Update Password
        </button>
      </div>
    </>
  );
}
