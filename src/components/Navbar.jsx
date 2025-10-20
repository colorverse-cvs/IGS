import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, ChevronDown, Star } from "lucide-react";
import CartDrawer from "./CartDrawer"; // Make sure this path is correct
import SearchDrawer from "./SearchDrawer.jsx";
import AuthModal from "./AuthModal";
import IshitaGalleryLogo from "../assets/ishita-gallery-logo.jpg";
import categoriesData from "../data/categories.json";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

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
    { name: "Products", isDropdown: true }, // Placeholder for dropdown logic
    { name: "Customization", path: "/customization" },
    { name: "Corporate Gifting", path: "/corporate-gifting" },
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
        (!Number.isNaN(qNum) && ((p.price || 0) === qNum || (p.rating || 0) === qNum))
      );
    });
  }, [searchQuery, allProducts]);

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

  return (
    <>
      <nav
        className={`sticky top-0 z-30 border-b transition-colors ${
          isScrolled
            ? "backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-gray-200 shadow-sm"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="mx-auto px-4 md:px-15 lg:px-20">
          <div className="flex justify-between items-center h-20">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                {/* Replace with your actual logo component or image path */}
                <img
                  src={IshitaGalleryLogo}
                  alt="Ishita Gallery"
                  className="h-15 w-auto"
                />
              </Link>
            </div>

            {/* --- Desktop Navigation Links --- */}
            <div className="hidden lg:flex lg:items-center">
              {navLinks.map((link) =>
                link.isDropdown ? (
                  // Products Dropdown Logic
                  <div key={link.name} className="relative">
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
                  // Standard Link
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

            {/* --- Desktop Actions (Search, Login, Signup, Cart) --- */}
            <div className="flex items-center gap-2">
              <button
                className="text-gray-500 hover:text-purple-700 transition hidden sm:block"
                aria-label="Search"
                onClick={openSearch}
              >
                <Search size={20} />
              </button>

              {/* Cart Icon with Item Count (Desktop) */}
              <button
                onClick={toggleCart}
                className="p-2 transition relative hidden sm:block"
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
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-purple-700">
                  Hey, {user.profile?.name || "User"}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setIsAuthOpen(true);
                    }}
                    className="text-gray-700 hover:text-purple-700 text-sm font-medium transition hidden sm:block"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthOpen(true);
                    }}
                    className="px-5 py-2 text-sm font-medium text-white bg-brand-700 rounded hover:bg-brand-800 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* --- Mobile Menu Button --- */}
              <div className="flex lg:hidden">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* --- MOBILE MENU DRAWER (Fancy Off-Canvas Panel) --- */}
        {/* ---------------------------------------------------- */}

        {/* Backdrop Overlay */}
        <div
          className={`
                        fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 lg:hidden
                        ${
                          isMenuOpen
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        }
                    `}
          onClick={toggleMenu}
          aria-hidden={!isMenuOpen}
        />

        {/* Menu Panel (Slides from the left) */}
        <div
          className={`
                        fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-30 
                        transition-transform duration-300 ease-in-out lg:hidden 
                        flex flex-col overflow-y-auto
                        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          {/* Header and Close Button */}
          <div className="flex justify-between items-center p-5 border-b border-brand-100">
            <Link to="/" onClick={toggleMenu} className="flex items-center">
              <img
                src="/images/ashita-gallery-logo.png"
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

          {/* Navigation Links (Scrollable area) */}
          <div className="flex-1 px-4 py-4 space-y-1">
            {/* Mobile Products Dropdown */}
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

            {/* Other Mobile Links */}
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

          {/* Footer Actions (Sticky at the bottom) */}
          <div className="p-4 border-t shadow-inner">
            {/* Cart Status and Login */}
            <div className="flex justify-between items-center mb-3">
              {user.isAuthenticated ? (
                <button
                  onClick={() => {
                    toggleMenu();
                    window.location.href = "/profile";
                  }}
                  className="text-gray-700 font-semibold hover:text-purple-700"
                >
                  Your Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    toggleMenu();
                    setAuthTab("login");
                    setIsAuthOpen(true);
                  }}
                  className="text-gray-700 font-semibold hover:text-purple-700"
                >
                  Log In
                </button>
              )}
              <button
                onClick={() => {
                  toggleMenu();
                  toggleCart();
                }}
                className="flex items-center text-purple-700 font-semibold hover:text-purple-900 transition"
              >
                Cart ({totalItems}) <ShoppingCart size={20} className="ml-2" />
              </button>
            </div>

            {/* Sign Up Button (Prominent CTA) */}
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

      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />

      {/* --- Cart Drawer Component (Always positioned outside the Navbar) --- */}
      <CartDrawer isOpen={isCartOpen} onClose={toggleCart} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  );
}
