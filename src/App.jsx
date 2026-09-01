import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";
import ScrollingAnnouncement from "./components/ScrollingAnnouncement";
import { AdminPanelProvider, useAdminPanel } from "./contexts/AdminPanelContext";
import { fetchProducts } from "./features/products/productSlice";
import { initializeCart, fetchCartSummaryAsync } from "./features/cart/cartSlice";
import { updateTokens, logout } from "./features/user/userSlice";
import { fetchBannerTexts } from "./utils/marketingApi";

function AppContent() {
  const { isAdminPanelOpen } = useAdminPanel();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.products);
  const user = useSelector((state) => state.user);

  // Fetch products once when app loads
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Initialize cart based on user auth state on load/change
  useEffect(() => {
    if (user.isAuthenticated && user.profile?.id) {
      dispatch(initializeCart(user.profile.id));
      dispatch(fetchCartSummaryAsync());
    } else {
      // Ensure guest cart is active if not authenticated (defaults to null in slice, but explicit here is safe)
      // dispatch(initializeCart(null)); // Optional, slice defaults to null
    }
  }, [user.isAuthenticated, user.profile?.id, dispatch]);

  // Listen for token refresh events from apiClient.js
  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { token, refreshToken } = event.detail;
      console.log('[App] Token refreshed, updating Redux store');
      dispatch(updateTokens({ token, refreshToken }));
    };

    const handleTokenRefreshFailed = () => {
      console.log('[App] Token refresh failed, logging out');
      dispatch(logout());
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
    };
  }, [dispatch]);

  // Fetch active strip texts from the backend on mount
  const [activeStripTexts, setActiveStripTexts] = useState([]);
  useEffect(() => {
    fetchBannerTexts()
      .then((arr) => setActiveStripTexts(arr))
      .catch(() => setActiveStripTexts([]));

    // Keep in sync when admin adds/removes texts in the same browser session
    const handleTextsUpdated = (e) => setActiveStripTexts(e.detail?.texts ?? []);
    window.addEventListener('bannerTextsUpdated', handleTextsUpdated);
    return () => window.removeEventListener('bannerTextsUpdated', handleTextsUpdated);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Strip announcement bar — shown below navbar when admin has active strips */}
      {!isAdminPanelOpen && activeStripTexts.length > 0 && (
        <ScrollingAnnouncement
          messages={activeStripTexts}
          rows={1}
        />
      )}
      <main>
        <RoutesMap />
      </main>
      {!isAdminPanelOpen && <FooterPage />}
    </div>
  );
}

export default function App() {
  return (
    <AdminPanelProvider>
      <AppContent />
    </AdminPanelProvider>
  );
}
