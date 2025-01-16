const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeCode: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // dateOfBirth: { type: Date, required: true }, // New field
});

module.exports = mongoose.model('Employee', employeeSchema);
