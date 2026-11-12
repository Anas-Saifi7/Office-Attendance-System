import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import { getLocation } from "../../utils";

export default function OfficeSettings() {
  const [o, setO] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);

  useEffect(() => {
    api
      .get("/admin/office")
      .then((r) => setO(r.data))
      .catch((err) => setMsg({ type: "error", text: errMsg(err) }));
  }, []);

  if (!o) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
        Loading office settings...
      </div>
    );
  }

  const set = (k, v) => setO((prev) => ({ ...prev, [k]: v }));

  const useMyLocation = async () => {
    setLocationBusy(true);
    setMsg({ type: "", text: "" });

    try {
      const l = await getLocation();
      setO((prev) => ({
        ...prev,
        lat: l.latitude,
        lng: l.longitude,
      }));

      setMsg({ type: "ok", text: "Office location updated. Save settings." });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setLocationBusy(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: "", text: "" });

    try {
      const body = {
        ...o,
        lat: o.lat === "" ? null : Number(o.lat),
        lng: o.lng === "" ? null : Number(o.lng),
        radius: Number(o.radius),
        graceMinutes: Number(o.graceMinutes),
      };

      await api.put("/admin/office", body);

      setMsg({ type: "ok", text: "Settings saved successfully." });
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={save}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Office Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure office location and attendance rules.
        </p>
      </div>

      <div>
        <label className={labelClass}>
          Office Name
          <input
            value={o.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
            placeholder="Office name"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Latitude
          <input
            type="number"
            step="any"
            value={o.lat ?? ""}
            onChange={(e) => set("lat", e.target.value)}
            className={inputClass}
            placeholder="28.6139"
          />
        </label>

        <label className={labelClass}>
          Longitude
          <input
            type="number"
            step="any"
            value={o.lng ?? ""}
            onChange={(e) => set("lng", e.target.value)}
            className={inputClass}
            placeholder="77.2090"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locationBusy}
        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
      >
        {locationBusy
          ? "Getting location..."
          : "Use my current location as office"}
      </button>

      <div className="rounded-xl bg-slate-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Geofence Settings</h3>

        <label className={labelClass}>
          Allowed Radius (meters)
          <input
            type="number"
            min="20"
            value={o.radius}
            onChange={(e) => set("radius", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={o.enforceGeofence}
            onChange={(e) => set("enforceGeofence", e.target.checked)}
            className="mt-1 h-4 w-4 accent-blue-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">
              Enforce Geofence
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Block check-in and check-out outside the allowed radius.
            </span>
          </span>
        </label>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Attendance Timing</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Office Start Time
            <input
              type="time"
              value={o.workStart}
              onChange={(e) => set("workStart", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Grace Period (minutes)
            <input
              type="number"
              min="0"
              value={o.graceMinutes}
              onChange={(e) => set("graceMinutes", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {msg.text && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
