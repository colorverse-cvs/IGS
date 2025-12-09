import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import store from "./store/store";
import { Toaster } from 'react-hot-toast';
import "./index.css";

/**
 * Application Entry Point
 * 
 * This file Tailwind the React application with:
 * - Redux store (for global state management)
 * - React Router (for navigation between pages)
 * - App component (the main application structure)
 * 
 * For beginners:
 * - createRoot() initializes React and renders the app into the #root element in index.html
 * - <Provider store={store}> makes Redux store available to all components
 * - <BrowserRouter> enables React Router navigation
 * - <React.StrictMode> helps identify potential issues in development
 */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" reverseOrder={false} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
