import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import {
    LayoutDashboard, Calendar, FileText, FileBarChart, CreditCard,
    User, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PatientLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
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
            // Optional: Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

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
        { path: '/patient-dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/patient-dashboard/appointments', label: 'My Appointments', icon: Calendar },
        { path: '/patient-dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
        { path: '/patient-dashboard/reports', label: 'Medical Reports', icon: FileBarChart },
        { path: '/patient-dashboard/billing', label: 'Billing & Payments', icon: CreditCard },
        { path: '/patient-dashboard/profile', label: 'Profile Settings', icon: User },
    ];


    return (
        <div className="min-h-screen bg-gray-50/50 flex relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-300 ease-in-out transform 
                ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-24'} 
                lg:static lg:block m-4 ml-4 my-4 rounded-3xl hidden lg:flex flex-col`}
            >
                <div className="h-full flex flex-col py-6">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-center mb-8">
                        <div className={`flex items-center gap-3 transition-all duration-300 ${isSidebarOpen ? 'px-6' : 'px-0'}`}>
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-xl shadow-lg shadow-blue-500/20">
                                <LayoutDashboard className="text-white w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                        MedCare
                                    </span>
                                    <span className="text-xs font-semibold text-blue-500 tracking-wider uppercase">Patient Portal</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-2 px-4 overflow-y-auto no-scrollbar">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                    ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                                            : 'text-gray-500 hover:bg-white hover:shadow-md hover:text-blue-600 hover:translate-x-1'
                                        }`}
                                >
                                    <Icon size={22} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-10px] hidden'}`}>
                                        {item.label}
                                    </span>
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap shadow-xl">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="px-4 mt-auto pt-6 border-t border-gray-100">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm ${!isSidebarOpen && 'p-2'}`}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-teal-100 flex items-center justify-center text-blue-600 shadow-inner overflow-hidden">
                                    {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                        <img src={`${API_BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-400 truncate">Patient Account</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className={`mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium
                                ${!isSidebarOpen ? 'justify-center mt-2' : ''}`}
                            >
                                <LogOut size={18} />
                                {isSidebarOpen && <span>Sign Out</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden w-72
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-lg shadow-lg">
                                <LayoutDashboard className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold">MedCare Patient</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                    <nav className="space-y-2 flex-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                    
                    {/* Mobile Logout */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-[100dvh] lg:h-screen lg:overflow-hidden">
                {/* Top Header - Glassmorphic */}
                <header className="h-20 flex items-center justify-between px-8 py-4 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/20 hover:bg-white hover:shadow-lg transition-all text-gray-600"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 hidden md:block animate-fade-in">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-3 rounded-xl backdrop-blur-md border transition-all hover:shadow-lg 
                                ${isNotificationsOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/50 border-white/20 text-gray-500 hover:text-blue-600'}`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="fixed inset-0 z-0"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-[300px] md:w-[350px] bg-white rounded-3xl shadow-2xl p-4 overflow-hidden z-20 origin-top-right border border-gray-100"
                                        >
                                            <div className="flex items-center justify-between mb-4 px-2">
                                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Recent</span>
                                            </div>
                                            <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                                                {notifications.length === 0 ? (
                                                    <div className="py-10 text-center">
                                                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                                        <p className="text-gray-400 text-sm">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div 
                                                            key={notif._id} 
                                                            onClick={() => markAsRead(notif._id)}
                                                            className={`p-3.5 rounded-2xl transition-all duration-200 group cursor-pointer border 
                                                            ${notif.isRead ? 'bg-gray-50/50 grayscale-[0.5] opacity-70' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 
                                                                    ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                                                />
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-bold transition-colors ${notif.isRead ? 'text-gray-600' : 'text-gray-900 group-hover:text-blue-600'}`}>{notif.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                                    <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase">{new Date(notif.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <button 
                                                    onClick={markAllRead}
                                                    className="w-full mt-4 py-3 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors border-t border-gray-50 pt-4 bg-transparent outline-none"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-8 pb-8 overflow-y-auto overscroll-y-none custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-slide-up">
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

export default PatientLayout;
