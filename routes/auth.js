const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const router = express.Router();

const JWT_SECRET = "your_jwt_secret"; 

router.get('/',async(req,res)=>{
res.send('hiiiii')
});

router.post('/login', async (req, res) => {
  const { employeeCode, password } = req.body;

  try {
    const employee = await Employee.findOne({ employeeCode });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ employeeCode: employee.employeeCode }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


router.post('/change-password', async (req, res) => {
  const { employeeCode, oldPassword, newPassword } = req.body;

  try {
    const employee = await Employee.findOne({ employeeCode });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const validPassword = await bcrypt.compare(oldPassword, employee.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid old password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


router.post('/reset-password', async (req, res) => {
  const { employeeCode, newPassword } = req.body;

  try {
    const employee = await Employee.findOne({ employeeCode });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { employeeCode, password } = req.body;

  try {
    
    const existingEmployee = await Employee.findOne({ employeeCode });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = new Employee({
      employeeCode,
      password: hashedPassword,
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
