import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Eye, EyeOff } from "lucide-react";
import { fetchUserProfileAsync, updateProfileAsync, forgotPasswordAsync, resetPasswordAsync } from "../../../features/user/userSlice";
import Modal from "../../../components/Modal";
import { CheckCircle } from "lucide-react";
import { BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";

export default function Settings() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { profile } = useSelector((state) => state.user);
  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Populate data on mount and when profile updates
  useEffect(() => {
    dispatch(fetchUserProfileAsync());
  }, [dispatch]);

  useEffect(() => {
    console.log(profile);
    if (profile) {
      // Find default address or use the first one
      const defaultAddr = profile.addresses?.find(a => a.isDefault) || profile.addresses?.[0];
      let formattedAddress = "";
      if (defaultAddr) {
        formattedAddress = [
          defaultAddr.line1,
          defaultAddr.line2,
          defaultAddr.line3,
          defaultAddr.city,
          defaultAddr.state,
          defaultAddr.pincode
        ].filter(Boolean).join(", ");
      }

      setFormData({
        shopName: profile.name || "",
        contact: profile.mobile || "",
        email: profile.email || "",
        address: formattedAddress
      });
    }
  }, [profile]);

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

  const handleSaveShopSettings = async () => {
    setIsSaving(true);
    try {
      // updateProfileAsync expects { name, mobile }
      const resultAction = await dispatch(updateProfileAsync({
        name: formData.shopName,
        mobile: formData.contact
      }));

      if (updateProfileAsync.fulfilled.match(resultAction)) {
        setSuccessMessage("Shop settings have been updated successfully.");
        setShowSuccessModal(true);
      } else {
        toast.error(resultAction.payload || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!isPasswordValid) return;
    setIsSaving(true);
    try {
      // Step 1: Request reset token
      const forgotAction = await dispatch(forgotPasswordAsync(profile.email));

      if (forgotPasswordAsync.fulfilled.match(forgotAction)) {
        const resetToken = forgotAction.payload;

        // Step 2: Use token to reset password
        const resetAction = await dispatch(resetPasswordAsync({
          token: resetToken,
          newPassword: passwordData.newPassword
        }));

        if (resetPasswordAsync.fulfilled.match(resetAction)) {
          setSuccessMessage("Password has been updated successfully.");
          setShowSuccessModal(true);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
        } else {
          toast.error(resetAction.payload || "Failed to reset password");
        }
      } else {
        toast.error(forgotAction.payload || "Failed to start password reset");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const phoneValid = formData.contact.length === 10;

  const isShopFormValid =
    formData.shopName &&
    phoneValid &&
    emailValid &&
    formData.address;

  const passwordMatch =
    passwordData.newPassword === passwordData.confirmPassword;

  const isPasswordValid =
    passwordData.currentPassword &&
    passwordData.newPassword.length >= 6 &&
    passwordMatch;

  return (
    <div className="space-y-6 md:space-y-8">

      {/* SHOP SETTINGS */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-5">
        <p className="text-lg font-semibold">Shop Information</p>

        {/* SHOP NAME */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {!formData.shopName && (
            <p className="text-red-500 text-xs mt-1">Shop name is required</p>
          )}
        </div>

        {/* CONTACT & EMAIL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
            <input
              type="text"
              name="contact"
              maxLength={10}
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {!phoneValid && formData.contact && (
              <p className="text-red-500 text-xs mt-1">Enter valid 10 digit number</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <p className="text-gray-400 text-[10px] mt-1 italic">Email cannot be changed directly</p>
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
          <textarea
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />
          {!formData.address && (
            <p className="text-red-500 text-xs mt-1">Address is required</p>
          )}
        </div>

        {/* LOGO */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Shop Logo</label>
          <div className="flex justify-start mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={openFileDialog}
              className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-xl cursor-pointer hover:border-purple-400 transition"
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover rounded-xl" alt="Shop logo" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Upload</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={openFileDialog}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Upload Logo
          </button>
        </div>

        <button
          onClick={handleSaveShopSettings}
          disabled={!isShopFormValid || isSaving}
          className={`w-full md:w-auto px-5 py-2 rounded-lg text-white font-medium transition-all
          ${isShopFormValid && !isSaving ? "bg-purple-700 hover:bg-purple-800" : "bg-gray-400 cursor-not-allowed"}`}
        >
          {isSaving ? "Saving..." : "Save Shop Settings"}
        </button>
      </div>

      {/* PASSWORD SETTINGS */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-5">
        <p className="text-lg font-semibold">Change Admin Password</p>

        {[
          { key: "currentPassword", label: "Current Password", show: "current" },
          { key: "newPassword", label: "New Password", show: "new" },
          { key: "confirmPassword", label: "Confirm Password", show: "confirm" }
        ].map((item) => (
          <div key={item.key} className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">{item.label}</label>
            <input
              type={showPassword[item.show] ? "text" : "password"}
              name={item.key}
              value={passwordData[item.key]}
              onChange={handlePasswordChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <span
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  [item.show]: !showPassword[item.show]
                })
              }
              className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPassword[item.show] ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        ))}

        <button
          onClick={handleUpdatePassword}
          disabled={!isPasswordValid || isSaving}
          className={`w-full md:w-auto px-5 py-2 rounded-lg text-white font-medium transition-all
          ${isPasswordValid && !isSaving ? "bg-purple-700 hover:bg-purple-800" : "bg-gray-400 cursor-not-allowed"}`}
        >
          {isSaving ? "Updating..." : "Update Password"}
        </button>
      </div>

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        showHeader={false}
        className="max-w-md w-full"
      >
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">{successMessage}</p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition"
          >
            Great, thanks!
          </button>
        </div>
      </Modal>
    </div>
  );
}
