import React from "react";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="">
        <div className="">
          <RoutesMap />
        </div>
      </div>
      <Footer />
    </div>
  );
}
