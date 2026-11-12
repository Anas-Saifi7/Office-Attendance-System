import Attendance from "../models/Attendance.js";
import Office from "../models/Office.js";
import reverseGeocode from "../utils/reverseGeocode.js";
import { distanceMeters } from "../utils/geo.js";
import {
  todayIST,
  minutesSinceMidnightIST,
  hhmmToMinutes,
} from "../utils/time.js";

async function getOffice() {
  return (await Office.findOne()) || (await Office.create({}));
}

function readLocation(body) {
  const lat = Number(body.latitude);
  const lng = Number(body.longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  )
    return null;
  return { lat, lng, accuracy: Number(body.accuracy) || null };
}

async function buildPoint(loc, office) {
  const distance =
    office.lat != null && office.lng != null
      ? distanceMeters(loc.lat, loc.lng, office.lat, office.lng)
      : null;

  if (office.enforceGeofence && distance != null && distance > office.radius) {
    const err = new Error(
      `You are ${distance} m away from office (allowed ${office.radius} m)`,
    );
    err.status = 403;
    throw err;
  }
  return {
    time: new Date(),
    lat: loc.lat,
    lng: loc.lng,
    accuracy: loc.accuracy,
    address: await reverseGeocode(loc.lat, loc.lng),
    distanceFromOffice: distance,
  };
}

export async function checkIn(req, res) {
  const loc = readLocation(req.body);
  if (!loc) return res.status(400).json({ message: "Valid location required" });

  const date = todayIST();
  if (await Attendance.findOne({ user: req.user._id, date }))
    return res.status(409).json({ message: "Already checked in today" });

  const office = await getOffice();
  try {
    const point = await buildPoint(loc, office);
    const limit = hhmmToMinutes(office.workStart) + office.graceMinutes;
    const status = minutesSinceMidnightIST() > limit ? "late" : "present";
    const record = await Attendance.create({
      user: req.user._id,
      date,
      checkIn: point,
      status,
    });
    res.status(201).json(record);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
}

export async function checkOut(req, res) {
  const loc = readLocation(req.body);
  if (!loc) return res.status(400).json({ message: "Valid location required" });

  const record = await Attendance.findOne({
    user: req.user._id,
    date: todayIST(),
  });
  if (!record) return res.status(400).json({ message: "Check in first" });
  if (record.checkOut?.time)
    return res.status(409).json({ message: "Already checked out today" });

  const office = await getOffice();
  try {
    record.checkOut = await buildPoint(loc, office);
    record.workingMinutes = Math.max(
      0,
      Math.round((record.checkOut.time - record.checkIn.time) / 60000),
    );
    await record.save();
    res.json(record);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
}

export async function today(req, res) {
  res.json(await Attendance.findOne({ user: req.user._id, date: todayIST() }));
}

export async function myHistory(req, res) {
  const filter = { user: req.user._id };
  if (req.query.month) filter.date = { $regex: `^${req.query.month}` };
  const records = await Attendance.find(filter).sort({ date: -1 });

  const summary = {
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    totalMinutes: records.reduce((s, r) => s + r.workingMinutes, 0),
  };
  res.json({ records, summary });
}
