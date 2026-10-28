import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Plans from "./pages/Plans";
import Subscribers from "./pages/Subscribers";
import Orders from "./pages/Orders";
import ProvisioningPage from "./pages/Provisioning";
import AddALine from "./pages/AddALine";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/provisioning" element={<ProvisioningPage />} />
          <Route path="/add-a-line" element={<AddALine />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
