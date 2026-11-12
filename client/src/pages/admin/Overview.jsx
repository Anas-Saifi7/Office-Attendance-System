import { useEffect, useState } from "react";
import api from "../../api";
import { fmtTime, mapLink } from "../../utils";

export default function Overview() {
  const [d, setD] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);
  const [error, setError] = useState("");

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  useEffect(() => {
    Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/attendance", {
        params: { from: today, to: today },
      }),
    ])
      .then(([dashboard, attendance]) => {
        setD(dashboard.data);

        const records = attendance.data;
        setTodayRecords(
          Array.isArray(records)
            ? records
            : Array.isArray(records.records)
              ? records.records
              : [],
        );
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard"),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!d) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  const stats = [
    {
      title: "Employees",
      value: d.totalEmployees,
      icon: "👥",
    },
    {
      title: "Present Today",
      value: d.present,
      icon: "✓",
    },
    {
      title: "Late",
      value: d.late,
      icon: "⏰",
    },
    {
      title: "Absent",
      value: d.absent.length,
      icon: "✕",
    },
  ];

  const LocationLink = ({ location, label }) => {
    if (!location?.lat || !location?.lng) {
      return <span className="text-gray-400">Location unavailable</span>;
    }

    return (
      <a
        href={mapLink(location)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
      >
        📍 {label} Map
      </a>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{s.title}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                {s.icon}
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900">
              {s.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">In Office Now</h2>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {d.inOffice.length} employees
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {d.inOffice.map((r) => (
            <div key={r._id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.user.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Checked in at {fmtTime(r.checkIn.time)}
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  In Office
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <LocationLink location={r.checkIn} label="Check-in" />

                {r.checkIn?.distanceFromOffice != null && (
                  <span className="text-gray-500">
                    Office distance: {r.checkIn.distanceFromOffice} m
                  </span>
                )}
              </div>

              {r.checkIn?.address && (
                <p className="mt-2 text-xs text-gray-500">
                  {r.checkIn.address}
                </p>
              )}
            </div>
          ))}

          {!d.inOffice.length && (
            <p className="py-8 text-center text-sm text-gray-500">
              No one is checked in.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Today's Employee Attendance & Location
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Check-in and check-out location details
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-237.5 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Check-in</th>
                <th className="px-5 py-4">Check-out</th>
                <th className="px-5 py-4">In Location</th>
                <th className="px-5 py-4">Out Location</th>
                <th className="px-5 py-4">Distance</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {todayRecords.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {r.user?.name || "Employee"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-green-700">
                    {fmtTime(r.checkIn?.time)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-orange-700">
                    {fmtTime(r.checkOut?.time)}
                  </td>

                  <td className="px-5 py-4">
                    <LocationLink location={r.checkIn} label="In" />
                    {r.checkIn?.address && (
                      <p className="mt-1 max-w-55 text-xs text-gray-500">
                        {r.checkIn.address}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <LocationLink location={r.checkOut} label="Out" />
                    {r.checkOut?.address && (
                      <p className="mt-1 max-w-55 text-xs text-gray-500">
                        {r.checkOut.address}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {r.checkIn?.distanceFromOffice != null
                      ? `${r.checkIn.distanceFromOffice} m`
                      : "-"}
                  </td>
                </tr>
              ))}

              {!todayRecords.length && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No attendance records found today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Absent Today</h2>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {d.absent.length} employees
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {d.absent.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium text-gray-900">{u.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {u.department || "No department"}
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Absent
              </span>
            </div>
          ))}

          {!d.absent.length && (
            <p className="py-8 text-center text-sm text-gray-500">
              Everyone has checked in.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
