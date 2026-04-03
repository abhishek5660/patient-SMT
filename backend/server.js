
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));

// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/https://patient-smt-backend.onrender.com/auth', authRoutes);
app.use('/https://patient-smt-backend.onrender.com/appointments', require('./routes/appointmentRoutes'));
app.use('/https://patient-smt-backend.onrender.com/users', require('./routes/userRoutes'));
app.use('/https://patient-smt-backend.onrender.com/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/https://patient-smt-backend.onrender.com/payments', require('./routes/paymentRoutes'));
app.use('/https://patient-smt-backend.onrender.com/invoices', require('./routes/invoiceRoutes'));
app.use('/https://patient-smt-backend.onrender.com/reports', require('./routes/reportRoutes'));
app.use('/https://patient-smt-backend.onrender.com/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/https://patient-smt-backend.onrender.com/doctor', require('./routes/doctorRoutes'));
app.use('/https://patient-smt-backend.onrender.com/admin', require('./routes/adminRoutes'));

// Serve uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
