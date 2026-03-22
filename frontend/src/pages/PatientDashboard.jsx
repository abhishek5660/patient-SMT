import { Outlet } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';

const PatientDashboard = () => {
    return (
        <PatientLayout>
            <Outlet />
        </PatientLayout>
    );
};

export default PatientDashboard;
