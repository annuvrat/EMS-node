const express = require('express');
const authenticateJWT = require('../middleware/auth');
const Employee = require('../models/Employee');

const Holiday = require('../models/Holiday');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const router = express.Router();



router.get('/profile', authenticateJWT, async (req, res) => {
  const { employeeCode } = req.employee;

  try {
    const employee = await Employee.findOne({ employeeCode });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;

router.post('/apply-leave', authenticateJWT, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const leave = new Leave({
      employeeCode: req.employee.employeeCode,
      leaveType,
      startDate,
      endDate,
      reason, 
    });

    await leave.save();
    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error applying leave', error: err.message });
  }
});


router.get('/leave-details', authenticateJWT, async (req, res) => {
  try {
    const leaveDetails = await Leave.aggregate([
      { $match: { employeeCode: req.employee.employeeCode } },
      { $group: {
          _id: "$leaveType",
          totalLeaves: { $sum: { $subtract: ["$endDate", "$startDate"] } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          leaveType: "$_id",
          totalLeaves: { $divide: ["$totalLeaves", 1000 * 60 * 60 * 24] }, // Convert milliseconds to days
          applications: "$count",
        },
      },
    ]);

    res.json({ leaveDetails });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave summary', error: err.message });
  }
});

router.get('/holidays', authenticateJWT, async (req, res) => {
  try {
    const holidays = await Holiday.find({});
    res.json({ holidays });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching holidays', error: err.message });
  }
});

router.get('/birthdays', authenticateJWT, async (req, res) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; 
  const currentDay = today.getDate();

  try {
    const birthdays = await Employee.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, currentMonth] },
          { $gte: [{ $dayOfMonth: "$dateOfBirth" }, currentDay] },
        ],
      },
    }).select("employeeCode name dateOfBirth");

    res.json({ birthdays });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching birthdays', error: err.message });
  }
});

router.post('/clock-in', authenticateJWT, async (req, res) => {
  const { employeeCode } = req.employee; 

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const existingEntry = await Attendance.findOne({
      employeeCode,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'You have already clocked in today.' });
    }

    const attendance = new Attendance({
      employeeCode,
      clockIn: new Date(),
    });

    await attendance.save();
    res.status(200).json({ message: 'Clock-in successful.', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Error clocking in.', error: err.message });
  }
});

router.post('/clock-out', authenticateJWT, async (req, res) => {
  const { employeeCode } = req.employee; // Extract from JWT token

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const attendance = await Attendance.findOne({
      employeeCode,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!attendance) {
      return res.status(400).json({ message: 'You need to clock in before clocking out.' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'You have already clocked out today.' });
    }

    attendance.clockOut = new Date();
    await attendance.save();

    res.status(200).json({ message: 'Clock-out successful.', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Error clocking out.', error: err.message });
  }
});
