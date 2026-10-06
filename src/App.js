import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Destinations from "./pages/Destinations";
import DestinationDetails from "./pages/DestinationDetails";
import Trips from "./pages/Trips";
import TripItinerary from "./pages/TripItinerary";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import Favorites from "./pages/Favorites";
import Invitations from "./pages/Invitations";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id/itinerary" element={<TripItinerary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/invitations" element={<Invitations />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
