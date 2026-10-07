import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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
import {
  About,
  Contact,
  CookiePolicy,
  PrivacyPolicy,
  TermsOfService,
} from "./pages/SitePages";

const publicPageMetadata = {
  "/": {
    title: "Wanderlust | Go somewhere wonderful",
    description:
      "Explore travel destinations, save inspiring places, and plan thoughtful trips with Wanderlust.",
  },
  "/destinations": {
    title: "Explore destinations | Wanderlust",
    description:
      "Discover travel destinations, find places worth visiting, and save ideas for your next journey.",
  },
  "/about": {
    title: "About Wanderlust | Thoughtful travel planning",
    description:
      "Learn about Wanderlust, a travel inspiration and planning site for thoughtful trips.",
  },
  "/contact": {
    title: "Contact Wanderlust",
    description:
      "Contact Wanderlust with questions about the site, your account, or your personal information.",
  },
  "/privacy-policy": {
    title: "Privacy policy | Wanderlust",
    description:
      "Read how Wanderlust handles account, profile, trip, and gallery information.",
  },
  "/cookie-policy": {
    title: "Cookie policy | Wanderlust",
    description:
      "Learn how Wanderlust uses authentication cookies, browser storage, and third-party technologies.",
  },
  "/terms-of-service": {
    title: "Terms of service | Wanderlust",
    description:
      "Review the terms for using Wanderlust travel planning and community features.",
  },
};

const privatePaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/trips",
  "/profile",
  "/gallery",
  "/favorites",
  "/invitations",
];

function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata =
      publicPageMetadata[pathname] ||
      (pathname.startsWith("/destination/")
        ? {
            title: "Destination details | Wanderlust",
            description:
              "Explore destination details and travel ideas on Wanderlust.",
          }
        : {
            title: "Wanderlust | Thoughtful travel planning",
            description:
              "Explore destinations and plan thoughtful trips with Wanderlust.",
          });
    const isPrivate = privatePaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    document.title = metadata.title;
    description.content = metadata.description;
    canonical.href = `${window.location.origin}${pathname}`;
    robots.content = isPrivate ? "noindex, nofollow" : "index, follow";
  }, [pathname]);

  return null;
}

function AdSenseScript() {
  const publisherId = process.env.REACT_APP_ADSENSE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!publisherId) return;
    if (!/^ca-pub-\d{16}$/.test(publisherId)) {
      console.error(
        "Invalid REACT_APP_ADSENSE_CLIENT_ID. Expected a value such as ca-pub-1234567890123456.",
      );
      return;
    }

    const existingScript = document.querySelector(
      'script[data-wanderlust-adsense="true"]',
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.wanderlustAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    document.head.appendChild(script);

    return () => script.remove();
  }, [publisherId]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 flex flex-col">
      <PageMetadata />
      <AdSenseScript />
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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
