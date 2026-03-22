import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorOverview from './components/doctor/DoctorOverview';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import MyPatients from './components/doctor/MyPatients';
import PrescriptionManagement from './components/doctor/PrescriptionManagement';
import DoctorReports from './components/doctor/DoctorReports';
import DoctorEarnings from './components/doctor/DoctorEarnings';
import DoctorProfile from './components/doctor/DoctorProfile';
import DashboardOverview from './components/patient/DashboardOverview';
import MyAppointments from './components/patient/MyAppointments';
import MyPrescriptions from './components/patient/MyPrescriptions';
import MedicalReports from './components/patient/MedicalReports';
import BillingPayments from './components/patient/BillingPayments';
import ProfileSettings from './components/patient/ProfileSettings';
import AdminOverview from './components/admin/AdminOverview';
import ManageDoctors from './components/admin/ManageDoctors';
import ManagePatients from './components/admin/ManagePatients';
import AdminAppointments from './components/admin/AdminAppointments';
import FinancialManagement from './components/admin/FinancialManagement';
import AdminProfile from './components/admin/AdminProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="prescriptions" element={<MyPrescriptions />} />
            <Route path="reports" element={<MedicalReports />} />
            <Route path="billing" element={<BillingPayments />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />}>
            <Route index element={<DoctorOverview />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<MyPatients />} />
            <Route path="prescriptions" element={<PrescriptionManagement />} />
            <Route path="reports" element={<DoctorReports />} />
            <Route path="earnings" element={<DoctorEarnings />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="financials" element={<FinancialManagement />} />
            <Route path="settings" element={<AdminProfile />} />
          </Route>
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
