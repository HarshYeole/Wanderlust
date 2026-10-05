import { Compass, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

const navItems = [{ label: "Discover", to: "/destinations" }, { label: "My trips", to: "/trips", requiresAuth: true }, { label: "My Gallery", to: "/gallery", requiresAuth: true }];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || isAuthenticated);
  const logout = () => {
    api.post("/users/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    setOpen(false);
    navigate("/login", { replace: true });
  };
  
  const linkClass = ({ isActive }) => `text-sm font-medium transition ${isActive ? "text-emerald-800" : "text-slate-600 hover:text-emerald-800"}`;

  return <header className="sticky top-0 z-50 border-b border-emerald-950/5 bg-[#f8faf9]/90 backdrop-blur-xl">
    <nav className="page-shell flex h-[76px] items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900" onClick={() => setOpen(false)}><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-800 text-white"><Compass size={19} strokeWidth={2.3} /></span>wanderlust</Link>
      <div className="hidden items-center gap-8 md:flex">{visibleNavItems.filter((item) => item.label !== "Discover").reverse().map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}{isAuthenticated && <Link to="/profile" className="text-sm font-medium text-slate-600 transition hover:text-emerald-800">Profile</Link>}</div>
      <div className="hidden items-center gap-4 md:flex"><NavLink to="/destinations" className={linkClass}>Discover</NavLink>{isAuthenticated ? <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-900"><LogOut size={16} /> Log out</button> : <><Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-emerald-800">Log in</Link><Link to="/register" className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900">Start planning</Link></>}</div>
      <button className="rounded-full p-2 text-slate-700 md:hidden" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </nav>
    {open && <div className="border-t border-slate-200 bg-[#f8faf9] px-5 py-5 md:hidden"><div className="flex flex-col gap-4">{visibleNavItems.map((item) => <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>{item.label}</NavLink>)}{isAuthenticated ? <><Link to="/profile" className="text-sm font-semibold text-slate-500" onClick={() => setOpen(false)}>Profile</Link><button type="button" onClick={logout} className="inline-flex items-center gap-2 text-left text-sm font-semibold text-slate-700"><LogOut size={16} /> Log out</button></> : <><Link to="/login" className="text-sm font-semibold text-slate-900" onClick={() => setOpen(false)}>Log in</Link><Link to="/register" className="rounded-full bg-emerald-800 px-5 py-3 text-center text-sm font-semibold text-white" onClick={() => setOpen(false)}>Start planning</Link></>}</div></div>}
  </header>;
};
export default Navbar;
