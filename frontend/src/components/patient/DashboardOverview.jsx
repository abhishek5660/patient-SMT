import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, FileText, Activity, AlertCircle, Clock,
    ChevronRight, ArrowUpRight, TrendingUp, TrendingDown,
    Heart, Droplets, Zap, User, ArrowRight, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const vitalsData = [
    { name: 'Mon', heartRate: 72, glucose: 95, bp: 120 },
    { name: 'Tue', heartRate: 75, glucose: 98, bp: 122 },
    { name: 'Wed', heartRate: 70, glucose: 92, bp: 118 },
    { name: 'Thu', heartRate: 68, glucose: 90, bp: 115 },
    { name: 'Fri', heartRate: 74, glucose: 102, bp: 125 },
    { name: 'Sat', heartRate: 71, glucose: 94, bp: 119 },
    { name: 'Sun', heartRate: 72, glucose: 96, bp: 121 },
];

const StatCard = ({ title, value, icon: Icon, color, subtext, delay, trend, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        onClick={onClick}
        className="glass-card p-4 sm:p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-[0.05] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-xs font-bold text-slate-400">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {trend && (
                        <span className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trend > 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center ${color.replace('bg-', 'text-')} shadow-sm border border-white/20`}>
                <Icon size={22} />
            </div>
        </div>
        {subtext && (
            <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                    {subtext}
                </span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
            </div>
        )}
    </motion.div>
);

const HealthChart = ({ data, dataKey, color, title, icon: Icon }) => (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
                    <Icon size={18} />
                </div>
                <h4 className="font-bold text-gray-800">{title}</h4>
            </div>
            <select className="text-[10px] font-bold bg-slate-100 border-none rounded-md px-2 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last Month</option>
            </select>
        </div>
        <div className="flex-grow min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color.includes('blue') ? '#3b82f6' : color.includes('emerald') ? '#10b981' : '#a855f7'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color.includes('blue') ? '#3b82f6' : color.includes('emerald') ? '#10b981' : '#a855f7'} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color.includes('blue') ? '#3b82f6' : color.includes('emerald') ? '#10b981' : '#a855f7'}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color-${dataKey})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        appointments: [],
        prescriptions: [],
        reports: [],
        bills: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [apptRes, preRes, repRes, billRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/appointments`, config),
                    axios.get(`${API_BASE_URL}/api/prescriptions`, config),
                    axios.get(`${API_BASE_URL}/api/reports`, config),
                    axios.get(`${API_BASE_URL}/api/payments`, config)
                ]);

                setData({
                    appointments: apptRes.data.data || [],
                    prescriptions: preRes.data.data || [],
                    reports: repRes.data.data || [],
                    bills: billRes.data.data || []
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const { appointments, prescriptions, reports, bills } = data;

    // Stats calculation
    const upcomingAppts = appointments.filter(a => a.status === 'scheduled' || a.status === 'approved').length;
    const pendingBills = bills.filter(b => b.status === 'pending');
    const totalPending = pendingBills.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

    const activityTimeline = [
        { type: 'report', title: 'New Lab report uploaded', time: '2 hours ago', icon: Activity, color: 'blue' },
        { type: 'payment', title: `Payment of $${bills.find(b => b.status === 'paid')?.amount || 50} successful`, time: 'Yesterday', icon: CheckCircle2, color: 'emerald' },
        { type: 'appointment', title: 'Health checkup completed', time: '2 days ago', icon: Calendar, color: 'purple' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Loading your health pulse...</p>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 pb-8">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl sm:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary to-primary-dark tracking-tight">
                        Health Pulse
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 font-medium flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                        Live health dashboard • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/patient-dashboard/billing')}
                        className="glass-button w-full sm:w-auto !bg-white !text-slate-700 border border-slate-200 shadow-none hover:bg-slate-50 justify-center"
                    >
                        Medical Invoices
                    </button>
                    <button
                        onClick={() => navigate('/patient-dashboard/profile')}
                        className="glass-button w-full sm:w-auto justify-center"
                    >
                        Manage Profile
                    </button>
                </div>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Upcoming Appts"
                    value={upcomingAppts}
                    icon={Calendar}
                    color="bg-blue-500"
                    subtext={upcomingAppts > 0 ? "Next visit scheduled" : "No visits scheduled"}
                    delay={100}
                    trend={+12}
                    onClick={() => navigate('/patient-dashboard/appointments')}
                />
                <StatCard
                    title="Prescriptions"
                    value={prescriptions.length}
                    icon={FileText}
                    color="bg-emerald-500"
                    subtext={`${prescriptions.length > 5 ? 'Active' : 'Recent'} dosages`}
                    delay={200}
                    onClick={() => navigate('/patient-dashboard/prescriptions')}
                />
                <StatCard
                    title="Med Reports"
                    value={reports.length}
                    icon={Zap}
                    color="bg-purple-500"
                    subtext="View latest results"
                    delay={300}
                    trend={-2}
                    onClick={() => navigate('/patient-dashboard/reports')}
                />
                <StatCard
                    title="Due Balance"
                    value={`$${totalPending}`}
                    icon={AlertCircle}
                    color="bg-orange-500"
                    subtext={`${pendingBills.length} pending invoices`}
                    delay={400}
                    onClick={() => navigate('/patient-dashboard/billing')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Vitals (Interactive Charts) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 glass-card p-4 sm:p-6 lg:p-8"
                >
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <HealthChart
                                data={vitalsData}
                                dataKey="heartRate"
                                color="bg-blue-500"
                                title="Heart Rate Vitals"
                                icon={Heart}
                            />
                        </div>
                        <div className="w-px bg-slate-100 hidden md:block"></div>
                        <div className="w-full md:w-64 space-y-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400">Avg. Glucose</span>
                                    <TrendingUp size={12} className="text-rose-500" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-800">96</span>
                                    <span className="text-xs text-slate-400">mg/dL</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400">Blood Pressure</span>
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-800">120/80</span>
                                    <span className="text-xs text-slate-400">mmHg</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/patient-dashboard/reports')}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={16} />
                                View All Reports
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Next Visit & Activity */}
                <div className="space-y-8 flex flex-col">
                    {/* Next Visit Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-4 sm:p-6 bg-gradient-to-br from-primary-dark via-primary to-blue-600 border-none relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-4 -translate-y-8 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <h2 className="text-white font-bold text-lg relative z-10 flex items-center gap-2">
                            <Clock size={20} className="text-white/60" />
                            Next Appointment
                        </h2>

                        {upcomingAppts > 0 ? (
                            <div className="mt-6 relative z-10">
                                {appointments
                                    .filter(a => a.status === 'scheduled' || a.status === 'approved')
                                    .slice(0, 1)
                                    .map(appt => (
                                        <div key={appt._id} className="space-y-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-white ring-1 ring-white/30">
                                                    <span className="text-[10px] font-semibold opacity-60">
                                                        {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-2xl font-semibold">
                                                        {new Date(appt.appointmentDate).getDate()}
                                                    </span>
                                                </div>
                                                <div className="text-white">
                                                    <p className="font-semibold text-xl leading-tight">Dr. {appt.doctor?.name}</p>
                                                    <p className="text-white/70 text-sm font-medium flex items-center gap-1 mt-1">
                                                        {appt.doctor?.specialization}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 flex items-center justify-between border-t border-white/20">
                                                <div className="flex items-center gap-1.5 text-white/80 font-bold text-xs tracking-wide">
                                                    <Clock size={14} />
                                                    {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <button
                                                    onClick={() => navigate('/patient-dashboard/appointments')}
                                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="mt-8 text-white/80 space-y-4">
                                <p className="text-sm font-medium">No upcoming appointments found. Stay ahead of your health schedule!</p>
                                <button
                                    onClick={() => navigate('/patient-dashboard/appointments')}
                                    className="w-full py-3 bg-white text-primary font-semibold rounded-xl hover:scale-[1.02] transition-transform"
                                >
                                    Book Now
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Recent activity timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-card p-4 sm:p-6 flex-grow"
                    >
                        <h4 className="text-xs font-semibold text-slate-400 mb-6 flex items-center justify-between">
                            Recent Activity
                            <button
                                onClick={() => navigate('/patient-dashboard/reports')}
                                className="text-primary hover:text-primary-dark lowercase normal-case"
                            >
                                View All
                            </button>
                        </h4>
                        <div className="space-y-6">
                            {activityTimeline.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/patient-dashboard/${item.type === 'report' ? 'reports' : item.type === 'payment' ? 'billing' : 'appointments'}`)}
                                    className="flex gap-4 group cursor-pointer"
                                >
                                    <div className={`relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-100 group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-300`}>
                                        <item.icon size={18} />
                                        {i !== activityTimeline.length - 1 && (
                                            <div className="absolute top-10 w-0.5 h-6 bg-slate-100"></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{item.title}</p>
                                        <p className="text-xs text-slate-400 font-medium">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
