import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, UserPlus, Calendar, CreditCard,
    Settings, LogOut, Menu, Bell, Shield, Search, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [scrolled, setScrolled] = useState(false);
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

    // Handle scroll for topbar glass effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin-dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin-dashboard/doctors', label: 'Manage Doctors', icon: UserPlus },
        { path: '/admin-dashboard/patients', label: 'Manage Patients', icon: Users },
        { path: '/admin-dashboard/appointments', label: 'Appointments', icon: Calendar },
        { path: '/admin-dashboard/financials', label: 'Financials', icon: CreditCard },
        { path: '/admin-dashboard/settings', label: 'Settings', icon: Settings },
    ];


    // Background Orbs component
    const BackgroundOrbs = () => (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[20%] -right-[10%] w-[45%] h-[45%] bg-teal-500/15 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 30, 0],
                    y: [0, -40, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-500/15 rounded-full blur-[130px]"
            />
        </div>
    );

    // Sidebar Animation Variants
    const sidebarVariants = {
        open: { width: '280px', transition: { duration: 0.4, type: 'spring', bounce: 0.1 } },
        closed: { width: '90px', transition: { duration: 0.4, type: 'spring', bounce: 0.1 } }
    };

    const textVariants = {
        open: { opacity: 1, x: 0, display: "block" },
        closed: { opacity: 0, x: -10, transitionEnd: { display: "none" } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex relative font-sans">
            <BackgroundOrbs />

            {/* Desktop Sidebar */}
            <motion.aside
                initial="open"
                animate={isSidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                className="hidden lg:flex flex-col z-50 glass-panel m-4 rounded-[32px] overflow-visible border-white/60 relative"
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center px-6 mb-4">
                    <div className="flex items-center gap-4 relative">
                        <motion.div 
                            whileHover={{ rotate: 180 }} 
                            transition={{ duration: 0.4 }}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 z-10"
                        >
                            <Shield className="text-white w-6 h-6" />
                        </motion.div>
                        <motion.div variants={textVariants} className="flex flex-col min-w-max">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 block">
                                Medi Care
                            </span>
                            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block">
                                Super Admin
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full px-4 space-y-2 relative overflow-y-auto no-scrollbar pb-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} className="relative block">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/25"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                    ${isActive ? 'text-white' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'}`}
                                >
                                    <Icon size={22} className={`flex-shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                                    <motion.span variants={textVariants} className="font-semibold text-sm whitespace-nowrap z-10">
                                        {item.label}
                                    </motion.span>

                                    {/* Tooltip for collapsed state */}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap shadow-xl translate-x-[-10px] group-hover:translate-x-0">
                                            {item.label}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-800"></div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile Section */}
                <div className="p-4 mt-auto">
                    <motion.div 
                        className={`rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'p-4' : 'p-2'}`}
                    >
                        <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <motion.div variants={textVariants} className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
                                <p className="text-xs text-slate-500 truncate">admin@medcare.com</p>
                            </motion.div>
                        </div>
                        <motion.button
                            variants={textVariants}
                            onClick={handleLogout}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-bold shadow-sm"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </motion.button>
                        
                        {!isSidebarOpen && (
                             <button
                             onClick={handleLogout}
                             className="mt-2 w-full flex items-center justify-center p-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                         >
                             <LogOut size={20} />
                         </button>
                        )}
                    </motion.div>
                </div>
                
                {/* Sidebar Toggle Button */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-4 top-12 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-md hover:text-primary hover:scale-110 transition-all z-50"
                >
                    <ChevronRight size={18} className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl flex flex-col lg:hidden border-r border-slate-100"
                        >
                            <div className="h-24 flex items-center justify-between px-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center shadow-lg">
                                        <Shield className="text-white w-5 h-5" />
                                    </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-900 leading-tight">Medi Care</span>
                                    <span className="text-[9px] font-bold text-primary tracking-[0.1em] uppercase">Super Admin</span>
                                </div>
                                </div>
                                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-500 bg-slate-50 rounded-full hover:bg-slate-100">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                        >
                                            <item.icon size={22} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                             <div className="p-6 border-t border-slate-100 mt-auto">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-all">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-screen lg:overflow-hidden z-10 relative">
                
                {/* Floating Top Header */}
                <header className="sticky top-0 lg:relative px-4 lg:px-8 py-4 lg:py-6 z-40 transition-all duration-300">
                    <div className={`flex items-center justify-between gap-4 p-4 rounded-3xl transition-all duration-500 ${scrolled ? 'glass-card shadow-lg bg-white/90 backdrop-blur-md' : 'bg-transparent'}`}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="lg:hidden p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-primary transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden md:block">
                                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-6 flex-1 justify-end">
                            {/* Search Bar - Hidden on small screens */}
                            <div className="hidden md:flex items-center relative max-w-md w-full">
                                <div className="absolute left-4 text-slate-400">
                                    <Search size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search patients, doctors..." 
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-medium shadow-sm transition-all"
                                />
                                <div className="absolute right-2 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                                    ⌘K
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`relative p-3 rounded-2xl border transition-all hover:scale-105 shadow-sm 
                                    ${isNotificationsOpen ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30'}`}
                                >
                                    <Bell size={20} />
                                    {notifications.some(n => !n.isRead) && (
                                        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
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
                                                className="absolute right-0 mt-4 w-[320px] md:w-[380px] glass-card rounded-[28px] shadow-2xl p-4 overflow-hidden z-20 origin-top-right border border-white/60"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2">
                                                    <h3 className="text-lg font-black text-slate-800">Notifications</h3>
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-1 rounded-lg">3 New</span>
                                                </div>
                                                <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                                                    {notifications.length === 0 ? (
                                                        <div className="py-10 text-center">
                                                            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                            <p className="text-slate-400 text-sm">No notifications yet</p>
                                                        </div>
                                                    ) : (
                                                        notifications.map(notif => (
                                                            <div 
                                                                key={notif._id} 
                                                                onClick={() => markAsRead(notif._id)}
                                                                className={`p-4 rounded-[20px] transition-all duration-300 group cursor-pointer border 
                                                                ${notif.isRead ? 'bg-slate-50/50 grayscale-[0.5] opacity-70 border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}
                                                            >
                                                                <div className="flex justify-between items-start gap-3">
                                                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 
                                                                        ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} 
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm font-black transition-colors ${notif.isRead ? 'text-slate-600' : 'text-slate-800 group-hover:text-primary'}`}>{notif.title}</p>
                                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{new Date(notif.createdAt).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                {notifications.length > 0 && (
                                                    <button 
                                                        onClick={markAllRead}
                                                        className="w-full mt-4 py-3 text-xs font-black text-slate-400 hover:text-primary transition-colors border-t border-slate-100 pt-4 bg-transparent outline-none"
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
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 px-4 lg:px-8 pb-8 lg:overflow-y-auto no-scrollbar relative z-10 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="max-w-[1600px] mx-auto w-full pb-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
