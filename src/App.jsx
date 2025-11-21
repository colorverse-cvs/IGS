import RoutesMap from "./routes";
import Navbar from "./components/Navbar";
import FooterPage from "./pages/FooterPage";


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
