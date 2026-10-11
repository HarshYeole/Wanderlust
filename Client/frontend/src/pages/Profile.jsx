import {
  CalendarDays,
  BookOpen,
  Check,
  Compass,
  Heart,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const getImage = (images) => {
  if (Array.isArray(images)) return images[0];
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : images;
    } catch {
      return images;
    }
  }
  return "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85";
};

const isCompleted = (trip) => {
  const status = String(trip.status || "").toLowerCase();
  return (
    ["completed", "complete", "done", "finished"].includes(status) ||
    (trip.end_date && new Date(trip.end_date) < new Date())
  );
};

const getTripDescription = (description) => {
  if (!description) return "";
  if (typeof description === "object") {
    return description.notes || description.itinerary || "";
  }

  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") {
      return parsed.notes || parsed.itinerary || "";
    }
  } catch {
    // Older trips store their description as plain text.
  }

  return description;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sharedPosts, setSharedPosts] = useState(0);
  const [socialStats, setSocialStats] = useState({
    pending_invites: 0,
  });
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    bio: "",
    city: "",
    country: "",
  });
  const [isPlanning, setIsPlanning] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [tripForm, setTripForm] = useState({
    destination: "",
    days: "",
    start_date: "",
    end_date: "",
    budget: "",
    description: "",
    itinerary: "",
  });

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const responses = await Promise.all([
          api.get("/users/me"),
          api
            .get("/profile/getProfile")
            .catch(() => ({ data: { data: null } })),
          api.get("/trips/getAllTrips").catch(() => ({ data: { data: [] } })),
          api
            .get("/favorites/getAllFavorites")
            .catch(() => ({ data: { data: [] } })),
          api
            .get("/trip-invitations/social-stats")
            .catch(() => ({ data: { data: {} } })),
          api
            .get("/trip-invitations/my-invitations")
            .catch(() => ({ data: { data: [] } })),
          api.get("/gallery").catch(() => ({ data: { data: [] } })),
        ]);
        setUser(responses[0].data.data);
        setProfile(responses[1].data.data);
        setCompletedTrips((responses[2].data.data || []).filter(isCompleted));
        setFavorites(responses[3].data.data || []);
        setSharedPosts(
          (responses[6].data.data || []).filter((entry) => entry.is_public).length,
        );
        setSocialStats((currentStats) => ({
          ...currentStats,
          ...(responses[4].data.data || {}),
        }));
        setInvitations(responses[5].data.data || []);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, []);

  useEffect(() => {
    const search = tripForm.destination.trim();
    setPlaceSuggestions([]);
    setPlaceSearchError("");
    if (search.length < 2 || selectedDestination?.label === search) {
      setIsSearchingPlaces(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const params = new URLSearchParams({
          name: search,
          count: "20",
          language: "en",
          format: "json",
        });
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Location search failed");
        const result = await response.json();
        const suggestions = (result.results || [])
          .map((place) => {
            const region = [place.admin1, place.admin2]
              .filter((value, index, values) => value && values.indexOf(value) === index)
              .join(", ");
            return {
              id: place.id,
              name: place.name,
              country: place.country || "",
              label: [place.name, region, place.country].filter(Boolean).join(", "),
            };
          })
          .filter((place) => place.name.toLowerCase().startsWith(search.toLowerCase()))
          .slice(0, 8);
        setPlaceSuggestions(suggestions);
      } catch (error) {
        if (error.name !== "AbortError") {
          setPlaceSearchError("Place suggestions are unavailable right now. You can still enter any destination.");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearchingPlaces(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [tripForm.destination, selectedDestination]);

  const openEditor = () => {
    setForm({
      fullName: user?.full_name || "",
      email: user?.email || "",
      bio: profile?.bio || "",
      city: profile?.city || "",
      country: profile?.country || "",
    });
    setProfileImage(null);
    setIsEditing(true);
  };

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });
  const respondToInvitation = async (invitationId, action) => {
    try {
      await api.put(`/trip-invitations/${action}Invitation/${invitationId}`);
      setInvitations((currentInvitations) =>
        currentInvitations.filter(
          (invitation) => invitation.id !== invitationId,
        ),
      );
      setSocialStats((currentStats) => ({
        ...currentStats,
        pending_invites: Math.max(
          0,
          Number(currentStats.pending_invites || 0) - 1,
        ),
      }));
      toast.success(
        action === "accept" ? "Invitation accepted" : "Invitation declined",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to respond to invitation",
      );
    }
  };
  const updateTripField = (field) => (event) =>
    setTripForm({ ...tripForm, [field]: event.target.value });
  const updateDestinationSearch = (event) => {
    const value = event.target.value;
    setSelectedDestination(null);
    setTripForm((current) => ({ ...current, destination: value }));
  };

  const updateTripDates = (field, value) => {
    const nextTrip = { ...tripForm, [field]: value };
    if (nextTrip.start_date && nextTrip.end_date) {
      const days = Math.max(
        1,
        Math.ceil(
          (new Date(nextTrip.end_date) - new Date(nextTrip.start_date)) /
            86400000,
        ),
      );
      nextTrip.days = days;
    }
    setTripForm(nextTrip);
  };

  const createTrip = async (event) => {
    event.preventDefault();
    const destinationTitle = selectedDestination?.label === tripForm.destination
      ? selectedDestination.label
      : tripForm.destination.trim();
    if (!destinationTitle) return toast.error("Enter a destination first.");
    if (!tripForm.start_date || !tripForm.end_date)
      return toast.error("Choose your travel dates.");
    setIsCreatingTrip(true);
    try {
      const { data } = await api.post("/trips/createTrip", {
        title: destinationTitle,
        description: JSON.stringify({
          notes: tripForm.description.trim(),
          itinerary: tripForm.itinerary.trim(),
        }),
        start_date: tripForm.start_date,
        end_date: tripForm.end_date,
        budget: tripForm.budget || null,
        status: "planned",
      });
      if (isCompleted(data.data))
        setCompletedTrips((currentTrips) => [data.data, ...currentTrips]);
      setIsPlanning(false);
      setTripForm({
        destination: "",
        days: "",
        start_date: "",
        end_date: "",
        budget: "",
        description: "",
        itinerary: "",
      });
      setSelectedDestination(null);
      setPlaceSuggestions([]);
      toast.success("Trip planned successfully");
      navigate(`/trips/${data.data.id}/itinerary`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create your trip",
      );
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const [{ data: userResponse }, { data: profileResponse }] =
        await Promise.all([
          api.put("/users/me", { fullName: form.fullName, email: form.email }),
          profile
            ? api.put(
                "/profile/updateProfile",
                (() => {
                  const profileForm = new FormData();
                  Object.entries(form).forEach(([key, value]) =>
                    profileForm.append(key, value),
                  );
                  if (profileImage)
                    profileForm.append("profileImage", profileImage);
                  return profileForm;
                })(),
              )
            : api.post(
                "/profile/createProfile",
                (() => {
                  const profileForm = new FormData();
                  Object.entries(form).forEach(([key, value]) =>
                    profileForm.append(key, value),
                  );
                  if (profileImage)
                    profileForm.append("profileImage", profileImage);
                  return profileForm;
                })(),
              ),
        ]);
      setUser(userResponse.data);
      setProfile(profileResponse.data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update your profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.full_name || "Your profile";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location =
    [profile?.city, profile?.country].filter(Boolean).join(", ") ||
    "Location not added";

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="rounded-2xl border border-emerald-200 bg-[#dcebe1] p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-emerald-800 text-2xl font-bold text-white shadow-sm sm:h-24 sm:w-24">
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">
              My account
            </p>
            <h1 className="mt-2 break-words font-display text-4xl text-slate-900 sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={16} className="shrink-0 text-emerald-700" />
              <span className="break-words">{location}</span>
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={openEditor}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-emerald-800/20 bg-white px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 sm:flex-none"
            >
              <Pencil size={16} /> Edit profile
            </button>
            <button
              type="button"
              onClick={() => setIsPlanning(true)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900 sm:flex-none"
            >
              <Plus size={18} /> Plan a trip
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <Plane className="text-emerald-700" size={21} />
          <p className="mt-4 font-display text-3xl text-slate-900">
            {completedTrips.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Completed trips</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <Heart className="text-rose-600" size={21} />
          <p className="mt-4 font-display text-3xl text-slate-900">
            {favorites.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Favorite destinations</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <Users className="text-amber-700" size={21} />
          <p className="mt-4 font-display text-3xl text-slate-900">
            {socialStats.pending_invites || 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">Friend invites</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <BookOpen className="text-sky-700" size={21} />
          <p className="mt-4 font-display text-3xl text-slate-900">
            {sharedPosts}
          </p>
          <p className="mt-1 text-sm text-slate-500">Public travel posts</p>
        </article>
      </div>

      <section className="mt-8 flex flex-col justify-between gap-6 rounded-2xl border border-emerald-200 bg-[#e2eee5] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">
            Traveler inspiration
          </p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">
            The next trip starts with someone else's notes.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Find practical advice from people who've been there, or share what you learned on your own travels.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/destinations" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900">
            <Compass size={16} /> Explore trip advice
          </Link>
          <Link to="/gallery" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-800/20 bg-white px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50">
            <BookOpen size={16} /> Share an experience
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">
            Incoming requests
          </p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">
            Trip invitations
          </h2>
        </div>
        {invitations.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">
            No pending trip invitations.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {invitations.map((invitation) => (
              <article
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-amber-50 p-4"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {invitation.sender_name} invited you to {invitation.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {invitation.start_date
                      ? new Date(invitation.start_date).toLocaleDateString()
                      : "Date to be decided"}{" "}
                    -{" "}
                    {invitation.end_date
                      ? new Date(invitation.end_date).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respondToInvitation(invitation.id, "accept")}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respondToInvitation(invitation.id, "reject")}
                    className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
          Your history
        </p>
        <h2 className="mt-2 font-display text-4xl text-slate-900">
          Completed trips
        </h2>
        {isLoading ? (
          <p className="mt-6 text-sm text-slate-500">Loading your trips...</p>
        ) : completedTrips.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            You have not completed any trips yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedTrips.map((trip) => (
              <article
                key={trip.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-800">
                    Completed
                  </span>
                  <CalendarDays size={18} className="text-slate-400" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-slate-900">
                  {trip.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {getTripDescription(trip.description)}
                </p>
                {trip.end_date && (
                  <p className="mt-4 text-xs font-medium text-slate-500">
                    Finished {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-rose-600">
          Saved for later
        </p>
        <h2 className="mt-2 font-display text-4xl text-slate-900">
          Favorite destinations
        </h2>
        {isLoading ? (
          <p className="mt-6 text-sm text-slate-500">
            Loading your favorites...
          </p>
        ) : favorites.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            You have not saved any favorite destinations yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <article
                key={favorite.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5"
              >
                <img
                  src={getImage(favorite.images)}
                  alt={favorite.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl text-slate-900">
                      {favorite.name}
                    </h3>
                    <Heart
                      size={18}
                      className="shrink-0 fill-rose-500 text-rose-500"
                    />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />{" "}
                    {[favorite.city, favorite.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {favorite.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {isPlanning && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4">
          <form
            onSubmit={createTrip}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                  New journey
                </p>
                <h2 className="mt-2 font-display text-3xl text-slate-900">
                  Plan a trip
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanning(false)}
                aria-label="Close trip planner"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Destination
                </span>
                <input
                  type="search"
                  value={tripForm.destination}
                  onChange={updateDestinationSearch}
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={placeSuggestions.length > 0}
                  aria-controls="destination-suggestions"
                  placeholder="Search any city, region, or country"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  required
                />
                {isSearchingPlaces && <p className="mt-2 text-xs text-slate-500">Searching worldwide locations...</p>}
                {placeSearchError && <p role="status" className="mt-2 text-xs text-amber-700">{placeSearchError}</p>}
                {placeSuggestions.length > 0 && (
                  <ul id="destination-suggestions" role="listbox" className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {placeSuggestions.map((place) => (
                      <li key={place.id} role="option" aria-selected={selectedDestination?.id === place.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDestination(place);
                            setTripForm((current) => ({ ...current, destination: place.label }));
                            setPlaceSuggestions([]);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50"
                        >
                          {place.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-slate-500">Powered by Open-Meteo Geocoding and GeoNames. You can also use a place not listed in suggestions.</p>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Start date
                  </span>
                  <input
                    type="date"
                    value={tripForm.start_date}
                    onChange={(event) =>
                      updateTripDates("start_date", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    End date
                  </span>
                  <input
                    type="date"
                    min={tripForm.start_date}
                    value={tripForm.end_date}
                    onChange={(event) =>
                      updateTripDates("end_date", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    required
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Number of days
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={tripForm.days}
                    onChange={updateTripField("days")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    placeholder="Calculated from dates"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Budget
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={tripForm.budget}
                    onChange={updateTripField("budget")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    placeholder="Optional amount"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Notes
                </span>
                <textarea
                  value={tripForm.description}
                  onChange={updateTripField("description")}
                  className="min-h-24 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  placeholder="What do you want to do there?"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isCreatingTrip}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"
            >
              <Save size={17} />{" "}
              {isCreatingTrip ? "Creating trip..." : "Create trip"}
            </button>
          </form>
        </div>
      )}
      {isEditing && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4">
          <form
            onSubmit={saveProfile}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                  Account settings
                </p>
                <h2 className="mt-2 font-display text-3xl text-slate-900">
                  Edit profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                aria-label="Close edit profile"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Profile image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setProfileImage(event.target.files[0] || null)
                  }
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-bold file:text-emerald-800"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Name
                </span>
                <input
                  value={form.fullName}
                  onChange={updateField("fullName")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Bio
                </span>
                <textarea
                  value={form.bio}
                  onChange={updateField("bio")}
                  className="min-h-24 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    City
                  </span>
                  <input
                    value={form.city}
                    onChange={updateField("city")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Country
                  </span>
                  <input
                    value={form.country}
                    onChange={updateField("country")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"
            >
              <Save size={17} /> {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default Profile;
