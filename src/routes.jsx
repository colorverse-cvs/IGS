import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import ProductCollections from "./pages/ProductCollections.jsx";
import Collections from "./pages/Collections.jsx";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderPlaced from "./pages/OrderPlaced";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import FilterPage from "./pages/FilterPage";
import ProductExtras from "./pages/ProductExtras";
// Lightweight placeholder pages for footer links (until real pages are provided)
const Placeholder = (title) => () => (
  <div className="px-4 md:px-15 lg:px-20 py-10">
    <div className="container mx-auto text-center text-gray-700">
      <h2 className="text-4xl font-semibold">{title}</h2>
      <p className="text-sm mt-2">Content coming soon.</p>
    </div>
  </div>
);

export default function RoutesMap() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/products" element={<ProductCollections />} /> */}
      <Route path="/collections" element={<Collections />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/product/:id/extras" element={<ProductExtras productId={":id"} />} />
      <Route path="/categories/:categorySlug" element={<CategoryPage />} />
      <Route path="/filter" element={<FilterPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-placed" element={<OrderPlaced />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      {/* placeholders for footer/company links */}
      <Route path="/about" element={Placeholder("About Us")} />
      <Route path="/corporate-gifting" element={Placeholder("Corporate Gifting")} />
      <Route path="/customization" element={Placeholder("Customization")} />
      <Route path="/blog" element={Placeholder("Blog")} />
      <Route path="/faq" element={Placeholder("FAQ")} />
      <Route path="/contact" element={Placeholder("Contact")} />
    </Routes>
  );
}
