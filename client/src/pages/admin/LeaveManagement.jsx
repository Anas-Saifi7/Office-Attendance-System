import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaves/admin/all");
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

  const review = async (id, nextStatus) => {
    const remark = remarks[id] || "";

    if (nextStatus === "Rejected" && !remark.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    try {
      await api.put(`/leaves/admin/${id}/status`, {
        status: nextStatus,
        adminRemark: remark,
      });

      setRemarks((prev) => ({ ...prev, [id]: "" }));
      setError("");
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const filtered = leaves.filter((leave) =>
    status === "All" ? true : leave.status === status
  );

  const dateFormat = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Leave Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review employee leave requests.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Pending", "Approved", "Rejected", "Cancelled", "All"].map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              status === item
                ? "bg-blue-600 text-white"
                : "border bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading requests...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No leave requests found.
          </p>
        ) : (
          <div className="divide-y">
            {filtered.map((leave) => (
              <div key={leave._id} className="space-y-4 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {leave.employee?.name || "Employee"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {leave.employee?.email || "-"}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {leave.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-slate-500">Leave Type</p>
                    <p className="mt-1 font-medium">{leave.leaveType}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Dates</p>
                    <p className="mt-1 font-medium">
                      {dateFormat(leave.startDate)} – {dateFormat(leave.endDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Total Days</p>
                    <p className="mt-1 font-medium">{leave.days}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Reason</p>
                  <p className="mt-1 wrap-break-word text-sm text-slate-700">
                    {leave.reason}
                  </p>
                </div>

                {leave.status === "Pending" && (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={remarks[leave._id] || ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [leave._id]: e.target.value,
                        }))
                      }
                      placeholder="Admin remark (required for rejection)"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => review(leave._id, "Approved")}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Approve Leave
                      </button>

                      <button
                        onClick={() => review(leave._id, "Rejected")}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Reject Leave
                      </button>
                    </div>
                  </div>
                )}

                {leave.adminRemark && (
                  <p className="text-sm text-slate-500">
                    Admin remark: {leave.adminRemark}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
