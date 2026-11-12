import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Office from "../models/Office.js";
import { todayIST } from "../utils/time.js";

export async function dashboard(req, res) {
  const date = todayIST();
  const [employees, records] = await Promise.all([
    User.find({ role: "employee", isActive: true }).select(
      "name email department",
    ),
    Attendance.find({ date }).populate("user", "name email department"),
  ]);
  const presentIds = new Set(records.map((r) => String(r.user._id)));
  res.json({
    date,
    totalEmployees: employees.length,
    present: records.length,
    late: records.filter((r) => r.status === "late").length,
    absent: employees.filter((e) => !presentIds.has(String(e._id))),
    inOffice: records.filter((r) => !r.checkOut?.time),
  });
}

export async function listEmployees(req, res) {
  res.json(await User.find({ role: "employee" }).sort({ name: 1 }));
}

export async function createEmployee(req, res) {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email and password required" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email already exists" });

  const user = await User.create({
    name,
    email,
    password,
    department,
    role: "employee",
  });
  res.status(201).json({ id: user._id, name: user.name, email: user.email });
}

export async function updateEmployee(req, res) {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "employee")
    return res.status(404).json({ message: "Employee not found" });

  const { name, department, isActive, password } = req.body;
  if (name !== undefined) user.name = name;
  if (department !== undefined) user.department = department;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;
  await user.save();
  res.json({ message: "Updated" });
}

function buildFilter(q) {
  const filter = {};
  if (q.userId) filter.user = q.userId;
  if (q.from || q.to) {
    filter.date = {};
    if (q.from) filter.date.$gte = q.from;
    if (q.to) filter.date.$lte = q.to;
  }
  if (q.status) filter.status = q.status;
  return filter;
}

export async function listAttendance(req, res) {
  const records = await Attendance.find(buildFilter(req.query))
    .populate("user", "name email department")
    .sort({ date: -1 })
    .limit(500);
  res.json(records);
}

export async function exportCsv(req, res) {
  const records = await Attendance.find(buildFilter(req.query))
    .populate("user", "name email department")
    .sort({ date: -1 });

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "";
  const rows = [
    [
      "Date",
      "Name",
      "Email",
      "Department",
      "Status",
      "Check-in",
      "Check-in location",
      "Check-out",
      "Check-out location",
      "Hours",
    ],
    ...records.map((r) => [
      r.date,
      r.user?.name,
      r.user?.email,
      r.user?.department,
      r.status,
      fmt(r.checkIn?.time),
      r.checkIn?.address || `${r.checkIn?.lat},${r.checkIn?.lng}`,
      fmt(r.checkOut?.time),
      r.checkOut
        ? r.checkOut.address || `${r.checkOut.lat},${r.checkOut.lng}`
        : "",
      (r.workingMinutes / 60).toFixed(2),
    ]),
  ];
  res.header("Content-Type", "text/csv");
  res.attachment("attendance.csv");
  res.send(rows.map((r) => r.map(esc).join(",")).join("\n"));
}

export async function editAttendance(req, res) {
  const record = await Attendance.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Record not found" });

  const { checkInTime, checkOutTime, status, note } = req.body;
  if (checkInTime) record.checkIn.time = new Date(checkInTime);
  if (checkOutTime) {
    record.checkOut = {
      ...(record.checkOut?.toObject?.() || {}),
      time: new Date(checkOutTime),
    };
  }
  if (status) record.status = status;
  if (record.checkOut?.time)
    record.workingMinutes = Math.max(
      0,
      Math.round((record.checkOut.time - record.checkIn.time) / 60000),
    );

  record.editedBy = req.user._id;
  record.editNote = note || "Edited by admin";
  await record.save();
  res.json(record);
}

export async function getOffice(req, res) {
  res.json((await Office.findOne()) || (await Office.create({})));
}

export async function updateOffice(req, res) {
  const office = (await Office.findOne()) || (await Office.create({}));
  const fields = [
    "name",
    "lat",
    "lng",
    "radius",
    "enforceGeofence",
    "workStart",
    "graceMinutes",
  ];
  fields.forEach((f) => req.body[f] !== undefined && (office[f] = req.body[f]));
  await office.save();
  res.json(office);
}
