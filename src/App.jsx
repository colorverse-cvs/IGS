import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";
import { AdminPanelProvider, useAdminPanel } from "./contexts/AdminPanelContext";
import { fetchProducts } from "./features/products/productSlice";

function AppContent() {
  const { isAdminPanelOpen } = useAdminPanel();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.products);

  // Fetch products once when app loads
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

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
