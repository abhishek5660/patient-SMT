import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
    LayoutDashboard, Calendar, Users, FileText, Activity, DollarSign,
    User, LogOut, Menu, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/doctor-dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/doctor-dashboard/appointments', label: 'Appointments', icon: Calendar },
        { path: '/doctor-dashboard/patients', label: 'My Patients', icon: Users },
        { path: '/doctor-dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
        { path: '/doctor-dashboard/reports', label: 'Patient Reports', icon: Activity },
        { path: '/doctor-dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { path: '/doctor-dashboard/profile', label: 'Profile Settings', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 transform 
                ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'} 
                lg:static lg:block border-r border-gray-100`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-center border-b border-gray-100">
                        {isSidebarOpen ? (
                            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">
                                MedCare Dr.
                            </span>
                        ) : (
                            <span className="text-2xl font-bold text-teal-600">Dr</span>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 py-6 space-y-2 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                            ? 'bg-teal-50 text-teal-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-teal-600'
                                        }`}
                                >
                                    <Icon size={20} className={`${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'hidden lg:hidden'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
                            ${!isSidebarOpen && 'justify-center'}`}
                        >
                            <LogOut size={20} />
                            <span className={`${isSidebarOpen ? 'block' : 'hidden lg:hidden'} font-medium`}>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-[100dvh] lg:h-screen lg:overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 bg-opacity-80 backdrop-blur-md sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-6 ml-auto">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">Dr. {user?.name || 'Doctor'}</p>
                                <p className="text-xs text-gray-500">{user?.specialization || 'General Physician'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                    <img src={`${API_BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-teal-600" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto overscroll-y-contain">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                ></div>
            )}
        </div>
    );
};

export default DoctorLayout;
