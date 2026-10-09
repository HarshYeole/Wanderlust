import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const change = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8)
      return toast.error("Use at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match.");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/users/reset-password", {
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success(data.message || "Password updated successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update your password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-shell grid min-h-[calc(100vh-76px)] place-items-center py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-900/5 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft size={17} /> Back to login
        </Link>
        <span className="mt-8 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
          <KeyRound size={23} />
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
          Account recovery
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900">
          {token ? "Choose a new password." : "Reset link required."}
        </h1>
        {token ? (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Choose a new password for your account.
            </p>
            <form className="mt-8 space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  New password
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={change("password")}
                    className="w-full text-sm outline-none"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Confirm new password
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={change("confirmPassword")}
                    className="w-full text-sm outline-none"
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </span>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update password"}
                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-4 space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Password changes require the one-time link sent to your email.
              Request a new link if yours is missing or expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
            >
              Request a reset link <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResetPassword;
