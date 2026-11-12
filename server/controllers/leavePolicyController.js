
import LeavePolicy from "../models/LeavePolicy.js";

// Default policy
const defaultLeaveTypes = [
  { name: "Casual Leave", code: "Casual", yearlyLimit: 12, isPaid: true },
  { name: "Sick Leave", code: "Sick", yearlyLimit: 12, isPaid: true },
  { name: "Earned Leave", code: "Earned", yearlyLimit: 15, isPaid: true },
  { name: "Unpaid Leave", code: "Unpaid", yearlyLimit: 0, isPaid: false },
  { name: "Maternity Leave", code: "Maternity", yearlyLimit: 180, isPaid: true },
  { name: "Paternity Leave", code: "Paternity", yearlyLimit: 15, isPaid: true },
  { name: "Marriage Leave", code: "Marriage", yearlyLimit: 5, isPaid: true },
  { name: "Bereavement Leave", code: "Bereavement", yearlyLimit: 3, isPaid: true },
  { name: "Compensatory Off", code: "Compensatory", yearlyLimit: 0, isPaid: true },
  { name: "Work From Home", code: "WorkFromHome", yearlyLimit: 20, isPaid: true },
  { name: "Half Day Leave", code: "HalfDay", yearlyLimit: 0, isPaid: true },
];

// GET policy
export async function getLeavePolicy(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    let policy = await LeavePolicy.findOne({ year });

    if (!policy) {
      policy = await LeavePolicy.create({
        year,
        leaveTypes: defaultLeaveTypes,
      });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// UPDATE policy (admin)
export async function updateLeavePolicy(req, res) {
  try {
    const { year, leaveTypes } = req.body;

    if (!year || !Array.isArray(leaveTypes)) {
      return res.status(400).json({
        message: "Year and leave types are required",
      });
    }

    for (const type of leaveTypes) {
      if (!type.name || !type.code || Number(type.yearlyLimit) < 0) {
        return res.status(400).json({
          message: "Invalid leave type or yearly limit",
        });
      }
    }

    const policy = await LeavePolicy.findOneAndUpdate(
      { year },
      {
        year,
        leaveTypes,
        createdBy: req.user.id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      message: "Leave policy saved successfully",
      policy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
