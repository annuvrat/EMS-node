const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');


module.exports = {

    basic:(req,res) =>{
        res.send("hiiii my frnd");
    },

    login: async (req, res) => {
     const { email, password } = req.body;
   
     try {
       
       const employee = await Employee.findOne({ email });
       if (!employee) {
         return res.status(404).json({ message: 'Employee not found' });
       }
   
       
       const validPassword = await bcrypt.compare(password, employee.password);
       if (!validPassword) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }
   
       const token = jwt.sign(
         { name: employee.name, role: employee.role },
         process.env.JWT_SECRET,
         { expiresIn: '1h' }
       );
   
       
       res.cookie('token', token, {
         httpOnly: true, 
         secure: process.env.NODE_ENV === 'development',
         maxAge: 60 * 60 * 1000, // 1 hour
       });
   
       res.status(200).json({ message: 'Login successful' });
     } catch (err) {
       res.status(500).json({ message: 'Internal server error', error: err.message });
     }
   },

    register : async (req, res) => {
     const {  password, name, email, birthdate, role, address, phoneNumber, department } = req.body;
     
     const missingfiled = [];
     if(!name) missingfiled.push('name');
     if(!email) missingfiled.push('email');
     if(!password) missingfiled.push('password');
     if(!birthdate) missingfiled.push('birthdate');
     if(!role) missingfiled.push('role');
     if(!address) missingfiled.push('address');
     if(!phoneNumber) missingfiled.push('phoneNumber');
     if(!department) missingfiled.push('department');

     if(missingfiled.length>0){
        const errorMessage = `missing required fields:${missingfiled.join(', ')}`;
        console.error(errorMessage);
        return res.status(400).json({message:errorMessage});

     }
     try {
       
       const existingEmployee = await Employee.findOne({ name });
       if (existingEmployee) {
         return res.status(400).json({ message: 'Employee already exists' });
       }
       const hashedPassword = await bcrypt.hash(password, 10);
       const newEmployee = new Employee({
       
         name,
         email,
         password: hashedPassword,
         birthdate,
         role,
         address,
         phoneNumber,
         department,
       });
   
       await newEmployee.save();
       res.status(201).json({ message: 'Employee registered successfully' });
     } catch (err) {
       res.status(500).json({ message: 'Internal server error', error: err.message });
     }
   },

resetpassword:  async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
},

changepassword: async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
 
    const employee = await Employee.findOne({ email });
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
},

    
}
