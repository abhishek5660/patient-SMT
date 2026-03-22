import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, CreditCard, Activity, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_BASE_URL from '../../config';

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
    <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-indigo-500/20 text-white transform group-hover:rotate-12 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
            {trend !== undefined && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
            <p className="text-xs text-gray-400">{subtext}</p>
        </div>
    </div>
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

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('System Overview Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${date}`, 14, 30);

        // Stats Table
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
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Recent Activity Table
        if (stats.recentActivity && stats.recentActivity.length > 0) {
            const activityData = stats.recentActivity.map(activity => [
                new Date(activity.createdAt).toLocaleString(),
                activity.patient?.name || 'N/A',
                `Dr. ${activity.doctor?.name || 'N/A'}`,
                activity.status || 'Scheduled'
            ]);

            doc.setFontSize(14);
            doc.text('Recent Activity', 14, doc.lastAutoTable.finalY + 15);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Date/Time', 'Patient', 'Doctor', 'Status']],
                body: activityData,
                theme: 'grid',
                headStyles: { fillColor: [75, 85, 99] }
            });
        }

        doc.save(`system-report-${date.replace(/\//g, '-')}.pdf`);
    };

    // Mock data for charts
    const revenueDataThisYear = [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
        { name: 'Jul', revenue: 3490 },
    ];
    
    const revenueDataLastYear = [
        { name: 'Jan', revenue: 2000 },
        { name: 'Feb', revenue: 1800 },
        { name: 'Mar', revenue: 1500 },
        { name: 'Apr', revenue: 2100 },
        { name: 'May', revenue: 1950 },
        { name: 'Jun', revenue: 1800 },
        { name: 'Jul', revenue: 2500 },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. Here's your daily practice health check.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadReport}
                        className="glass-button bg-white text-gray-600 hover:text-blue-600 text-sm"
                    >
                        Download Report
                    </button>
                    <button 
                        onClick={() => navigate('/admin/appointments')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all text-sm font-medium"
                    >
                        + New Appointment
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    color="from-blue-500 to-blue-600"
                    trend={12.5}
                    subtext="vs last month"
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.totalDoctors}
                    icon={UserPlus}
                    color="from-teal-500 to-teal-600"
                    trend={0}
                    subtext="No change"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue}`}
                    icon={CreditCard}
                    color="from-emerald-500 to-emerald-600"
                    trend={8.2}
                    subtext={`${stats.pendingPayments} pending`}
                />
                <StatCard
                    title="Appointments"
                    value={stats.totalAppointments}
                    icon={Calendar}
                    color="from-violet-500 to-violet-600"
                    trend={-2.4}
                    subtext="vs last month"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trends */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800">Revenue Growth</h3>
                        <select 
                            value={revenueFilter}
                            onChange={(e) => setRevenueFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-1 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="This Year">This Year</option>
                            <option value="Last Year">Last Year</option>
                        </select>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueFilter === 'This Year' ? revenueDataThisYear : revenueDataLastYear}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                        <button 
                            onClick={() => navigate('/admin/appointments')}
                            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
                        >
                            View All
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[300px]">
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity) => (
                                <div key={activity._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                        <Activity size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {activity.patient?.name || 'Unknown Patient'}
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            Appointment with <span className="font-medium text-blue-600">{activity.doctor?.name || 'Unassigned'}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="text-gray-300" size={24} />
                                </div>
                                <p className="text-gray-500 font-medium">No recent activity</p>
                                <p className="text-xs text-gray-400 mt-1">New appointments will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
