import { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "./utils/userInfo";
import { logoutAsync } from "../features/user/userSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchProducts } from "../features/products/productSlice";

export default function Topbar({ setActivePage }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { name, initials } = getUserInfo();
  const dispatch = useDispatch();

  const handleDropdownClick = () => {
    setIsPopupVisible((prev) => !prev);
  };

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPopupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMyAccountClick = () => {
    setActivePage("Settings");
    setIsPopupVisible(false);
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate("/");
    setIsPopupVisible(false);
    toast("User Signed Out", {
      icon: "👋",
      style: {
        color: "red",
      },
    });
  };

  const handleGoToHome = () => {
    // Refresh products before navigating to home
    dispatch(fetchProducts());
    navigate("/");
    setIsPopupVisible(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex justify-end px-8 relative">
      <div
        className="flex items-center gap-4 cursor-pointer select-none"
        onClick={handleDropdownClick}
      >
        <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center !font-bold">
          {initials}
        </div>

        <span className="text-gray-600 font-medium">{name}</span>
        {isPopupVisible ? <MdExpandLess /> : <MdExpandMore />}
      </div>

      {isPopupVisible && (
        <div
          ref={dropdownRef}
          className="absolute top-16 right-8 w-40 rounded-md shadow-lg bg-white ring-1 ring-brand-600 ring-opacity-5 p-1 space-y-1 z-50"
        >
          <button
            onClick={() => handleMyAccountClick()}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            My Account
          </button>

          <button
            onClick={handleGoToHome}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            Go To Home
          </button>

          <button
            onClick={() => handleLogout()}
            className="block w-full text-left px-3 py-2 rounded text-red-600 hover:bg-gray-50 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
