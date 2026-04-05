import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Calendar, CreditCard, Activity, TrendingUp, Download, Plus, Clock } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_BASE_URL from '../../config';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, trend, subtext, onClick }) => (
    <motion.div 
        variants={itemVariants} 
        onClick={onClick}
        className="glass-card p-6 relative overflow-hidden group cursor-pointer"
    >
        {/* Animated Background Gradient Blob */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 ${gradientClass} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out`} />
        
        <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-1">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
            {trend !== undefined && (
                <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
            <p className="text-xs font-medium text-slate-400">{subtext}</p>
        </div>
    </motion.div>
);

const AdminOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [revenueFilter, setRevenueFilter] = useState('This Year');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, config);
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const downloadReport = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        doc.setFontSize(22);
        doc.text('Medi Care System Overview', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor('#64748B');
        doc.text(`Generated on: ${date}`, 14, 30);

        const statsData = [
            ['Metric', 'Value'],
            ['Total Patients', stats.totalPatients],
            ['Active Doctors', stats.totalDoctors],
            ['Total Appointments', stats.totalAppointments],
            ['Total Revenue', `$${stats.totalRevenue}`],
            ['Pending Payments', stats.pendingPayments]
        ];

        doc.autoTable({
            startY: 40,
            head: [statsData[0]],
            body: statsData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: '#3B82F6', textColor: '#ffffff' }
        });

        doc.save(`medicare-report-${date.replace(/\//g, '-')}.pdf`);
    };

    // Mock data for beautiful charts
    const revenueDataThisYear = [
        { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 5200 },
        { name: 'Mar', revenue: 3800 }, { name: 'Apr', revenue: 6780 },
        { name: 'May', revenue: 5890 }, { name: 'Jun', revenue: 8390 },
        { name: 'Jul', revenue: 10490 },
    ];
    
    const revenueDataLastYear = [
        { name: 'Jan', revenue: 2000 }, { name: 'Feb', revenue: 2800 },
        { name: 'Mar', revenue: 2500 }, { name: 'Apr', revenue: 4100 },
        { name: 'May', revenue: 3950 }, { name: 'Jun', revenue: 4800 },
        { name: 'Jul', revenue: 6500 },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div variants={itemVariants}>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Welcome back, here's what's happening today.</p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4">
                    <button onClick={downloadReport} className="btn-outline flex items-center gap-2">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-dashboard/appointments')}
                        className="glass-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>New Appointment</span>
                    </button>
                </motion.div>
            </div>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients.toLocaleString()}
                    icon={Users}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                    gradientClass="bg-blue-500"
                    trend={12.5}
                    subtext="vs last month"
                    onClick={() => navigate('/admin-dashboard/patients')}
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.totalDoctors}
                    icon={UserPlus}
                    colorClass="bg-gradient-to-br from-teal-400 to-emerald-500"
                    gradientClass="bg-teal-500"
                    trend={2.1}
                    subtext="vs last month"
                    onClick={() => navigate('/admin-dashboard/doctors')}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={CreditCard}
                    colorClass="bg-gradient-to-br from-violet-500 to-purple-600"
                    gradientClass="bg-violet-500"
                    trend={18.2}
                    subtext={`${stats.pendingPayments} pending`}
                    onClick={() => navigate('/admin-dashboard/financials')}
                />
                <StatCard
                    title="Appointments"
                    value={stats.totalAppointments.toLocaleString()}
                    icon={Calendar}
                    colorClass="bg-gradient-to-br from-amber-400 to-orange-500"
                    gradientClass="bg-amber-500"
                    trend={-2.4}
                    subtext="vs last month"
                    onClick={() => navigate('/admin-dashboard/appointments')}
                />
            </div>

            {/* Charts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stunning Recharts Implementation */}
                <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Revenue Analytics</h3>
                            <p className="text-sm text-slate-500 font-medium">Monthly revenue growth</p>
                        </div>
                        <div className="mt-4 sm:mt-0 p-1 bg-slate-100 rounded-xl flex items-center">
                            {['This Year', 'Last Year'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setRevenueFilter(filter)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${revenueFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueFilter === 'This Year' ? revenueDataThisYear : revenueDataLastYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }} 
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }}
                                    tickFormatter={(val) => `$${val/1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)',
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                        padding: '16px 20px', backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                    itemStyle={{ color: '#1E293B', fontWeight: 800, fontSize: '16px' }}
                                    labelStyle={{ color: '#64748B', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#3B82F6" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#1D4ED8' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Vertical Timeline Activity Feed */}
                <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                        <button onClick={() => navigate('/admin-dashboard/appointments')} className="text-primary text-sm font-bold hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                            View All
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative pl-2">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <div className="space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                                {stats.recentActivity.map((activity, idx) => (
                                    <div key={activity._id || idx} className="relative flex items-start group">
                                        <div className="absolute left-0 mt-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white group-hover:scale-150 transition-transform duration-300 shadow-sm z-10" />
                                        <div className="ml-8 glass-panel p-4 rounded-2xl w-full border border-slate-100 hover:border-primary/20 transition-all flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {activity.patient?.name || 'New Patient'}
                                                </p>
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(activity.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                Appt with <span className="font-semibold text-primary">Dr. {activity.doctor?.name || 'Unassigned'}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <Activity className="text-slate-300" size={32} />
                                </div>
                                <p className="text-slate-800 font-bold text-lg">All caught up!</p>
                                <p className="text-sm text-slate-400 mt-1">No new activity today.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminOverview;
