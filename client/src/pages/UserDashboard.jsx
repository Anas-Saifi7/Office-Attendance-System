import { useCallback, useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Header from "../components/Header";
import {
  getLocation,
  fmtTime,
  fmtHours,
  mapLink,
  currentMonth,
} from "../utils";

export default function UserDashboard() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState({
    records: [],
    summary: {},
  });
  const [month, setMonth] = useState(currentMonth());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(async () => {
    const [t, h] = await Promise.all([
      api.get("/attendance/today"),
      api.get(`/attendance/my?month=${month}`),
    ]);

    setToday(t.data);
    setHistory(h.data);
  }, [month]);

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  }, [load]);

  const mark = async (kind) => {
    setBusy(true);
    setMsg({ type: "", text: "" });

    try {
      const loc = await getLocation();
      await api.post(`/attendance/${kind}`, loc);

      setMsg({
        type: "ok",
        text: kind === "check-in" ? "Checked in" : "Checked out",
      });

      await load();
    } catch (e) {
      setMsg({ type: "error", text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  const checkedIn = !!today?.checkIn?.time;
  const checkedOut = !!today?.checkOut?.time;
  const s = history.summary;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="My Attendance" />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Today's Attendance
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-600">Check-in</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {fmtTime(today?.checkIn?.time)}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-purple-600">Check-out</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {fmtTime(today?.checkOut?.time)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-600">Status</p>
              <p className="mt-1 text-lg font-semibold capitalize text-gray-900">
                {today ? today.status : "Not marked"}
              </p>
            </div>
          </div>

          {today?.checkIn?.address && (
            <p className="mt-4 text-sm text-gray-500">
              <span className="font-medium">Check-in location:</span>{" "}
              {today.checkIn.address}
            </p>
          )}

          {today?.checkOut?.address && (
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Check-out location:</span>{" "}
              {today.checkOut.address}
            </p>
          )}

          <div className="mt-6">
            {!checkedIn && (
              <button
                disabled={busy}
                onClick={() => mark("check-in")}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Getting location..." : "Check In"}
              </button>
            )}

            {checkedIn && !checkedOut && (
              <button
                disabled={busy}
                onClick={() => mark("check-out")}
                className="w-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Getting location..." : "Check Out"}
              </button>
            )}

            {checkedOut && (
              <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                Done for today. Worked {fmtHours(today.workingMinutes)}.
              </div>
            )}
          </div>

          {msg.text && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm ${
                msg.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {msg.text}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Attendance History
            </h2>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-green-600">On Time</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {s.present ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-orange-600">Late</p>
              <p className="mt-1 text-2xl font-bold text-orange-700">
                {s.late ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-sm text-indigo-600">Total Hours</p>
              <p className="mt-1 text-2xl font-bold text-indigo-700">
                {fmtHours(s.totalMinutes)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "In", "Out", "Hours", "Status", "Location"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {history.records.map((r) => (
                  <tr key={r._id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {fmtTime(r.checkIn?.time)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {fmtTime(r.checkOut?.time)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.checkOut ? fmtHours(r.workingMinutes) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          r.status === "present"
                            ? "bg-green-100 text-green-700"
                            : r.status === "late"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
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
                          {" · "}
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
                    </td>
                  </tr>
                ))}

                {!history.records.length && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No records this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
