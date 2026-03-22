import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Calendar, CheckCircle, XCircle, Clock,
    Search, Filter, CalendarDays, AlertCircle,
    User, Stethoscope, ChevronRight, Activity, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
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
        <p className="mt-4 text-xs text-gray-400 relative z-10">{subtext}</p>
    </div>
);

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/admin/appointments`, config);
            setAppointments(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status }, config);
            
            toast.success(`Appointment successfully marked as ${status}`);
            fetchAppointments(); // Refresh the table
        } catch (error) {
            console.error(error);
            toast.error("Failed to update appointment status");
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch =
            appt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats calculations
    const stats = {
        total: appointments.length,
        today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
        pending: appointments.filter(a => a.status === 'scheduled').length,
        completed: appointments.filter(a => a.status === 'completed').length
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Appointment Management
                    </h2>
                    <p className="text-gray-500 mt-1">Found {filteredAppointments.length} matching appointments</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/80"
                        />
                    </div>

                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/80 cursor-pointer appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Requests"
                    value={stats.total}
                    icon={Activity}
                    color="from-blue-500 to-blue-600"
                    subtext="All time appointments"
                />
                <StatCard
                    title="Today's Bookings"
                    value={stats.today}
                    icon={CalendarDays}
                    color="from-emerald-500 to-emerald-600"
                    subtext="Scheduled for today"
                />
                <StatCard
                    title="Pending Action"
                    value={stats.pending}
                    icon={Clock}
                    color="from-amber-500 to-amber-600"
                    subtext="Awaiting completion"
                />
                <StatCard
                    title="Successful visits"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="from-violet-500 to-violet-600"
                    subtext="Completed appointments"
                />
            </div>

            {/* Appointments Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Appointment Detail</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appt) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={appt._id}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">
                                                        {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                                <span className="font-semibold text-gray-800">{appt.patient?.name || 'Deleted User'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                                    <Stethoscope size={14} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">Dr. {appt.doctor?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                                                        {appt.doctor?.specialization || 'General Specialist'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm border
                                            ${appt.status === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                {appt.status === 'completed' ? <CheckCircle size={14} /> :
                                                    appt.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {appt.status === 'scheduled' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt._id, 'completed')}
                                                            title="Mark as Completed" 
                                                            className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                                                        >
                                                            <CheckCircle size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                                            title="Cancel Appointment" 
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="text-gray-300" size={28} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">No appointments found</h3>
                                        <p className="text-gray-500 text-sm mt-1">Try changing your filters or search term</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointments;
