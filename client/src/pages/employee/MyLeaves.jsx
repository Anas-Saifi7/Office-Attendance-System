import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import Header from "../../components/Header";

const statusStyle = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

const dateFormat = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "-";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaves/my");
      setLeaves(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;

    try {
      await api.put(`/leaves/${id}/cancel`);
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const pending = leaves.filter((l) => l.status === "Pending").length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="My Leaves" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Leave Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your leave applications and approval status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Summary title="Pending" value={pending} color="amber" />
          <Summary title="Approved" value={approved} color="green" />
          <Summary title="Rejected" value={rejected} color="red" />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4 sm:p-5">
            <h2 className="font-semibold text-slate-800">Leave History</h2>
            <button
              onClick={load}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No leave requests found.
            </p>
          ) : (
            <>
    
              <div className="space-y-4 p-4 md:hidden">
                {leaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="space-y-3 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        {leave.leaveType} Leave
                      </span>
                      <Status status={leave.status} />
                    </div>

                    <div className="text-sm text-slate-600">
                      <p>
                        {dateFormat(leave.startDate)} – {dateFormat(leave.endDate)}
                      </p>
                      <p className="mt-1">Days: {leave.days}</p>
                      <p className="mt-2 wrap-break-word">
                        Reason: {leave.reason}
                      </p>
                    </div>

                    {leave.adminRemark && (
                      <div className="rounded-lg bg-slate-50 p-3 text-sm">
                        <p className="font-medium text-slate-700">
                          Admin Remark
                        </p>
                        <p className="mt-1 text-slate-600">
                          {leave.adminRemark}
                        </p>
                      </div>
                    )}

                    {leave.status === "Pending" && (
                      <button
                        onClick={() => cancel(leave._id)}
                        className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Dates</th>
                      <th className="px-5 py-3">Days</th>
                      <th className="px-5 py-3">Reason</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Admin Remark</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium">
                          {leave.leaveType}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {dateFormat(leave.startDate)} – {dateFormat(leave.endDate)}
                        </td>
                        <td className="px-5 py-4">{leave.days}</td>
                        <td className="max-w-xs wrap-break-word px-5 py-4">
                          {leave.reason}
                        </td>
                        <td className="px-5 py-4">
                          <Status status={leave.status} />
                        </td>
                        <td className="max-w-xs wrap-break-word px-5 py-4">
                          {leave.adminRemark || "-"}
                        </td>
                        <td className="px-5 py-4">
                          {leave.status === "Pending" ? (
                            <button
                              onClick={() => cancel(leave._id)}
                              className="font-medium text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Status({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyle[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function Summary({ title, value, color }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-sm font-medium">{title} Requests</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
