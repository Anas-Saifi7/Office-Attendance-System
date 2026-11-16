import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const u = await login(email, password);
      nav(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-linear-to-br from-white via-[#f2f8ff] to-[#dcecff]">
      <div className="pointer-events-none absolute -right-48 -top-64 h-213 w-6xl rounded-full bg-blue-100/80" />

      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-37.5 w-full"
        viewBox="0 0 1600 260"
        preserveAspectRatio="none"
      >
        <path
          fill="#bfdbfe"
          d="M0 130 C350 220 700 140 1050 130 S1450 70 1600 110 V260 H0Z"
        />
        <path
          fill="#60a5fa"
          d="M0 190 C350 250 700 180 1100 170 S1450 120 1600 150 V260 H0Z"
        />
        <path
          fill="#2563eb"
          d="M0 225 C450 280 900 220 1250 210 S1500 180 1600 190 V260 H0Z"
        />
        <path
          fill="#1555ed"
          d="M0 250 C450 290 1000 250 1350 235 S1500 220 1600 225 V260 H0Z"
        />
      </svg>

      <main className="relative z-10 mx-auto grid h-full max-w-[1600px] items-center gap-8 px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 xl:px-24">

        <section className="relative hidden h-full lg:flex lg:flex-col lg:justify-center">

          <h1 className="relative z-10 text-[56px] font-extrabold leading-[1.05] tracking-tight text-slate-900 xl:text-[64px]">
            Office <span className="text-blue-600">Attendance</span>
            <br />
            Portal
          </h1>

          <p className="relative z-10 mt-6 text-xl leading-relaxed text-slate-700">
            Attendance, Leave and Team Management
            <br />
            in one place.
          </p>

          <div className="relative z-10 mt-8 flex max-w-155 items-center">
            {[
              ["📅", "Mark", "Attendance"],
              ["👥", "Manage", "Leaves"],
              ["📊", "Admin", "Control"],
            ].map(([icon, title, subtitle], i) => (
              <div key={title} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                    {icon}
                  </div>

                  <p className="mt-3 font-bold leading-tight text-slate-900">
                    {title}
                    <br />
                    {subtitle}
                  </p>
                </div>

                {i !== 2 && (
                  <div className="h-20 w-px bg-slate-300" />
                )}
              </div>
            ))}
          </div>

          <img
            src="/images/office-building.png"
            alt="Office Building"
            className="pointer-events-none absolute bottom-2 left-0 w-[55%] max-w-105 object-contain"
          />
        </section>

        <section className="relative z-20 flex h-full items-center justify-center lg:justify-end">

          <form
            onSubmit={submit}
            className="w-full max-w-138 rounded-[30px] border border-white/80 bg-white/95 px-8 py-8 shadow-[0_25px_80px_rgba(37,99,235,0.16)] sm:px-10 sm:py-9"
          >

            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-blue-600 text-3xl font-bold text-white shadow-lg shadow-blue-600/25">
                A
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Office Attendance
              </h2>

              <p className="mt-2 text-base text-slate-500">
                Welcome back! Please sign in to your account.
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-slate-800"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-[#eaf1ff] px-5 py-3.5 text-base outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

        
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-[#eaf1ff] px-5 py-3.5 pr-20 text-base outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

        
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-700 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in  →"}
            </button>

            <div className="mt-7 border-t border-slate-200 pt-5 text-center">
              <p className="text-sm text-slate-500">
                🛡 Secure Employee & Admin Portal
              </p>
            </div>

          </form>
        </section>
      </main>
    </div>
  );
}
