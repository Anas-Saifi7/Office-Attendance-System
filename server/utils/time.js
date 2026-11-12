const TZ = "Asia/Kolkata";

export function todayIST(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date); // YYYY-MM-DD
}

export function minutesSinceMidnightIST(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour").value) % 24;
  const m = Number(parts.find((p) => p.type === "minute").value);
  return h * 60 + m;
}

export function hhmmToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}
