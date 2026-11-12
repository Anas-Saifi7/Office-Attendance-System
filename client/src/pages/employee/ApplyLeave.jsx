import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import Header from "../../components/Header";

export default function ApplyLeave() {
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLeavePolicy = async () => {
      try {
        setPolicyLoading(true);

        const res = await api.get("/leave-policy");

        const activeTypes = (res.data.leaveTypes || []).filter(
          (type) => type.isActive !== false
        );

        setLeaveTypes(activeTypes);

        if (activeTypes.length > 0) {
          setForm((prev) => ({
            ...prev,
            leaveType: activeTypes[0].code,
          }));
        }
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setPolicyLoading(false);
      }
    };

    loadLeavePolicy();
  }, []);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/leaves/apply", form);

      setMessage(res.data.message || "Leave applied successfully!");

      setForm({
        leaveType: leaveTypes[0]?.code || "",
        startDate: "",
        endDate: "",
        reason: "",
      });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Apply Leave" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Apply for Leave
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submit your leave request for admin approval.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >

            <div>
              <label className="mb-2 block text-sm font-medium">
                Leave Type
              </label>

              <select
                name="leaveType"
                value={form.leaveType}
                onChange={update}
                required
                disabled={policyLoading || leaveTypes.length === 0}
                className={inputClass}
              >
                {policyLoading ? (
                  <option value="">Loading leave types...</option>
                ) : leaveTypes.length === 0 ? (
                  <option value="">No leave types available</option>
                ) : (
                  leaveTypes.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.name}
                      {type.isPaid ? " (Paid)" : " (Unpaid)"}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                  value={form.startDate}
                  onChange={update}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  min={
                    form.startDate ||
                    new Date().toLocaleDateString("en-CA")
                  }
                  required
                  value={form.endDate}
                  onChange={update}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Reason
              </label>

              <textarea
                name="reason"
                rows={4}
                maxLength={500}
                required
                value={form.reason}
                onChange={update}
                placeholder="Explain why you need leave..."
                className={inputClass}
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.reason.length}/500
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              disabled={loading || policyLoading || leaveTypes.length === 0}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
