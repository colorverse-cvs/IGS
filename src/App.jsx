import React from "react";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";

/**
 * App Component - Main Application Root
 * 
 * This is the root component that wraps the entire application.
 * It includes:
 * - Navbar: Navigation bar at the top
 * - RoutesMap: Main content area with all routes/pages
 * - FooterPage: Footer at the bottom of every page
 * 
 * For beginners:
 * - Uses React Router for navigation between pages
 * - Redux store is provided at a higher level (in main.jsx)
 * - This component provides the overall layout structure
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <RoutesMap />
      </main>
      <FooterPage />
    </div>
  );
}
