const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeCode: { type: String, required: true },
  date: { type: Date, default: Date.now },
  clockIn: { type: Date, required: false },
  clockOut: { type: Date, required: false },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
