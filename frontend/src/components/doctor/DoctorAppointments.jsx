import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Calendar, User, Clock, Check, X, Filter, Search,
    ChevronRight, MoreVertical, CalendarDays, CheckCircle2,
    AlertCircle, SearchCode, FileText
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentModal from './AppointmentModal';
import API_BASE_URL from '../../config';

const SummaryCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300"
    >
        <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-2xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
            </div>
            {trend && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    </motion.div>
);

const DoctorAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    date: filterDate ? filterDate.toISOString() : undefined
                }
            };
            const res = await axios.get(`${API_BASE_URL}/api/doctor/appointments`, config);
            setAppointments(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [filterStatus, filterDate]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/doctor/appointments/${id}`, { status: newStatus }, config);
            toast.success(`Appointment ${newStatus}`);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
        }
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appt =>
            appt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [appointments, searchTerm]);

    const stats = useMemo(() => {
        const today = new Date().toDateString();
        return {
            today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === today).length,
            pending: appointments.filter(a => a.status === 'scheduled').length,
            completed: appointments.filter(a => a.status === 'completed').length,
        };
    }, [appointments]);

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
                    <p className="text-gray-500 font-medium">Manage and monitor your patient visits</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAppointments}
                        className="p-2.5 text-gray-500 hover:text-teal-600 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
                        title="Refresh"
                    >
                        <Clock size={20} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                        <CalendarDays size={20} />
                        <span>Schedule New</span>
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <SummaryCard
                    title="Today's Visits"
                    value={stats.today}
                    icon={Calendar}
                    color="bg-blue-100"
                    trend="+2 today"
                />
                <SummaryCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={AlertCircle}
                    color="bg-amber-100"
                />
                <SummaryCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle2}
                    color="bg-emerald-100"
                />
            </div>

            {/* Controls Section */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient name, reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-white/80 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white/80 border border-gray-100 rounded-2xl px-3 py-1.5 shadow-sm">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-gray-700 outline-none pr-4 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="relative flex items-center bg-white/80 border border-gray-100 rounded-2xl px-3 py-1.5 shadow-sm">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <DatePicker
                                selected={filterDate}
                                onChange={(date) => setFilterDate(date)}
                                placeholderText="Filter Date"
                                className="bg-transparent text-sm font-semibold text-gray-700 outline-none w-24 cursor-pointer"
                                isClearable
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Cards List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-20 text-center shadow-xl shadow-gray-200/50 border border-white">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-medium">Fetching records...</p>
                            </div>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-20 text-center shadow-xl shadow-gray-200/50 border border-white"
                        >
                            <div className="max-w-xs mx-auto">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                    <SearchCode size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-900 font-bold">No results found</p>
                                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((appt, idx) => (
                            <motion.div
                                key={appt._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col md:flex-row items-center gap-6"
                            >
                                {/* Patient Info Group */}
                                <div className="flex items-center gap-4 min-w-[240px]">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105 duration-500">
                                            {appt.patient?.profileImage && appt.patient.profileImage !== 'default-profile.png' ? (
                                                <img src={`${API_BASE_URL}${appt.patient.profileImage.startsWith('/') ? '' : '/'}${appt.patient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={30} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors uppercase tracking-tight">{appt.patient?.name || 'Unknown'}</p>
                                        <p className="text-sm font-semibold text-gray-400">{appt.patient?.age} yrs • {appt.patient?.gender}</p>
                                    </div>
                                </div>

                                {/* Schedule & Reason */}
                                <div className="flex flex-1 flex-col md:flex-row gap-6 md:gap-12 md:items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{new Date(appt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="text-xs font-bold text-teal-600 flex items-center gap-1.5 mt-1">
                                            <Clock size={14} />
                                            {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex-1 max-w-md">
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                                            {appt.reason || 'Routine Consultation'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-[0.1em]
                                        ${appt.status === 'scheduled' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                            appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${appt.status === 'scheduled' ? 'bg-rose-500' : appt.status === 'completed' ? 'bg-emerald-600' : 'bg-gray-500'}`}></div>
                                        {appt.status === 'scheduled' ? 'PENDING' : appt.status}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {appt.status === 'scheduled' ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'completed')}
                                                    className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100 shadow-sm"
                                                    title="Mark Completed"
                                                >
                                                    <Check size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                    className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all duration-300 border border-rose-100 shadow-sm"
                                                    title="Cancel"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="relative group/menu">
                                                <button className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-teal-600 transition-all border border-gray-100 shadow-sm">
                                                    <MoreVertical size={20} />
                                                </button>
                                                <div className="absolute right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 scale-95 group-hover/menu:scale-100 origin-top-right">
                                                    <button
                                                        onClick={() => navigate(`/doctor-dashboard/patients`, { state: { patientId: appt.patient?._id } })}
                                                        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors flex items-center gap-3"
                                                    >
                                                        <User size={16} /> View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/doctor-dashboard/prescriptions`, { state: { patientId: appt.patient?._id } })}
                                                        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors flex items-center gap-3"
                                                    >
                                                        <FileText size={16} /> Issue Prescription
                                                    </button>
                                                    <div className="my-2 border-t border-gray-50"></div>
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                                                    >
                                                        <X size={16} /> Cancel Appointment
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAppointments}
            />
        </div>
    );
};

export default DoctorAppointments;
