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
import CategoryPage from "./pages/CategoryPage";
import FilterPage from "./pages/FilterPage";

export default function RoutesMap() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/products" element={<ProductCollections />} /> */}
      <Route path="/collections" element={<Collections />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/categories/:categorySlug" element={<CategoryPage />} />
      <Route path="/filter" element={<FilterPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-placed" element={<OrderPlaced />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/order-success" element={<OrderSuccess />} />
    </Routes>
  );
}
