import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) return toast.error("Choose a password with at least 8 characters.");
    setIsSubmitting(true);
    try {
      const registration = new FormData();
      registration.append("fullName", form.fullName.trim());
      registration.append("email", form.email.trim().toLowerCase());
      registration.append("password", form.password);
      if (profileImage) registration.append("profileImage", profileImage);
      const { data } = await api.post("/users/register", registration);
      toast.success(data.message || "Your account is ready!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <section className="page-shell grid min-h-[calc(100vh-76px)] items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
    <div className="relative hidden min-h-[650px] overflow-hidden rounded-[2rem] lg:block"><img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1300&q=90" alt="A mountain lake waiting to be explored" /><div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent" /><div className="absolute bottom-10 left-10 right-10 text-white"><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[.16em] backdrop-blur"><Sparkles size={14} /> Make room for wonder</div><p className="mt-5 max-w-md font-display text-5xl leading-tight">A better way to keep your travel dreams close.</p><div className="mt-7 space-y-3">{["Save places that feel like you", "Shape simple, beautiful itineraries", "Share plans with your favourite people"].map((item) => <p key={item} className="flex items-center gap-2 text-sm text-white/85"><CheckCircle2 size={17} className="text-emerald-300" /> {item}</p>)}</div></div></div>
    <div className="mx-auto w-full max-w-md py-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Start somewhere wonderful</p><h1 className="mt-3 font-display text-5xl text-slate-900">Create Account</h1><p className="mt-4 text-base leading-7 text-slate-600">Create your Wanderlust account and bring your next journey into focus.</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Full name</span><span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><UserRound size={18} className="text-emerald-700" /><input type="text" value={form.fullName} onChange={change("fullName")} className="w-full bg-transparent text-sm outline-none" placeholder="Your name" autoComplete="name" required /></span></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Mail size={18} className="text-emerald-700" /><input type="email" value={form.email} onChange={change("email")} className="w-full bg-transparent text-sm outline-none" placeholder="you@example.com" autoComplete="email" required /></span></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Create a password</span><span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><LockKeyhole size={18} className="text-emerald-700" /><input type={showPassword ? "text" : "password"} value={form.password} onChange={change("password")} className="w-full bg-transparent text-sm outline-none" placeholder="At least 8 characters" autoComplete="new-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Profile image <span className="font-normal text-slate-400">(optional)</span></span><input type="file" accept="image/*" onChange={(event) => setProfileImage(event.target.files[0] || null)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-bold file:text-emerald-800" /></label>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 hover:bg-emerald-900 disabled:opacity-70">{isSubmitting ? "Creating account..." : <>Create my account <ArrowRight size={17} /></>}</button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-emerald-800 hover:text-emerald-950">Log in</Link></p>
    </div>
  </section>;
};

export default Register;
