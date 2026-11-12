import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import { fmtTime, fmtHours, mapLink } from "../../utils";

export default function Records() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [f, setF] = useState({
    userId: "",
    from: "",
    to: "",
    status: "",
  });
  const [error, setError] = useState("");

  const params = () =>
    Object.fromEntries(Object.entries(f).filter(([, v]) => v));

  const load = () =>
    api
      .get("/admin/attendance", { params: params() })
      .then((r) => setRecords(r.data))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    api.get("/admin/employees").then((r) => setEmployees(r.data));
    load();
  }, []);

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/attendance/export", {
        params: params(),
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");

      a.href = url;
      a.download = "attendance.csv";
      a.click();

      URL.revokeObjectURL(url);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const fixCheckout = async (r) => {
    const t = window.prompt(
      "Check-out time (YYYY-MM-DD HH:mm, IST)",
      `${r.date} 18:00`,
    );

    if (!t) return;

    const iso = new Date(t.replace(" ", "T") + ":00+05:30");

    if (isNaN(iso.getTime())) {
      alert("Invalid date/time");
      return;
    }

    try {
      await api.put(`/admin/attendance/${r._id}`, {
        checkOutTime: iso.toISOString(),
        note: "Check-out added by admin",
      });

      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="space-y-5">

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={f.userId}
            onChange={(e) => setF({ ...f, userId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All employees</option>
            {employees.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={f.from}
            onChange={(e) => setF({ ...f, from: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            type="date"
            value={f.to}
            onChange={(e) => setF({ ...f, to: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Any status</option>
            <option value="present">On time</option>
            <option value="late">Late</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Apply
            </button>

            <button
              onClick={exportCsv}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Export
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Attendance Records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Total records: {records.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Locations</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r._id} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-700">
                    {r.date}
                  </td>

                  <td className="px-5 py-4 font-medium text-gray-800">
                    {r.user?.name}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-green-700">
                    {fmtTime(r.checkIn?.time)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-orange-700">
                    {fmtTime(r.checkOut?.time)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                    {r.checkOut ? fmtHours(r.workingMinutes) : "-"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.status === "late"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <a
                        href={mapLink(r.checkIn)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        In
                      </a>

                      {r.checkOut && (
                        <>
                          <span className="text-gray-300">·</span>
                          <a
                            href={mapLink(r.checkOut)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Out
                          </a>
                        </>
                      )}

                      {r.checkIn?.distanceFromOffice != null && (
                        <span className="text-xs text-gray-500">
                          ({r.checkIn.distanceFromOffice} m)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {!r.checkOut?.time && (
                      <button
                        onClick={() => fixCheckout(r)}
                        className="whitespace-nowrap rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Add Check-out
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {!records.length && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
