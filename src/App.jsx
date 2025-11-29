import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";
import { AdminPanelProvider, useAdminPanel } from "./contexts/AdminPanelContext";

function AppContent() {
  const { isAdminPanelOpen } = useAdminPanel();

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
