import { CalendarDays, Clock3, Mail, MapPin, Pencil, Plane, Plus, Route, Trash2, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Date not set";
const getDays = (trip) => trip.start_date && trip.end_date ? Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)) : null;
const getContent = (description) => { try { const parsed = JSON.parse(description); return parsed && typeof parsed === "object" ? parsed : { notes: description, itinerary: "" }; } catch { return { notes: description || "", itinerary: "" }; } };

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", start_date: "", end_date: "", budget: "", status: "planned" });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/trips/getAllTrips");
        const items = data.data || [];
        setTrips(items);
        const entries = await Promise.all(items.map(async (trip) => {
          try { const { data: result } = await api.get(`/trip-members/getTripMembers/${trip.id}`); return [trip.id, result.data || []]; } catch { return [trip.id, []]; }
        }));
        setMembers(Object.fromEntries(entries));
      } catch (error) { toast.error(error.response?.data?.message || "Unable to load trips"); } finally { setLoading(false); }
    };
    load();
  }, []);

  const edit = (trip) => { const content = getContent(trip.description); setEditing(trip); setForm({ title: trip.title || "", description: content.notes || "", start_date: trip.start_date?.slice(0, 10) || "", end_date: trip.end_date?.slice(0, 10) || "", budget: trip.budget || "", status: trip.status || "planned" }); };
  const field = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  const save = async (event) => { event.preventDefault(); setSaving(true); try { const { data } = await api.put(`/trips/updateTrip/${editing.id}`, form); setTrips((current) => current.map((trip) => trip.id === editing.id ? data.data : trip)); setEditing(null); toast.success("Trip updated successfully"); } catch (error) { toast.error(error.response?.data?.message || "Unable to update trip"); } finally { setSaving(false); } };
  const remove = async (trip) => { if (!window.confirm(`Delete ${trip.title}?`)) return; try { await api.delete(`/trips/deleteTrip/${trip.id}`); setTrips((current) => current.filter((item) => item.id !== trip.id)); toast.success("Trip deleted"); } catch (error) { toast.error(error.response?.data?.message || "Unable to delete trip"); } };
  const invite = async (event) => { event.preventDefault(); setSaving(true); try { const { data: user } = await api.get(`/users/find-by-email?email=${encodeURIComponent(email.trim().toLowerCase())}`); await api.post("/trip-invitations/sendInvitation", { trip_id: inviting.id, receiver_id: user.data.id }); setInviting(null); setEmail(""); toast.success("Invitation sent"); } catch (error) { toast.error(error.response?.data?.message || "Unable to send invitation"); } finally { setSaving(false); } };

  return <section className="page-shell py-12 sm:py-16">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Your travel journal</p><h1 className="mt-3 font-display text-5xl text-slate-900 sm:text-6xl">My trips</h1><p className="mt-4 text-slate-600">Your planned and completed journeys, all in one place.</p></div><Link to="/profile" className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-bold text-white"><Plus size={17} /> Plan a new trip</Link></div>
    <section className="mt-10"><div className="flex items-center gap-3"><Plane className="text-emerald-700" size={23} /><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Your saved plans</p><h2 className="mt-2 font-display text-4xl text-slate-900">Every trip you create</h2></div></div>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading your trips...</p> : trips.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">No trips planned yet.</div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{trips.map((trip) => { const content = getContent(trip.description); const tripMembers = members[trip.id] || []; return <article key={trip.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5"><div className="flex items-start justify-between"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-800">{trip.status || "planned"}</span><CalendarDays size={19} className="text-slate-400" /></div><h3 className="mt-5 font-display text-2xl text-slate-900">{trip.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{content.notes || "No notes added."}</p><div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><p className="flex items-center gap-2"><CalendarDays size={15} className="text-emerald-700" /> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>{getDays(trip) && <p className="flex items-center gap-2"><Clock3 size={15} className="text-emerald-700" /> {getDays(trip)} days</p>}{trip.budget && <p className="flex items-center gap-2"><MapPin size={15} className="text-emerald-700" /> Budget: {trip.budget}</p>}</div>{content.itinerary && <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Day-by-day plan</p>{content.itinerary.split("\n").filter(Boolean).map((item, index) => <p key={`${trip.id}-${index}`} className="mt-1 text-sm text-slate-700">{item}</p>)}</div>}<div className="mt-4 border-t border-slate-100 pt-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Users size={14} /> Trip members</p>{tripMembers.length === 0 ? <p className="mt-2 text-xs text-slate-500">No members have joined yet.</p> : tripMembers.map((member) => <p key={member.user_id} className="mt-1 text-sm text-slate-700">{member.full_name}</p>)}</div><div className="mt-5 flex flex-wrap gap-2"><Link to={`/trips/${trip.id}/itinerary`} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800"><Route size={14} /> Edit itinerary</Link><button type="button" onClick={() => edit(trip)} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><Pencil size={14} /> Edit trip</button><button type="button" onClick={() => setInviting(trip)} className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800"><UserPlus size={14} /> Add member</button><button type="button" onClick={() => remove(trip)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 size={14} /> Delete</button></div></article>; })}</div>}
    </section>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><form onSubmit={save} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><h2 className="font-display text-3xl">Edit trip</h2><button type="button" onClick={() => setEditing(null)}><X /></button></div><div className="mt-5 space-y-4"><input value={form.title} onChange={field("title")} className="w-full rounded-xl border p-3" placeholder="Trip title" required /><textarea value={form.description} onChange={field("description")} className="w-full rounded-xl border p-3" placeholder="Description" required /><input type="date" value={form.start_date} onChange={field("start_date")} className="w-full rounded-xl border p-3" /><input type="date" value={form.end_date} onChange={field("end_date")} className="w-full rounded-xl border p-3" /><input type="number" value={form.budget} onChange={field("budget")} className="w-full rounded-xl border p-3" placeholder="Budget" /><select value={form.status} onChange={field("status")} className="w-full rounded-xl border bg-white p-3"><option value="planned">Planned</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><button disabled={saving} className="mt-5 w-full rounded-full bg-emerald-800 p-3 font-bold text-white">{saving ? "Saving..." : "Save changes"}</button></form></div>}
    {inviting && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><form onSubmit={invite} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><h2 className="font-display text-3xl">Add member</h2><button type="button" onClick={() => setInviting(null)}><X /></button></div><p className="mt-3 text-sm text-slate-500">Invite someone to {inviting.title}.</p><label className="mt-5 flex items-center gap-2 rounded-xl border p-3"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full outline-none" placeholder="friend@example.com" required /></label><button disabled={saving} className="mt-5 w-full rounded-full bg-sky-700 p-3 font-bold text-white">{saving ? "Sending..." : "Send invitation"}</button></form></div>}
  </section>;
};

export default Trips;
