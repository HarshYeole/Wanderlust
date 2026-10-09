import { lazy, Suspense, useEffect, useState } from "react";
import { matchPath, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Destinations = lazy(() => import("./pages/Destinations"));
const DestinationDetails = lazy(() => import("./pages/DestinationDetails"));
const Trips = lazy(() => import("./pages/Trips"));
const TripItinerary = lazy(() => import("./pages/TripItinerary"));
const Profile = lazy(() => import("./pages/Profile"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Invitations = lazy(() => import("./pages/Invitations"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const About = lazy(() =>
  import("./pages/SitePages").then((module) => ({ default: module.About })),
);
const Contact = lazy(() =>
  import("./pages/SitePages").then((module) => ({ default: module.Contact })),
);
const CookiePolicy = lazy(() =>
  import("./pages/SitePages").then((module) => ({ default: module.CookiePolicy })),
);
const PrivacyPolicy = lazy(() =>
  import("./pages/SitePages").then((module) => ({ default: module.PrivacyPolicy })),
);
const TermsOfService = lazy(() =>
  import("./pages/SitePages").then((module) => ({ default: module.TermsOfService })),
);

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

function PersistentPage({ path, renderPage }) {
  const { pathname } = useLocation();
  const activeMatch = matchPath({ path, end: true }, pathname);
  const activePath = activeMatch ? pathname : null;
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const [visitedPaths, setVisitedPaths] = useState(() =>
    isAuthenticated && activePath ? [activePath] : [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setVisitedPaths([]);
      return;
    }
    if (activePath) {
      setVisitedPaths((current) =>
        current.includes(activePath) ? current : [...current, activePath],
      );
    }
  }, [activePath, isAuthenticated]);

  if (!isAuthenticated) {
    return activeMatch ? <div>{renderPage(activeMatch.params)}</div> : null;
  }

  return visitedPaths.map((visitedPath) => {
    const isActive = pathname === visitedPath;
    const params = matchPath({ path, end: true }, visitedPath)?.params || {};
    return (
      <div
        key={visitedPath}
        hidden={!isActive}
        aria-hidden={!isActive}
      >
        {renderPage(params)}
      </div>
    );
  });
}

function App() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 flex flex-col">
      <PageMetadata />
      <Navbar />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="page-shell grid min-h-[50vh] place-items-center text-sm text-slate-500">
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destination/:id" element={<DestinationDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
          <PersistentPage path="/profile" renderPage={() => <Profile />} />
          <PersistentPage path="/gallery" renderPage={() => <Gallery />} />
          <PersistentPage path="/trips" renderPage={() => <Trips />} />
          <PersistentPage
            path="/trips/:id/itinerary"
            renderPage={({ id }) => <TripItinerary tripId={id} />}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
