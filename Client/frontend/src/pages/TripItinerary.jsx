import { ArrowLeft, CalendarDays, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const readContent = (description) => {
  try {
    const parsed = JSON.parse(description);
    return parsed && typeof parsed === "object" ? parsed : { notes: description, itinerary: "" };
  } catch {
    return { notes: description || "", itinerary: "" };
  }
};

const TripItinerary = ({ tripId: id }) => {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState({ notes: "", itinerary: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const { data } = await api.get(`/trips/getTrip/${id}`);
        const content = readContent(data.data.description);
        setTrip(data.data);
        setForm(content);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load this trip");
        navigate("/trips");
      } finally {
        setIsLoading(false);
      }
    };
    loadTrip();
  }, [id, navigate]);

  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const saveItinerary = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put(`/trips/updateTrip/${id}`, {
        title: trip.title,
        description: JSON.stringify({ notes: form.notes.trim(), itinerary: form.itinerary.trim() }),
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget: trip.budget,
        status: trip.status,
      });
      setTrip(data.data);
      toast.success("Itinerary saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save itinerary");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <section className="page-shell py-16 text-sm text-slate-500">Loading your itinerary...</section>;
  if (!trip) return null;

  return <section className="page-shell py-12 sm:py-16">
    <Link to="/trips" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"><ArrowLeft size={17} /> Back to My Trips</Link>
    <div className="mt-7 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Trip itinerary</p><h1 className="mt-3 font-display text-5xl text-slate-900">{trip.title}</h1><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} /> {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : "Date not set"} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : "Date not set"}</p></div>
    <form onSubmit={saveItinerary} className="mt-10 max-w-3xl space-y-6"><section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8"><h2 className="font-display text-3xl text-slate-900">What are you doing there?</h2><p className="mt-2 text-sm text-slate-500">Add the places and activities you want to experience.</p><label className="mt-6 block"><span className="mb-2 block text-sm font-bold text-slate-700">Day-by-day plan</span><textarea value={form.itinerary} onChange={updateField("itinerary")} className="min-h-64 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder={'Day 1: Beach\nDay 2: Scuba diving\nDay 3: Local market'} /></label><label className="mt-6 block"><span className="mb-2 block text-sm font-bold text-slate-700">Trip notes</span><textarea value={form.notes} onChange={updateField("notes")} className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Add hotel details, transport, reservations, or other notes" /></label></section><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"><Save size={17} /> {isSaving ? "Saving..." : "Save itinerary"}</button></form>
  </section>;
};

export default TripItinerary;
