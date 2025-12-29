import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  Home,
  Phone,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import CartDrawer from "./CartDrawer";
import SearchDrawer from "./SearchDrawer.jsx";
import AuthModal from "./AuthModal";
import Dropdown from "./Dropdown";
import IshitaGalleryLogo from "/assets/images/ishita-gallery-logo.jpg";
import categoriesData from "../data/categories.json";
import { logoutAsync, fetchUserProfileAsync } from "../features/user/userSlice";
import { initializeCart, clearCart } from "../features/cart/cartSlice";
import { useAdminPanel } from "../contexts/AdminPanelContext";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Global admin panel state from context
  const { isAdminPanelOpen, setIsAdminPanelOpen } = useAdminPanel();

  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileProductsDropdownOpen, setIsMobileProductsDropdownOpen] =
    useState(false);

  // Check if user is on home page for conditional rendering
  const isHomePage = location.pathname === "/";

  // Redux selectors: Get cart items and user data
  const totalItems = useSelector((s) => s.cart?.items?.length || 0);
  const user = useSelector((s) => s.user);

  // Toggle handlers for drawer and menu states
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Build product navigation links: "All Products" (filter page) + category anchors (home scrolling)
  const productLinks = useMemo(() => {
    const allProducts = [
      {
        name: "All Products",
        id: "all-products",
        path: "/filter",
        isSection: false,
      },
    ];
    const sections = categoriesData.sections.map((section) => ({
      name: section.title,
      id: section.id,
      path: `/#section-${section.id}`,
      isSection: true,
      sectionId: section.id,
    }));
    return [...allProducts, ...sections];
  }, []);

  // Handle product link click: navigate to home first if section link, then scroll
  const handleProductLinkClick = (pLink) => {
    setIsProductsDropdownOpen(false);
    setIsMobileProductsDropdownOpen(false);
    setIsMenuOpen(false);

    if (pLink.isSection) {
      // Navigate to home page with hash - HomePage useEffect will handle scrolling
      const hash = `#section-${pLink.sectionId}`;
      if (location.pathname !== "/") {
        // Navigate to home with hash
        navigate(`/${hash}`);
      } else {
        // Already on home page, update hash to trigger scroll
        window.location.hash = hash;
        // Also trigger scroll manually in case hash change doesn't trigger useEffect
        setTimeout(() => {
          const sectionId = `section-${pLink.sectionId}`;
          const el = document.getElementById(sectionId);
          if (el) {
            const nav = document.querySelector("nav");
            const offset = nav && nav.offsetHeight ? nav.offsetHeight : 80;
            const top =
              el.getBoundingClientRect().top + window.scrollY - offset - 12;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      // Regular navigation for "All Products"
      navigate(pLink.path);
    }
  };

  // Build profile navigation links for dropdowns
  const profileLinks = useMemo(() => {
    const links = [
      { to: "/profile", label: "Your Account", path: "/profile" },
      {
        to: "/orders",
        label: "Your Orders",
        path: "/orders",
      },
      { to: "/cart", label: "Wishlist", path: "/cart" },
      // { to: "/admin", label: "Admin Panel", path: "/admin" },
    ];

    // Only add Admin Panel link if user is admin
    if (user?.profile?.role === "admin") {
      links.push({ to: "/admin", label: "Admin Panel", path: "/admin" });
    }

    return links;
  }, [user]);

  // Build searchable product list for search functionality
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

  // Convert text to URL-friendly slug format
  const toSlug = (val) => (val || "").toLowerCase().replace(/\s+/g, "-");

  // Filter products based on search query (name, material, size, price, rating, category)
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

  // Main navigation menu items
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", isDropdown: true },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Auto-open login modal on first visit (after 5 seconds) if user is not authenticated
  useEffect(() => {
    if (!user.isAuthenticated) {
      const alreadyPrompted = sessionStorage.getItem("igs_auth_prompted");
      if (alreadyPrompted) return; // Don't show again if user already saw it
      const timer = setTimeout(() => {
        setIsAuthOpen(true);
        sessionStorage.setItem("igs_auth_prompted", "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user.isAuthenticated]);

  // Scroll page to top smoothly when navigating to a new route
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Add glass blur effect to navbar when user scrolls down the page
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount to set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open (lock background scrolling)
  useEffect(() => {
    if (isMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMenuOpen]);

  // Open search drawer
  const openSearch = () => setIsSearchOpen(true);

  // Close search drawer and clear search query
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Navigate to filter page with selected product filters (category, material, size)
  const handleSearchResultClick = (product) => {
    const params = new URLSearchParams();
    params.set("category", product.categoryId || toSlug(product.categoryName));
    if (product.material)
      params.set("material", (product.material || "").toLowerCase());
    if (product.size) params.set("size", product.size);
    closeSearch();
    navigate(`/filter?${params.toString()}`);
  };

  // const handleOpenAdminPanel = () => {
  //   setIsAdminPanelOpen((prev) => !prev);
  //   navigate("/admin");
  // };

  // Sync admin panel state with route
  useEffect(() => {
    setIsAdminPanelOpen(location.pathname === "/admin");
  }, [location.pathname, setIsAdminPanelOpen]);

  return (
    <>
      {/* DESKTOP NAVBAR - Visible only on large screens (lg+)
          Shows: Logo, navigation links, product dropdown, search, auth buttons, cart icon
          Features: Sticky positioning with glass blur effect on scroll */}
      <nav
        className={`hidden lg:block sticky top-0 z-30 border-b transition-colors ${
          isScrolled
            ? "backdrop-blur supports-[backdrop-filter]:bg-white/50 bg-white/50 border-gray-200 shadow-sm"
            : "bg-white border-gray-100"
        }`}
      >
        <div
          className={`mx-auto px-4 md:px-15 lg:px-20 max-w-7xl lg:max-w-full ${
            isAdminPanelOpen ? "hidden" : ""
          }`}
        >
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
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navLinks.map((link) =>
                link.isDropdown ? (
                  <div key={link.name} className="relative cursor-pointer">
                    <Dropdown
                      isOpen={isProductsDropdownOpen}
                      onToggle={setIsProductsDropdownOpen}
                      align="left"
                      trigger={(isOpen) => (
                        <button className="text-gray-700 hover:text-brand-700 hover:!font-medium lg:px-3 lg:py-3 text-sm font-medium transition flex items-center gap-1 cursor-pointer">
                          {link.name}
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </button>
                      )}
                    >
                      {productLinks.map((pLink) => (
                        <button
                          key={pLink.id}
                          type="button"
                          onClick={() => handleProductLinkClick(pLink)}
                          className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {pLink.name}
                        </button>
                      ))}
                    </Dropdown>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-700 hover:text-brand-700 lg:px-3 lg:py-3 text-sm font-medium transition hover:!font-medium"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-4">
              <button
                className="text-gray-500 hover:text-brand-700 transition cursor-pointer"
                aria-label="Search"
                onClick={openSearch}
              >
                <Search size={20} />
              </button>

              {/* Cart Icon - Only show when logged in */}
              {user.isAuthenticated && (
                <button
                  onClick={toggleCart}
                  className="p-2 transition relative cursor-pointer hover:text-brand-700"
                  aria-label={`Open shopping cart with ${totalItems} items`}
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-1.5 right-0 inline-flex items-center justify-center px-1.5 py-1.5 text-xs !font-medium leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-600 rounded-circle min-w-4 h-4 cursor-pointer">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>
              )}

              {user.isAuthenticated ? (
                <Dropdown
                  isOpen={isProfileDropdownOpen}
                  onToggle={setIsProfileDropdownOpen}
                  align="right"
                  trigger={(isOpen) => (
                    <button className="flex items-center gap-2 px-3 py-2 transition">
                      <span className="flex flex-col items-start text-gray-700 cursor-pointer hover:text-brand-700">
                        <span className="text-xs font-medium">Hey,</span>
                        <span className="flex items-center gap-1 !text-sm !font-medium">
                          {user.profile.name}
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </span>
                      </span>
                    </button>
                  )}
                >
                  {/* Profile dropdown links as buttons */}
                  {profileLinks.map((item, idx, arr) => (
                    <button
                      key={item.to}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        // Navigate with proper path and search params
                        if (item.search) {
                          navigate({
                            pathname: item.path,
                            search: item.search,
                          });
                        } else {
                          navigate(item.path || item.to);
                        }
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 cursor-pointer  hover:text-brand-700 ${
                        idx === 0 ? "first:rounded-t-lg" : ""
                      } ${idx === arr.length - 1 ? "last:rounded-b-lg" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  {/* Sign out button at the bottom */}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(logoutAsync());
                      dispatch(initializeCart(null));
                      navigate("/");
                      setIsProfileDropdownOpen(false);
                      toast("User Signed Out", {
                        icon: "👋",
                        style: {
                          color: "red",
                        },
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setIsAuthOpen(true);
                    }}
                    className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium hover:cursor-pointer"
                    aria-label="Log In"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthOpen(true);
                    }}
                    className="px-4 py-2 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition text-sm font-medium cursor-pointer"
                    aria-label="Sign Up"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
            {/* <button className="px-4 py-2 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition text-sm font-medium cursor-pointer"
              onClick={handleOpenAdminPanel}>ADMIN PANEL</button> */}
          </div>
        </div>
      </nav>
      {/* MOBILE NAVBAR - Fixed top navigation bar for small/medium screens (md and below)
          Shows: Logo on left, search and auth on right (on md+), responsive bottom search
          Features: Sticky positioning with blur effect on scroll */}
      <nav
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-gray-200 ${
          isScrolled
            ? "backdrop-blur supports-[backdrop-filter]:bg-white/50 bg-white/50 border-gray-200 shadow-sm"
            : "bg-white border-gray-100"
        }`}
      >
        <div
          className={`py-3 px-4 md:px-15 lg:px-20 ${
            isAdminPanelOpen ? "hidden" : ""
          }`}
        >
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

            {/* Search and Auth on right (Medium devices and up) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Icon (MD and up) */}
              <button
                className="text-gray-500 hover:text-brand-700 transition cursor-pointer"
                aria-label="Search"
                onClick={openSearch}
              >
                <Search size={20} />
              </button>

              {/* Auth Button/Icon */}
              {user.isAuthenticated ? (
                <Dropdown
                  isOpen={isProfileDropdownOpen}
                  onToggle={setIsProfileDropdownOpen}
                  align="right"
                  trigger={(isOpen) => (
                    <button className="flex items-center gap-2 px-3 py-2 transition">
                      <span className="flex flex-col items-start text-gray-700 cursor-pointer">
                        <span className="text-xs font-medium">Hey,</span>
                        <span className="cursor-pointer flex items-center gap-1 !text-sm !font-medium">
                          {user.profile.name}
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </span>
                      </span>
                    </button>
                  )}
                >
                  {profileLinks.map((item, idx, arr) => (
                    <button
                      key={item.to}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        // Navigate with proper path and search params
                        if (item.search) {
                          navigate({
                            pathname: item.path,
                            search: item.search,
                          });
                        } else {
                          navigate(item.path || item.to);
                        }
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 cursor-pointer hover:text-brand-700 ${
                        idx === 0 ? "first:rounded-t-lg" : ""
                      } ${idx === arr.length - 1 ? "last:rounded-b-lg" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      dispatch(logoutAsync());
                      // dispatch(clearCart()); // Commented out - preserve cart on logout
                      navigate("/");
                      setIsProfileDropdownOpen(false);
                      toast("User Signed Out", {
                        icon: "👋",
                        style: {
                          color: "red",
                        },
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setIsAuthOpen(true);
                    }}
                    className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
                    aria-label="Log In"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthOpen(true);
                    }}
                    className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-sm font-medium cursor-pointer"
                    aria-label="Sign Up"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Auth Button/Icon on Small devices (SM only, not MD) */}
            <div className="flex md:hidden items-center gap-2">
              {user.isAuthenticated ? (
                <Dropdown
                  isOpen={isProfileDropdownOpen}
                  onToggle={setIsProfileDropdownOpen}
                  align="right"
                  trigger={(isOpen) => (
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <User
                        size={20}
                        className="text-brand-700 hover:!font-medium"
                      />
                    </button>
                  )}
                >
                  {profileLinks.map((item, idx, arr) => (
                    <button
                      key={item.to}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        // Navigate with proper path and search params
                        if (item.search) {
                          navigate({
                            pathname: item.path,
                            search: item.search,
                          });
                        } else {
                          navigate(item.path || item.to);
                        }
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 cursor-pointer hover:text-brand-700 ${
                        idx === 0 ? "first:rounded-t-lg" : ""
                      } ${idx === arr.length - 1 ? "last:rounded-b-lg" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      dispatch(logoutAsync());
                      dispatch(initializeCart(null));
                      dispatch(clearCart());
                      navigate("/");
                      setIsProfileDropdownOpen(false);
                      toast("User Signed Out", {
                        icon: "👋",
                        style: {
                          color: "red",
                        },
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setIsAuthOpen(true);
                    }}
                    className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-medium cursor-pointer"
                    aria-label="Log In"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthOpen(true);
                    }}
                    className="px-3 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition text-xs font-medium cursor-pointer"
                    aria-label="Sign Up"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Only on Small devices and home page) */}
          {isHomePage && (
            <div className="mt-3 md:hidden">
              <button
                onClick={openSearch}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-600 flex items-center justify-between hover:bg-gray-200 transition cursor-pointer"
              >
                <span className="text-sm">Search for a product</span>
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </nav>
      {!isAdminPanelOpen && (
        <>
          <div
            className="md:hidden"
            style={{ height: isHomePage ? "114px" : "85px" }}
          />
          <div
            className="hidden md:block lg:hidden"
            style={{
              height: isAdminPanelOpen ? "unset" : isHomePage ? "80px" : "85px",
            }}
          />
        </>
      )}

      {/* MOBILE BOTTOM NAVBAR - Fixed navigation at bottom of screen (mobile only, lg:hidden)
          Shows: Home, Profile, Contact, Menu (4 main navigation options)
          Features: Active state highlighting, profile opens auth modal if not logged in */}
      {!isAdminPanelOpen && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="flex justify-around items-center h-16">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
                location.pathname === "/"
                  ? "text-brand-700 border-b-4 border-brand-700"
                  : "text-gray-600 hover:text-brand-700"
              }`}
              aria-label="Home"
            >
              <Home size={24} />
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>

            {/* Profile */}
            <button
              onClick={() => {
                if (user.isAuthenticated) {
                  navigate("/profile");
                } else {
                  setAuthTab("login");
                  setIsAuthOpen(true);
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full py-2 transition cursor-pointer ${
                location.pathname === "/profile"
                  ? "text-brand-700 border-b-4 border-brand-700"
                  : "text-gray-600 hover:text-brand-700"
              }`}
              aria-label="Profile"
            >
              <User size={24} />
              <span className="text-xs mt-1 font-medium">Profile</span>
            </button>

            {/* Contact */}
            <Link
              to="/contact"
              className={`flex flex-col items-center justify-center w-full h-full py-2 transition ${
                location.pathname === "/contact"
                  ? "text-brand-700 border-b-4 border-brand-700"
                  : "text-gray-600 hover:text-brand-700"
              }`}
              aria-label="Contact"
            >
              <Phone size={24} />
              <span className="text-xs mt-1 font-medium">Contact</span>
            </Link>

            {/* Cart */}

            {user.isAuthenticated && (
              <button
                onClick={toggleCart}
                className="flex flex-col items-center justify-center w-full h-full py-2 text-gray-600 hover:text-brand-700 transition relative cursor-pointer"
                aria-label={`Cart with ${totalItems} items`}
              >
                <div className="relative">
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs !font-medium text-white bg-brand-700 rounded-full min-w-5 h-5 ">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">Cart</span>
              </button>
            )}

            {/* Menu */}
            <button
              onClick={toggleMenu}
              className={`flex flex-col items-center justify-center w-full h-full py-2 transition cursor-pointer ${
                isMenuOpen
                  ? "text-brand-700 border-b-4 border-brand-700"
                  : "text-gray-600 hover:text-brand-700"
              }`}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <Menu size={24} />
              <span className="text-xs mt-1 font-medium">Menu</span>
            </button>
          </div>
        </nav>
      )}

      {/* MOBILE MENU DRAWER - Slide-out navigation panel (mobile only, triggered by Menu button)
          Features: Products dropdown with separate state (isMobileProductsDropdownOpen),
          Other navigation links, cart shortcut, sign up button for guests */}
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
      >
        <div className="flex justify-between items-center p-5">
          <div className="text-lg !font-medium text-gray-700">Menu</div>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-gray-500 hover:text-brand-700 hover:bg-brand-50 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto border-y-1 border-gray-200">
          {/* Products Section - Mobile View Only
              IMPORTANT: Uses separate state (isMobileProductsDropdownOpen) to avoid conflict
              with desktop dropdown state (isProductsDropdownOpen). Links scroll to home anchors
              (/#section-<id>) or redirect to /filter for "All Products" */}
          <div className="border-b border-gray-100 pb-3 mb-3">
            <button
              onClick={() =>
                setIsMobileProductsDropdownOpen(!isMobileProductsDropdownOpen)
              }
              className="w-full text-left text-sm !font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 px-3 py-2 rounded-lg transition flex justify-between items-center cursor-pointer"
            >
              Products{" "}
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  isMobileProductsDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {isMobileProductsDropdownOpen && (
              <div className="pl-6 pt-2 pb-2 space-y-2 bg-brand-25 rounded-lg mt-2">
                {productLinks.map((pLink) => (
                  <button
                    key={pLink.id}
                    type="button"
                    onClick={() => handleProductLinkClick(pLink)}
                    className="block w-full text-left text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 py-1 cursor-pointer"
                  >
                    {pLink.name}
                  </button>
                ))}
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
                className="block text-sm !font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 px-3 py-2 rounded-lg transition"
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
              className="flex items-center text-brand-700 !font-medium hover:text-brand-900 transition text-sm cursor-pointer"
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
              className="w-full text-center px-4 py-3 text-sm !font-medium text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition cursor-pointer"
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
