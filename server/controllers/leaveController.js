import Leave from "../models/Leave.js";

const TYPES = ["Casual", "Sick", "Earned", "Unpaid"];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Employee: Apply leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!TYPES.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    if (!startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        message: "Start date, end date and reason are required.",
      });
    }

    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    const today = startOfDay(new Date());

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid dates." });
    }

    if (start < today || end < start) {
      return res.status(400).json({
        message: "Please select valid future dates.",
      });
    }

    if (reason.trim().length > 500) {
      return res.status(400).json({
        message: "Reason cannot exceed 500 characters.",
      });
    }

    // Prevent overlapping pending or approved leave
    const overlapping = await Leave.findOne({
      employee: req.user.id,
      status: { $in: ["Pending", "Approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlapping) {
      return res.status(409).json({
        message: "You already have a leave request for these dates.",
      });
    }

    const days =
      Math.floor((end - start) / 86400000) + 1;

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason: reason.trim(),
    });

    res.status(201).json({
      message: "Leave applied successfully.",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee: My leave requests
export const myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee: Leave details
export const leaveDetails = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.id,
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee: Cancel pending leave
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.id,
      status: "Pending",
    });

    if (!leave) {
      return res.status(404).json({
        message: "Pending leave request not found.",
      });
    }

    leave.status = "Cancelled";
    await leave.save();

    res.json({ message: "Leave cancelled successfully.", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: All leaves
export const allLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve or reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected.",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leaves can be reviewed.",
      });
    }

    if (status === "Approved") {
      const overlapping = await Leave.findOne({
        _id: { $ne: leave._id },
        employee: leave.employee,
        status: "Approved",
        startDate: { $lte: leave.endDate },
        endDate: { $gte: leave.startDate },
      });

      if (overlapping) {
        return res.status(409).json({
          message: "Employee already has approved leave for these dates.",
        });
      }
    }

    if (status === "Rejected" && !adminRemark?.trim()) {
      return res.status(400).json({
        message: "Please provide a rejection reason.",
      });
    }

    leave.status = status;
    leave.adminRemark = adminRemark?.trim() || "";
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();

    await leave.save();

    res.json({
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
