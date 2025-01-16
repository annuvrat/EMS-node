// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); 
// const authenticateJWT = require('./middleware/auth'); 
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3002;


const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');

app.use('/auth', authRoutes);
app.use('/employee', employeeRoutes);
// app.use('dash',dashRoutes);


process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
