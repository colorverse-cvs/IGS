import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";
import { AdminPanelProvider, useAdminPanel } from "./contexts/AdminPanelContext";
import { fetchProducts } from "./features/products/productSlice";
import { initializeCart, fetchCartSummaryAsync } from "./features/cart/cartSlice";
import { updateTokens, logout } from "./features/user/userSlice";

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

  // clear console every 10 seconds

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.clear();
  //   }, 10000); // 10 seconds

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
