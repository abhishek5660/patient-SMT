import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import {
    Calendar, Clock, MapPin, User, Search, Filter,
    Plus, X, ChevronRight, AlertCircle, CheckCircle2,
    CalendarDays, Stethoscope, MessageSquare
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    // Form State
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [reason, setReason] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [apptRes, docRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/appointments`, config),
                axios.get(`${API_BASE_URL}/api/users/doctors`, config)
            ]);

            setAppointments(apptRes.data.data);
            setDoctors(docRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/appointments/${editId}`, {
                    appointmentDate,
                    reason
                }, config);
                toast.success("Appointment Rescheduled Successfully!");
            } else {
                await axios.post(`${API_BASE_URL}/api/appointments`, {
                    doctorId: selectedDoctor,
                    appointmentDate,
                    reason
                }, config);
                toast.success("Appointment Booked Successfully!");
            }

            setShowModal(false);
            setEditMode(false);
            setEditId(null);
            fetchData();
            setSelectedDoctor('');
            setReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleOpenReschedule = (appt) => {
        setEditMode(true);
        setEditId(appt._id);
        setSelectedDoctor(appt.doctor?._id);
        setAppointmentDate(new Date(appt.appointmentDate));
        setReason(appt.reason || '');
        setShowModal(true);
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status: 'cancelled' }, config);
            toast.info("Appointment Cancelled");
            fetchData();
        } catch (error) {
            toast.error("Failed to cancel");
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        if (filter === 'upcoming') return new Date(appt.appointmentDate) > new Date() && appt.status !== 'cancelled';
        if (filter === 'past') return new Date(appt.appointmentDate) <= new Date() || appt.status === 'cancelled';
        return true;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Synchronizing your schedule...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                        My Appointments
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and schedule your clinical visits.</p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setEditMode(false);
                        setEditId(null);
                        setSelectedDoctor('');
                        setReason('');
                        setAppointmentDate(new Date());
                        setShowModal(true);
                    }}
                    className="glass-button flex items-center justify-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Book New Visit
                </motion.button>
            </div>

            {/* Premium Filter Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {['all', 'upcoming', 'past'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 capitalize whitespace-nowrap
                        ${filter === f
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white/50 text-slate-500 border border-slate-200 hover:bg-white hover:border-primary/30'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-20 glass-card border-dashed"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <CalendarDays size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">No appointments found</h3>
                            <p className="text-slate-400 mt-1">Your health journey starts here.</p>
                            <button onClick={() => setShowModal(true)} className="mt-6 text-primary font-bold hover:underline">Schedule your first visit</button>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((appt, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={appt._id}
                                className="glass-card p-6 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Dr. {appt.doctor?.name}</h3>
                                            <p className="text-xs text-primary font-bold tracking-wider">{appt.doctor?.specialization}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-primary leading-none">
                                            <span className="text-[10px] font-semibold mb-0.5 opacity-60">
                                                {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-semibold">{new Date(appt.appointmentDate).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'long' })}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {appt.reason && (
                                        <div className="flex gap-3 text-sm text-slate-600 px-1">
                                            <MessageSquare size={16} className="text-slate-300 mt-1 flex-shrink-0" />
                                            <p className="leading-relaxed font-medium line-clamp-2 italic">"{appt.reason}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    {appt.status !== 'cancelled' && appt.status !== 'completed' ? (
                                        <>
                                            <button
                                                onClick={() => handleCancel(appt._id)}
                                                className="flex-1 py-3 rounded-xl border border-rose-100 text-rose-500 text-sm font-semibold hover:bg-rose-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleOpenReschedule(appt)}
                                                className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-shadow"
                                            >
                                                Reschedule
                                            </button>
                                        </>
                                    ) : (
                                        <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-300 text-sm font-semibold cursor-not-allowed">
                                            {appt.status === 'completed' ? 'Visit Completed' : 'Appointment Cancelled'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Booking Modal Upgrade */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white relative">
                                <div>
                                    <h3 className="text-2xl font-semibold text-slate-900">{editMode ? 'Reschedule Visit' : 'Book Appointment'}</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {editMode ? 'Update your clinical schedule' : 'Choose your specialist and preferred time'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditMode(false);
                                    }}
                                    className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <form onSubmit={handleBookAppointment} className="p-4 sm:p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                        <Stethoscope size={14} className="text-primary" />
                                        {editMode ? 'Assigned Specialist' : 'Select Specialist'}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            disabled={editMode}
                                            value={selectedDoctor}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-800 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        >
                                            <option value="">Choose a specialist...</option>
                                            {doctors.map(doc => (
                                                <option key={doc._id} value={doc._id}>Dr. {doc.name} • {doc.specialization || 'General Practice'}</option>
                                            ))}
                                        </select>
                                        {!editMode && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 border-l border-slate-200 pl-3">
                                                <Search size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                            <Calendar size={14} className="text-primary" />
                                            Preferred Date
                                        </label>
                                        <DatePicker
                                            selected={appointmentDate}
                                            onChange={(date) => setAppointmentDate(date)}
                                            dateFormat="MMMM d, yyyy"
                                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-800"
                                            minDate={new Date()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                            <Clock size={14} className="text-primary" />
                                            Preferred Time
                                        </label>
                                        <DatePicker
                                            selected={appointmentDate}
                                            onChange={(date) => setAppointmentDate(date)}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={30}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-800"
                                            filterTime={(time) => {
                                                const h = time.getHours();
                                                return h >= 9 && h <= 17;
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                        <AlertCircle size={14} className="text-primary" />
                                        Reason for Visit
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary outline-none transition-all h-24 resize-none font-bold text-slate-800 placeholder:text-slate-300"
                                        placeholder="Briefly describe your symptoms or concern..."
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditMode(false);
                                        }}
                                        className="flex-1 py-4 text-slate-400 font-semibold hover:text-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-primary text-white rounded-[20px] font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {editMode ? 'Update Schedule' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyAppointments;
