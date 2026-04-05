import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import {
    LayoutDashboard, Calendar, Users, FileText, Activity, DollarSign,
    User, LogOut, Menu, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const prevNotifIds = useRef(new Set());
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch real notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 20000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Handle real-time toast popups for new notifications
    useEffect(() => {
        if (notifications.length > 0) {
            notifications.forEach(notif => {
                if (!notif.isRead && !prevNotifIds.current.has(notif._id)) {
                    toast.info(`🔔 ${notif.title}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
                prevNotifIds.current.add(notif._id);
            });
        }
    }, [notifications]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, config);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, config);
            fetchNotifications();
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

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
                    <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto no-scrollbar">
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
            <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-screen lg:overflow-hidden">
                {/* Top Header */}
                <header className="sticky top-0 lg:relative h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 bg-opacity-95 backdrop-blur-md z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 rounded-full border transition-colors 
                                ${showNotifications ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-400 border-transparent hover:bg-gray-100 hover:text-teal-600'}`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowNotifications(false)}
                                            className="fixed inset-0 z-0"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                                        >
                                            <div className="bg-teal-600 p-4">
                                                <h3 className="text-white font-bold">Notifications</h3>
                                            </div>
                                            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto no-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="py-10 text-center">
                                                        <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                                        <p className="text-gray-400 text-xs">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div 
                                                            key={notif._id} 
                                                            onClick={() => markAsRead(notif._id)}
                                                            className={`p-4 transition-colors cursor-pointer group border-l-4 
                                                            ${notif.isRead ? 'bg-white border-transparent grayscale-[0.5] opacity-70' : 'bg-teal-50/30 border-teal-500'}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 
                                                                    ${notif.type === 'warning' ? 'bg-orange-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-teal-500'}`} 
                                                                />
                                                                <div>
                                                                    <p className={`text-sm font-semibold transition-colors ${notif.isRead ? 'text-gray-600' : 'text-gray-900 group-hover:text-teal-600'}`}>{notif.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">{new Date(notif.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                                                    <button 
                                                        onClick={markAllRead}
                                                        className="text-xs font-bold text-teal-600 hover:text-teal-700"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

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
                <main className="flex-1 p-4 lg:p-8 lg:overflow-y-auto">
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
