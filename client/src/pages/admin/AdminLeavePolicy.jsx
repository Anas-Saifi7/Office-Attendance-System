import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const initialTypes = [
  { name: "Casual Leave", code: "Casual", yearlyLimit: 12, isPaid: true },
  { name: "Sick Leave", code: "Sick", yearlyLimit: 12, isPaid: true },
  { name: "Earned Leave", code: "Earned", yearlyLimit: 15, isPaid: true },
  { name: "Unpaid Leave", code: "Unpaid", yearlyLimit: 0, isPaid: false },
  { name: "Maternity Leave", code: "Maternity", yearlyLimit: 180, isPaid: true },
  { name: "Paternity Leave", code: "Paternity", yearlyLimit: 15, isPaid: true },
  { name: "Marriage Leave", code: "Marriage", yearlyLimit: 5, isPaid: true },
  { name: "Bereavement Leave", code: "Bereavement", yearlyLimit: 3, isPaid: true },
  { name: "Compensatory Off", code: "Compensatory", yearlyLimit: 0, isPaid: true },
  { name: "Work From Home", code: "WorkFromHome", yearlyLimit: 20, isPaid: true },
  { name: "Half Day Leave", code: "HalfDay", yearlyLimit: 0, isPaid: true },
];

export default function AdminLeavePolicy() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [types, setTypes] = useState(initialTypes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadPolicy = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/leave-policy?year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setTypes(data.leaveTypes || initialTypes);
    } catch (error) {
      setMessage(error.message || "Failed to load policy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, [year]);

  const updateType = (index, field, value) => {
    setTypes((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addType = () => {
    setTypes((prev) => [
      ...prev,
      {
        name: "New Leave",
        code: `Custom${Date.now()}`,
        yearlyLimit: 0,
        isPaid: true,
      },
    ]);
  };

  const removeType = (index) => {
    setTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const savePolicy = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API}/leave-policy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year,
          leaveTypes: types,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Leave policy saved successfully!");
    } catch (error) {
      setMessage(error.message || "Failed to save policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Leave Policy
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure yearly employee leave limits
            </p>
          </div>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {message && (
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-187.5 text-left">
              <thead className="bg-slate-100 text-sm text-slate-600">
                <tr>
                  <th className="p-4">Leave Type</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Yearly Limit</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {types.map((type, index) => (
                  <tr key={type.code} className="border-t border-slate-100">
                    <td className="p-3">
                      <input
                        value={type.name}
                        onChange={(e) =>
                          updateType(index, "name", e.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        value={type.code}
                        disabled
                        className="w-32 rounded-lg border bg-slate-50 px-3 py-2"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={type.yearlyLimit}
                        onChange={(e) =>
                          updateType(
                            index,
                            "yearlyLimit",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 rounded-lg border px-3 py-2"
                      />
                      <span className="ml-2 text-sm text-slate-500">days</span>
                    </td>

                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={type.isPaid}
                        onChange={(e) =>
                          updateType(index, "isPaid", e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => removeType(index)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:justify-between">
            <button
              onClick={addType}
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium hover:bg-slate-50"
            >
              + Add Leave Type
            </button>

            <button
              onClick={savePolicy}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Leave Policy"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
