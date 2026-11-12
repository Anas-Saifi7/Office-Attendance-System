import { useState } from "react";
import api, { errMsg } from "../../api";
import Header from "../../components/Header";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const change = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await api.put("/auth/password", {
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMessage("Password changed successfully!");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Change Password" />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-xl space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Change Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update your account password securely.
            </p>
          </div>

          <form
            onSubmit={change}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Current Password
              </label>

              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className={inputClass}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className={inputClass}
                placeholder="Minimum 8 characters"
              />

              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters for your new password.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={inputClass}
                placeholder="Confirm your new password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">
              Security Tip
            </h3>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Never share your password with anyone. Use a unique password that
              you do not use on other websites.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
