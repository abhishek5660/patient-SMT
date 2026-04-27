import { useState, useEffect, useRef } from 'react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
        { path: '/patient-dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/patient-dashboard/appointments', label: 'Appointments', icon: Calendar },
        { path: '/patient-dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
        { path: '/patient-dashboard/reports', label: 'Reports', icon: FileBarChart },
        { path: '/patient-dashboard/billing', label: 'Billing', icon: CreditCard },
        { path: '/patient-dashboard/profile', label: 'Profile', icon: User },
    ];


    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col relative overflow-x-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Left: Logo */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-xl shadow-lg shadow-blue-500/20">
                                <LayoutDashboard className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                    MedCare
                                </span>
                                <span className="text-[10px] sm:text-xs font-semibold text-blue-500 tracking-wider">Patient Portal</span>
                            </div>
                        </div>

                        {/* Center: Desktop Nav Links */}
                        <nav className="hidden lg:flex space-x-1 flex-1 justify-center px-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group
                                        ${isActive
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600 font-medium'
                                            }`}
                                    >
                                        <Icon size={18} className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'} transition-colors`} />
                                        <span className="whitespace-nowrap text-sm">
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <motion.div layoutId="navbar-active" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-t-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right: Actions (Notifications & Profile) */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            
                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className={`relative p-2.5 sm:p-3 rounded-xl backdrop-blur-md border transition-all hover:shadow-md 
                                    ${isNotificationsOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/50 border-gray-100 text-gray-500 hover:text-blue-600'}`}
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
                                                className="fixed sm:absolute top-20 sm:top-auto left-4 right-4 sm:left-auto sm:-right-4 mt-2 sm:mt-4 w-auto sm:w-[350px] bg-white rounded-3xl shadow-2xl p-4 overflow-hidden z-50 origin-top sm:origin-top-right border border-gray-100"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2">
                                                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Recent</span>
                                                </div>
                                                <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
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
                                                                        <p className="text-[10px] font-semibold text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
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

                            {/* Profile Dropdown (Desktop) */}
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => {
                                        setIsProfileMenuOpen(!isProfileMenuOpen);
                                        setIsNotificationsOpen(false);
                                    }}
                                    className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-teal-100 flex items-center justify-center text-blue-600 shadow-inner overflow-hidden">
                                        {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                            <img src={`${API_BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="text-left hidden md:block mr-2">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name?.split(' ')[0] || 'User'}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold">Patient</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <>
                                            <motion.div 
                                                initial={{ opacity: 0 }} 
                                                animate={{ opacity: 1 }} 
                                                exit={{ opacity: 0 }}
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="fixed inset-0 z-0"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl p-2 z-50 origin-top-right border border-gray-100"
                                            >
                                                <div className="p-3 border-b border-gray-50 mb-2">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Guest User'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user?.email || 'patient@example.com'}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        navigate('/patient-dashboard/profile');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
                                                >
                                                    <User size={16} className="text-gray-400" />
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-red-50 text-sm font-semibold text-red-600 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2.5 rounded-xl bg-white/50 backdrop-blur-md border border-gray-100 hover:bg-gray-50 text-gray-600 transition-colors ml-1"
                            >
                                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-1">
                                {/* Mobile User Info */}
                                <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-gray-50 border border-gray-100 sm:hidden">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-100 to-teal-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                        {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                            <img src={`${API_BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user?.name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-500 font-semibold">Patient Account</p>
                                    </div>
                                </div>

                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                
                                <div className="pt-4 mt-2 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 z-10">
                <div className="animate-slide-up h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PatientLayout;
