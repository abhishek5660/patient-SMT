import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import {
    LayoutDashboard, Calendar, Users, FileText, Activity, DollarSign,
    User, LogOut, Menu, Bell, X, ChevronDown, Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
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
        { path: '/doctor-dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/doctor-dashboard/appointments', label: 'Appointments', icon: Calendar },
        { path: '/doctor-dashboard/patients', label: 'My Patients', icon: Users },
        { path: '/doctor-dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
        { path: '/doctor-dashboard/reports', label: 'Patient Reports', icon: Activity },
        { path: '/doctor-dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { path: '/doctor-dashboard/profile', label: 'Profile Settings', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col relative overflow-x-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Left: Mobile Menu & Logo */}
                        <div className="flex items-center gap-3 lg:gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2.5 rounded-xl bg-white/50 backdrop-blur-md border border-gray-100 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-tr from-teal-600 to-blue-500 rounded-xl shadow-lg shadow-teal-500/20">
                                    <Stethoscope className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-900 to-teal-600">
                                        MedCare Dr.
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-semibold text-teal-500 tracking-wider">Physician Portal</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions (Notifications & Profile) */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className={`relative p-2.5 sm:p-3 rounded-xl backdrop-blur-md border transition-all hover:shadow-md 
                                    ${showNotifications ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/50 border-gray-100 text-gray-500 hover:text-teal-600'}`}
                                >
                                    <Bell size={20} />
                                    {notifications.some(n => !n.isRead) && (
                                        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
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
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                className="fixed sm:absolute top-20 sm:top-auto left-4 right-4 sm:left-auto sm:-right-4 mt-2 sm:mt-4 w-auto sm:w-[350px] bg-white rounded-3xl shadow-2xl p-4 overflow-hidden z-50 origin-top sm:origin-top-right border border-gray-100"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2">
                                                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">Recent</span>
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
                                                                ${notif.isRead ? 'bg-gray-50/50 grayscale-[0.5] opacity-70' : 'bg-teal-50/50 border-teal-100 shadow-sm'}`}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 
                                                                        ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-orange-500' : 'bg-teal-500'}`} 
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm font-bold transition-colors ${notif.isRead ? 'text-gray-600' : 'text-gray-900 group-hover:text-teal-600'}`}>{notif.title}</p>
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
                                                        className="w-full mt-4 py-3 text-xs font-bold text-gray-400 hover:text-teal-600 transition-colors border-t border-gray-50 pt-4 bg-transparent outline-none"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsProfileMenuOpen(!isProfileMenuOpen);
                                        setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-100 to-blue-100 flex items-center justify-center text-teal-600 shadow-inner overflow-hidden">
                                        {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                            <img src={`${API_BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="text-left hidden md:block mr-2">
                                        <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">Dr. {user?.name?.split(' ')[0] || 'Doctor'}</p>
                                        <p className="text-[10px] text-teal-600 font-semibold truncate max-w-[120px]">{user?.specialization || 'Physician'}</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
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
                                                    <p className="text-sm font-bold text-gray-900 truncate">Dr. {user?.name || 'Guest User'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user?.email || 'doctor@example.com'}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        navigate('/doctor-dashboard/profile');
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
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative w-full max-w-screen-2xl mx-auto">
                {/* Overlay for mobile sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden" 
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Left Sidebar */}
                <aside 
                    className={`fixed lg:static inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-xl lg:bg-transparent shadow-2xl lg:shadow-none border-r border-gray-100 transition-transform duration-300 transform 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                    w-72 lg:w-64 flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] pt-6 lg:pt-8 top-20 lg:top-0`}
                >
                    <div className="px-6 pb-4">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Menu</p>
                    </div>
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                    ${isActive
                                            ? 'bg-gradient-to-r from-teal-50 to-teal-100/50 text-teal-700 shadow-sm border border-teal-100/50'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-teal-600 border border-transparent'
                                        }`}
                                >
                                    <Icon size={20} className={`${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600'} transition-colors`} />
                                    <span className={`font-semibold text-sm ${isActive ? 'text-teal-700' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Quick Stats / Info snippet at bottom of sidebar */}
                    <div className="p-6 border-t border-gray-100/60 hidden lg:block">
                        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-4 border border-teal-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-teal-600" />
                                <p className="text-xs font-bold text-teal-900">System Status</p>
                            </div>
                            <p className="text-[10px] font-medium text-teal-700/80 leading-relaxed">
                                Portal is running smoothly. All services operational.
                            </p>
                        </div>
                    </div>
                </aside>
                
                {/* Main Content */}
                <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 z-10 h-[calc(100vh-80px)]">
                    <div className="animate-slide-up w-full max-w-6xl mx-auto pb-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;
