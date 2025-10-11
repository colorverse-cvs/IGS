import React from "react";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container py-6 mx-auto">
          <RoutesMap />
        </div>
      </div>
    </div>
  );
}
