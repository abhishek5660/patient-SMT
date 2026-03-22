import { Outlet } from 'react-router-dom';
import DoctorLayout from '../components/DoctorLayout';

const DoctorDashboard = () => {
    return (
        <DoctorLayout>
            <Outlet />
        </DoctorLayout>
    );
};

export default DoctorDashboard;
