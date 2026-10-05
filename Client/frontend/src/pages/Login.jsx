import { ArrowRight, Compass, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) return toast.error("Enter your email and password to continue.");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/users/login", { email: email.trim().toLowerCase(), password });
      localStorage.setItem("accessToken", data.accessToken);
      toast.success(data.message || "Welcome back! Your journey is waiting.");
      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't log you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <section className="page-shell grid min-h-[calc(100vh-76px)] items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
    <div className="relative hidden min-h-[600px] overflow-hidden rounded-[2rem] lg:block">
      <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1300&q=90" alt="Travellers discovering a city" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/25 to-transparent" />
      <div className="absolute bottom-10 left-10 right-10 text-white"><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[.16em] backdrop-blur"><Sparkles size={14} /> Your next story</div><p className="mt-5 max-w-md font-display text-5xl leading-tight">The best journeys begin with a little wonder.</p><p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Pick up where you left off, save a new place, or start sketching your next escape.</p></div>
    </div>
    <div className="mx-auto w-full max-w-md py-6"><p className="mt-10 text-xs font-bold uppercase tracking-[.18em] text-emerald-700 lg:mt-0">Welcome back</p><h1 className="mt-3 font-display text-5xl text-slate-900">Good to see you.</h1><p className="mt-4 text-base leading-7 text-slate-600">Log in to keep building your next great escape.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Mail size={18} className="text-emerald-700" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="you@example.com" autoComplete="email" required /></span></label><label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold text-slate-700">Password</span></div><span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><LockKeyhole size={18} className="text-emerald-700" /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Enter your password" autoComplete="current-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><Link to="/forgot-password" className="block w-fit text-xs font-bold text-emerald-800 hover:text-emerald-950">Forgot password?</Link><button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Logging in..." : <>Log in <ArrowRight size={17} /></>}</button>
      </form><p className="mt-8 text-center text-sm text-slate-600">New to Wanderlust? <Link to="/register" className="font-bold text-emerald-800 hover:text-emerald-950">Create an account</Link></p></div>
  </section>;
};
export default Login;
