import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api, { errMsg } from "../../api";
import { fmtTime, fmtHours, mapLink, currentMonth } from "../../utils";

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get("/attendance/my", { params: { month } })
      .then((r) => {
        const data = r.data;

        setRecords(
          Array.isArray(data)
            ? data
            : Array.isArray(data.records)
            ? data.records
            : Array.isArray(data.data)
            ? data.data
            : []
        );
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Attendance History" />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Attendance History
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View your monthly attendance records.
            </p>
          </div>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
          />
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading attendance records...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {records.map((r) => (
              <div
                key={r._id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{r.date}</p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "late"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Check In</p>
                    <p className="mt-1 font-medium text-green-700">
                      {fmtTime(r.checkIn?.time)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Check Out</p>
                    <p className="mt-1 font-medium text-orange-700">
                      {fmtTime(r.checkOut?.time)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Working Hours</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {r.checkOut ? fmtHours(r.workingMinutes) : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    {r.checkIn && (
                      <a
                        href={mapLink(r.checkIn)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block font-medium text-blue-600 hover:underline"
                      >
                        📍 View Map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Check In</th>
                    <th className="px-5 py-4">Check Out</th>
                    <th className="px-5 py-4">Working Hours</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Location</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {r.date}
                      </td>

                      <td className="px-5 py-4 text-green-700">
                        {fmtTime(r.checkIn?.time)}
                      </td>

                      <td className="px-5 py-4 text-orange-700">
                        {fmtTime(r.checkOut?.time)}
                      </td>

                      <td className="px-5 py-4">
                        {r.checkOut ? fmtHours(r.workingMinutes) : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            r.status === "late"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {r.checkIn && (
                          <a
                            href={mapLink(r.checkIn)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            📍 View Map
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!records.length && (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!loading && !records.length && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm md:hidden">
            No attendance records found.
          </div>
        )}
      </main>
    </div>
  );
}
