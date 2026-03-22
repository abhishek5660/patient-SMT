import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Users, Calendar, Activity, DollarSign, Clock, CheckCircle, Check, X, User } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, subtext, linkTo }) => (
    <Link to={linkTo} className="block w-full">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer relative group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            {subtext && <p className="text-xs text-gray-400 mt-4 group-hover:text-teal-600 transition-colors">{subtext}</p>}
        </div>
    </Link>
);

const DoctorOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalEarnings: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Fetch stats
            const statsRes = await axios.get(`${API_BASE_URL}/api/doctor/stats`, config);
            setStats(statsRes.data.data);

            // Fetch appointments for chart and recent list
            const apptsRes = await axios.get(`${API_BASE_URL}/api/doctor/appointments`, config);
            const appointmentsData = apptsRes.data.data;
            setAllAppointments(appointmentsData);
            
            // Get 4 most recent pending or scheduled appointments
            const recent = appointmentsData
                .filter(a => a.status === 'scheduled')
                .slice(0, 4);
            // If less than 4 pending, fill with some completed ones
            if (recent.length < 4) {
               const others = appointmentsData
                   .filter(a => a.status !== 'scheduled')
                   .slice(0, 4 - recent.length);
               recent.push(...others);
            }
            // Sort to show closest appointments first
            recent.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
            setRecentAppointments(recent);

        } catch (error) {
            console.error("Error fetching doctor dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/doctor/appointments/${id}`, { status: newStatus }, config);
            toast.success(`Appointment marked as ${newStatus}`);
            fetchData(); // Refresh data to update stats and list
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    // Calculate appointment trends for the last 7 days
    const appointmentTrends = useMemo(() => {
        if (!allAppointments.length) return [];
        
        const trends = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            // count appointments on this day
            const count = allAppointments.filter(app => {
                const appDate = new Date(app.appointmentDate);
                appDate.setHours(0,0,0,0);
                return appDate.getTime() === date.getTime();
            }).length;
            
            trends.push({ name: dateStr, appointments: count });
        }
        return trends;
    }, [allAppointments]);

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-500">Welcome back, Doctor! Here's your practice overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    subtext="Click to view all patients"
                    linkTo="/doctor-dashboard/patients"
                />
                <StatCard
                    title="Appointments"
                    value={stats.totalAppointments}
                    icon={Calendar}
                    color="bg-gradient-to-r from-teal-500 to-teal-600"
                    subtext={`${stats.pendingAppointments} Pending (Click to view)`}
                    linkTo="/doctor-dashboard/appointments"
                />
                <StatCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings}`}
                    icon={DollarSign}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    subtext="Click to view earnings"
                    linkTo="/doctor-dashboard/earnings"
                />
                <StatCard
                    title="Completed"
                    value={stats.completedAppointments}
                    icon={CheckCircle}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                    subtext="Successful consultations"
                    linkTo="/doctor-dashboard/appointments"
                />
            </div>

            {/* Charts & Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Trends */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex-shrink-0">Appointment Trends (Last 7 Days)</h3>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={appointmentTrends}>
                                <defs>
                                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', allowDecimals: false }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="appointments" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAppt)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                         <h3 className="text-lg font-bold text-gray-900">Recent Appointments</h3>
                         <Link to="/doctor-dashboard/appointments" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>
                    </div>
                    
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
                        {recentAppointments.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 min-h-[200px]">
                                <p>No recent appointments found.</p>
                            </div>
                        ) : (
                            recentAppointments.map((appt) => (
                                <div key={appt._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-teal-100 flex justify-center items-center overflow-hidden flex-shrink-0">
                                            {appt.patient?.profileImage && appt.patient.profileImage !== 'default-profile.png' ? (
                                                <img src={`${API_BASE_URL}${appt.patient.profileImage.startsWith('/') ? '' : '/'}${appt.patient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-teal-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 cursor-pointer hover:text-teal-600 transition-colors" onClick={() => navigate('/doctor-dashboard/patients', { state: { patientId: appt.patient?._id } })}>
                                                {appt.patient?.name || 'Unknown Patient'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {new Date(appt.appointmentDate).toLocaleDateString()} at {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        {appt.status === 'scheduled' ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'completed')}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors text-xs font-bold shadow-sm"
                                                    title="Mark Completed"
                                                >
                                                    <Check size={14} /> Done
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors text-xs font-bold shadow-sm"
                                                    title="Cancel"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full text-center sm:w-auto uppercase ${
                                                appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorOverview;

