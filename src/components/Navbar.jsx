import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  Star,
  User,
  Home,
  Phone,
} from "lucide-react";
import CartDrawer from "./CartDrawer"; // Make sure this path is correct
import SearchDrawer from "./SearchDrawer.jsx";
import AuthModal from "./AuthModal";
import IshitaGalleryLogo from "../assets/ishita-gallery-logo.jpg";
import categoriesData from "../data/categories.json";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isHomePage = location.pathname === "/";

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
    isScrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white"
  }`;

  // Redux: Get the total number of items in the cart
  const totalItems = useSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.qty, 0)
  );
  const user = useSelector((s) => s.user);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProductsDropdown = () =>
    setIsProductsDropdownOpen(!isProductsDropdownOpen);

  // Auto-open login after 5s on first load if not authenticated
  useEffect(() => {
    if (!user.isAuthenticated) {
      const alreadyPrompted = sessionStorage.getItem("igs_auth_prompted");
      if (alreadyPrompted) return;
      const t = setTimeout(() => {
        setIsAuthOpen(true);
        sessionStorage.setItem("igs_auth_prompted", "1");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [user.isAuthenticated]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", isDropdown: true },
    { name: "Customization", path: "/customization" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  const productLinks = [
    { name: "All Products", path: "/filter" },
    { name: "Chhatrapati Shivaji Maharaj Statues", scrollTo: "shivaji" },
    { name: "Mavale Statues", scrollTo: "mavale" },
    { name: "God Statues", scrollTo: "god-statues" },
    { name: "Home Decor", scrollTo: "home-decor" },
    { name: "Motivational Statues", scrollTo: "motivational" },
  ];

  const handleCategoryClick = (link) => {
    if (link.scrollTo) {
      // Scroll to section on home page
      const element = document.getElementById(`section-${link.scrollTo}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // If not on home page, navigate to home and then scroll
        window.location.href = `/#section-${link.scrollTo}`;
      }
    }
    toggleProductsDropdown();
  };

  // Build a searchable list of products from categories.json
  const allProducts = useMemo(() => {
    const arr = [];
    categoriesData.sections.forEach((section) =>
      section.products.forEach((p) =>
        arr.push({
          ...p,
          categoryId: section.id,
          categoryName: section.title,
        })
      )
    );
    return arr;
  }, []);

  const toSlug = (val) => (val || "").toLowerCase().replace(/\s+/g, "-");

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const qNum = Number(q);
    return allProducts.filter((p) => {
      const priceStr = String(p.price || "");
      const ratingStr = String(p.rating || "");
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.material || "").toLowerCase().includes(q) ||
        (p.size || "").toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q) ||
        priceStr.includes(q) ||
        ratingStr.includes(q) ||
        (!Number.isNaN(qNum) &&
          ((p.price || 0) === qNum || (p.rating || 0) === qNum))
      );
    });
  }, [searchQuery, allProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProductsDropdownOpen) {
        const dropdown = event.target.closest(".products-dropdown-container");
        if (!dropdown) {
          setIsProductsDropdownOpen(false);
        }
      }
    };

    if (isProductsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductsDropdownOpen]);

  // Sticky glass effect on scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMenuOpen]);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchResultClick = (p) => {
    const params = new URLSearchParams();
    params.set("category", p.categoryId || toSlug(p.categoryName));
    if (p.material) params.set("material", (p.material || "").toLowerCase());
    if (p.size) params.set("size", p.size);
    closeSearch();
    navigate(`/filter?${params.toString()}`);
  };

  const handleLogout = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("igs_user"));
      console.log("full data", data);

      const userId = data?.profile?.id;
      console.log("userId", userId);

      if (!userId) {
        console.error("User ID not found in profile");
        return;
      }

      const res = await fetch("http://localhost:3000/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const response = await res.json();
      console.log("LOGOUT SUCCESS:", response);

      // ✅ Clear correct storage key 
      localStorage.removeItem("igs_user");
      localStorage.removeItem("token"); // if exists

      // ✅ Redirect
      window.location.href = "/login";

    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }
  };

  return (
    <>
      {/* ========== DESKTOP NAVBAR (Hidden on mobile) ========== */}
      <nav
        className={`hidden lg:block sticky top-0 z-30 border-b transition-colors ${
          isScrolled
            ? "backdrop-blur supports-[backdrop-filter]:bg-white/50 bg-white/50 border-gray-200 shadow-sm"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="mx-auto px-4 md:px-15 lg:px-20 max-w-7xl lg:max-w-full">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src={IshitaGalleryLogo}
                  alt="Ishita Gallery"
                  className="h-10 md:h-12 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:items-center">
              {navLinks.map((link) =>
                link.isDropdown ? (
                  <div
                    key={link.name}
                    className="relative products-dropdown-container"
                  >
                    <button
                      onClick={toggleProductsDropdown}
                      className="text-gray-700 hover:text-purple-700 lg:px-3 lg:py-3 text-sm font-medium flex items-center transition"
                    >
                      Products{" "}
                      <ChevronDown
                        size={16}
                        className={`ml-1 transition-transform ${
                          isProductsDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {isProductsDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-purple-600 ring-opacity-5 z-40">
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="products-menu-button"
                        >
                          {productLinks.map((pLink) =>
                            pLink.path ? (
                              <Link
                                key={pLink.name}
                                to={pLink.path}
                                onClick={() => {
                                  toggleProductsDropdown();
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {pLink.name}
                              </Link>
                            ) : (
                              <button
                                key={pLink.name}
                                onClick={() => handleCategoryClick(pLink)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {pLink.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-700 hover:text-purple-700 lg:px-3 lg:py-3 text-sm font-medium transition"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-4">
              <button
                className="text-gray-500 hover:text-purple-700 transition"
                aria-label="Search"
                onClick={openSearch}
              >
                <Search size={20} />
              </button>

              <button
                onClick={toggleCart}
                className="p-2 transition relative"
                aria-label={`Open shopping cart with ${totalItems} items`}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-0 inline-flex items-center justify-center px-1.5 py-1.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-600 rounded-circle min-w-4 h-4">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {user.isAuthenticated ? (
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-50 transition"
                  aria-label="Profile"
                >
                  <User size={20} className="text-gray-700" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setIsAuthOpen(true);
                  }}
                  className="px-5 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                  aria-label="Sign In / Log In"
                >
                  Sign In/Log In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Menu Drawer */}
        <div
          className={`
            fixed inset-0 bg-black/50 z-20 transition-opacity duration-300
            ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
          onClick={toggleMenu}
          aria-hidden={!isMenuOpen}
        />

        <div
          className={`
            fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-999 
            transition-transform duration-300 ease-in-out
            flex flex-col overflow-y-auto
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          <div className="flex justify-between items-center p-5 border-b border-brand-100">
            <Link to="/" onClick={toggleMenu} className="flex items-center">
              <img
                src={IshitaGalleryLogo}
                alt="Ishita Gallery"
                className="h-10 w-auto"
              />
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-gray-500 hover:text-purple-700 hover:bg-brand-50 transition"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 px-4 py-4 space-y-1">
            <div className="border-b border-gray-100 pb-2 mb-2">
              <button
                onClick={toggleProductsDropdown}
                className="w-full text-left text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-purple-700 px-3 py-2 rounded-lg transition flex justify-between items-center"
              >
                Products{" "}
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    isProductsDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {isProductsDropdownOpen && (
                <div className="pl-6 pt-1 pb-1 space-y-1 bg-gray-50 rounded-b-lg">
                  {productLinks.map((pLink) =>
                    pLink.path ? (
                      <Link
                        key={pLink.name}
                        to={pLink.path}
                        onClick={() => {
                          toggleMenu();
                          toggleProductsDropdown();
                        }}
                        className="block text-base text-gray-600 hover:text-purple-700 py-1"
                      >
                        {pLink.name}
                      </Link>
                    ) : (
                      <button
                        key={pLink.name}
                        onClick={() => {
                          handleCategoryClick(pLink);
                          toggleMenu();
                        }}
                        className="block w-full text-left text-base text-gray-600 hover:text-purple-700 py-1"
                      >
                        {pLink.name}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {navLinks
              .filter((l) => !l.isDropdown)
              .map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={toggleMenu}
                  className="block text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-purple-700 px-3 py-2 rounded-lg transition"
                >
                  {link.name}
                </Link>
              ))}
          </div>

          <div className="p-4 border-t shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => {
                  toggleMenu();
                  toggleCart();
                }}
                className="flex items-center text-brand-700 font-semibold hover:text-purple-900 transition"
              >
                Cart ({totalItems}) <ShoppingCart size={20} className="ml-2" />
              </button>
            </div>

            {!user.isAuthenticated && (
              <button
                onClick={() => {
                  toggleMenu();
                  setAuthTab("signup");
                  setIsAuthOpen(true);
                }}
                className="w-full text-center inline-block px-4 py-3 text-sm font-bold text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition shadow-md"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ========== MOBILE NAVBAR (Top Bar) ========== */}
      <nav
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-gray-200 ${
          isScrolled
            ? "backdrop-blur supports-[backdrop-filter]:bg-white/50 bg-white/50 border-gray-200 shadow-sm"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="py-3 px-4 md:px-15 lg:px-20">
          {/* Top Navbar Row */}
          <div className="flex justify-between items-center h-14">
            {/* Logo on left */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src={IshitaGalleryLogo}
                alt="Ishita Gallery"
                className="h-9 w-auto"
              />
            </Link>
            <button onClick={handleLogout}>
              Log out
            </button>

            {/* Search and Auth on right (Medium devices and up) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Icon (MD and up) */}
              <button
                className="text-gray-500 hover:text-purple-700 transition"
                aria-label="Search"
                onClick={openSearch}
              >
                <Search size={20} />
              </button>

              {/* Auth Button/Icon */}
              {user.isAuthenticated ? (
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Profile"
                >
                  <User size={20} className="text-brand-700" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setIsAuthOpen(true);
                  }}
                  className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                  aria-label="Sign In / Log In"
                >
                  Sign In/Log In
                </button>
              )}
            </div>

            {/* Auth Button/Icon on Small devices (SM only, not MD) */}
            <div className="flex md:hidden items-center gap-2">
              {user.isAuthenticated ? (
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Profile"
                >
                  <User size={20} className="text-brand-700" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setIsAuthOpen(true);
                  }}
                  className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium"
                  aria-label="Sign In / Log In"
                >
                  Sign Up/Log In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar (Only on Small devices and home page) */}
          {isHomePage && (
            <div className="mt-3 md:hidden">
              <button
                onClick={openSearch}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-600 flex items-center justify-between hover:bg-gray-200 transition"
              >
                <span className="text-sm">Search for a product</span>
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <div
        className="md:hidden"
        style={{ height: isHomePage ? "114px" : "85px" }}
      />
      <div
        className="hidden md:block lg:hidden"
        style={{ height: isHomePage ? "80px" : "85px" }}
      />

      {/* ========== MOBILE BOTTOM NAVBAR ========== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
              location.pathname === "/"
                ? "text-brand-700 border-b-4 border-brand-700"
                : "text-gray-600 hover:text-purple-700"
            }`}
            aria-label="Home"
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
              location.pathname === "/profile"
                ? "text-brand-700 border-b-4 border-brand-700"
                : "text-gray-600 hover:text-purple-700"
            }`}
            aria-label="Profile"
          >
            <User size={24} />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
              location.pathname === "/contact"
                ? "text-brand-700 border-b-4 border-brand-700"
                : "text-gray-600 hover:text-purple-700"
            }`}
            aria-label="Contact"
          >
            <Phone size={24} />
            <span className="text-xs mt-1 font-medium">Contact</span>
          </Link>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="flex flex-col items-center justify-center w-full h-full py-2 text-gray-600 hover:text-purple-700 transition relative"
            aria-label={`Cart with ${totalItems} items`}
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-brand-700 rounded-full min-w-5 h-5">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Cart</span>
          </button>

          {/* Menu */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
              isMenuOpen
                ? "text-brand-700 border-b-4 border-brand-700"
                : "text-gray-600 hover:text-purple-700"
            }`}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <Menu size={24} />
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Updated for mobile) */}
      <div
        className={`
          lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300
          ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={toggleMenu}
        aria-hidden={!isMenuOpen}
      />

      <div
        className={`
          lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-999
          transition-transform duration-300 ease-in-out
          flex flex-col overflow-y-auto mb-20
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        // style={{ maxHeight: "calc(100vh - 64px)" }}
      >
        <div className="flex justify-between items-center p-5">
          <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-gray-500 hover:text-purple-700 hover:bg-brand-50 transition"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto border-y-2 border-brand-200">
          {/* Products Section */}
          <div className="border-b border-gray-100 pb-3 mb-3">
            <button
              onClick={toggleProductsDropdown}
              className="w-full text-left text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-purple-700 px-3 py-2 rounded-lg transition flex justify-between items-center"
            >
              Products{" "}
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  isProductsDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {isProductsDropdownOpen && (
              <div className="pl-6 pt-2 pb-2 space-y-2 bg-gray-50 rounded-lg mt-2">
                {productLinks.map((pLink) =>
                  pLink.path ? (
                    <Link
                      key={pLink.name}
                      to={pLink.path}
                      onClick={() => {
                        toggleMenu();
                        toggleProductsDropdown();
                      }}
                      className="block text-sm text-gray-600 hover:text-purple-700 py-1"
                    >
                      {pLink.name}
                    </Link>
                  ) : (
                    <button
                      key={pLink.name}
                      onClick={() => {
                        handleCategoryClick(pLink);
                        toggleMenu();
                      }}
                      className="block w-full text-left text-sm text-gray-600 hover:text-purple-700 py-1"
                    >
                      {pLink.name}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Other Navigation Links */}
          {navLinks
            .filter((l) => !l.isDropdown)
            .map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggleMenu}
                className="block text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-purple-700 px-3 py-2 rounded-lg transition"
              >
                {link.name}
              </Link>
            ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 shadow-inner mt-auto">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => {
                toggleMenu();
                toggleCart();
              }}
              className="flex items-center text-brand-700 font-semibold hover:text-purple-900 transition text-sm"
            >
              View Cart ({totalItems})
            </button>
          </div>

          {!user.isAuthenticated && (
            <button
              onClick={() => {
                toggleMenu();
                setAuthTab("signup");
                setIsAuthOpen(true);
              }}
              className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>

      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />
      <CartDrawer isOpen={isCartOpen} onClose={toggleCart} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  );
}
