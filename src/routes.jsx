import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import Cart from "./pages/Cart";
import CheckoutPage from "./pages/CheckoutPage";
import OrderPlacedPage from "./pages/OrderPlacedPage";
import OrdersPage from "./pages/OrdersPage";
import Profile from "./pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import FilterPage from "./pages/FilterPage";
import ProductMoreInfoPage from "./pages/ProductMoreInfoPage";
import AdminPanelMain from "./admin/MainPanel";

/**
 * Routes Component - Application Routing Configuration
 *
 * This file defines all the routes (pages) in the application using React Router.
 * Each Route maps a URL path to a React component.
 *
 * For beginners:
 * - path="/" means the home page (localhost:3000/)
 * - path="/product/:id" means a dynamic route where :id is a parameter
 * - element={<ComponentName />} is the React component to render for that route
 * - Routes wraps all Route components and handles navigation
 */

/**
 * Placeholder component for pages that haven't been built yet
 * Used for footer links like About Us, Blog, FAQ, Contact
 *
 * @param {string} title - The page title to display
 */
const Placeholder = (title) => () =>
  (
    <div className="px-4 md:px-15 lg:px-20 py-10">
      <div className="container mx-auto text-center text-gray-700">
        <div className="text-4xl !font-medium">{title}</div>
        <p className="text-sm mt-2">Content coming soon.</p>
      </div>
    </div>
  );

/**
 * Main routing component - defines all application routes
 * Uses React Router's Routes and Route components
 */
export default function RoutesMap() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collections" element={<CollectionPage />} />
      <Route path="/product/:id" element={<ProductInfoPage />} />
      <Route
        path="/product/:id/extras"
        element={<ProductMoreInfoPage productId={":id"} />}
      />
      <Route path="/categories/:categorySlug" element={<CategoryPage />} />
      <Route path="/filter" element={<FilterPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-placed" element={<OrderPlacedPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<AboutPage />} />
      {/* <Route path="/customization" element={Placeholder("Customization")} /> */}
      <Route path="/faq" element={Placeholder("FAQ")} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/contact" element={Placeholder("Contact")} />
      <Route path="/admin" element={<AdminPanelMain />} />
    </Routes>
  );
}
