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

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, subtext }) => (
    <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group cursor-pointer">
        <div className={`absolute -right-8 -top-8 w-32 h-32 ${gradientClass} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out`} />
        
        <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-1">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
            <p className="text-xs font-medium text-slate-400">{subtext}</p>
        </div>
    </motion.div>
);

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) return;
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
            fetchAppointments();
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

    const stats = {
        total: appointments.length,
        today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
        pending: appointments.filter(a => a.status === 'scheduled').length,
        completed: appointments.filter(a => a.status === 'completed').length
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-slate-200">
                <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Appointment Console</h2>
                    <p className="text-slate-500 mt-1 font-medium">Managing {filteredAppointments.length} matching appointments</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-11 shadow-sm"
                        />
                    </div>

                    <div className="relative min-w-[180px] group">
                        <Filter className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field pl-11 shadow-sm cursor-pointer appearance-none text-slate-600 font-semibold"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </motion.div>
            </div>

            {/* Premium Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Requests" value={stats.total} icon={Activity}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600" gradientClass="bg-blue-500"
                    subtext="All time appointments"
                />
                <StatCard
                    title="Today's Bookings" value={stats.today} icon={CalendarDays}
                    colorClass="bg-gradient-to-br from-emerald-400 to-teal-500" gradientClass="bg-emerald-500"
                    subtext="Scheduled for today"
                />
                <StatCard
                    title="Pending Action" value={stats.pending} icon={Clock}
                    colorClass="bg-gradient-to-br from-amber-400 to-orange-500" gradientClass="bg-amber-500"
                    subtext="Awaiting completion"
                />
                <StatCard
                    title="Successful visits" value={stats.completed} icon={CheckCircle}
                    colorClass="bg-gradient-to-br from-violet-500 to-purple-600" gradientClass="bg-violet-500"
                    subtext="Completed appointments"
                />
            </div>

            {/* Premium Appointments Table */}
            <motion.div variants={itemVariants} className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest content-center">Time & Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Specialist</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appt) => (
                                    <motion.tr variants={itemVariants} key={appt._id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 shadow-sm border border-white group-hover:scale-105 transition-transform">
                                                    <Calendar size={20} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-800">
                                                        {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-primary text-xs font-bold flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                                                        <Clock size={12} />
                                                        {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                                <span className="font-bold text-slate-800">{appt.patient?.name || 'Unknown Patient'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-white shadow-sm">
                                                    <Stethoscope size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">Dr. {appt.doctor?.name || 'Unassigned'}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                        {appt.doctor?.specialization || 'General'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm border
                                            ${appt.status === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                {appt.status === 'completed' ? <CheckCircle size={14} /> :
                                                    appt.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {appt.status === 'scheduled' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt._id, 'completed')}
                                                            title="Mark as Completed" 
                                                            className="p-2.5 bg-white border border-emerald-100 text-emerald-500 hover:text-white hover:bg-emerald-500 shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                        >
                                                            <CheckCircle size={16} strokeWidth={2.5}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                                            title="Cancel Appointment" 
                                                            className="p-2.5 bg-white border border-rose-100 text-rose-400 hover:text-white hover:bg-rose-500 shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                        >
                                                            <XCircle size={16} strokeWidth={2.5}/>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                <AlertCircle className="text-slate-400" size={28} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700">No appointments found</h3>
                                            <p className="text-sm">Try changing your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminAppointments;
