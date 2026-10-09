import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/users/request-password-reset", {
        email: email.trim().toLowerCase(),
      });
      setRequestSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to request a reset link right now.",
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
          <Mail size={23} />
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
          Account recovery
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900">
          {requestSent ? "Check your email." : "Forgot your password?"}
        </h1>
        {requestSent ? (
          <div className="mt-4 space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              If an account exists for {email.trim()}, a password reset link will
              arrive shortly. The link expires in 5 minutes.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
            >
              Return to login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Enter your account email and we’ll send a one-time password reset
              link if an account matches.
            </p>
            <form className="mt-8 space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Email address
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                  <Mail size={18} className="text-emerald-700" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default ForgotPassword;
