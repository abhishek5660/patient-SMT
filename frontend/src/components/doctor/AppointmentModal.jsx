import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Calendar, Clock, User, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const AppointmentModal = ({ isOpen, onClose, onSuccess }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPatients, setFetchingPatients] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        setFetchingPatients(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/doctor/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patients");
        } finally {
            setFetchingPatients(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const appointmentDate = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

            await axios.post(`${API_BASE_URL}/api/appointments`, {
                patientId: formData.patientId,
                appointmentDate,
                reason: formData.reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Appointment scheduled successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Schedule Appointment</h2>
                                <p className="text-sm text-gray-500">Book a new session for your patient</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={16} className="text-teal-600" /> Select Patient
                                </label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search patterns..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        required
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="">Select a patient</option>
                                        {filteredPatients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} ({p.age} yrs)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-600" /> Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.appointmentDate}
                                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Clock size={16} className="text-amber-600" /> Time
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.appointmentTime}
                                        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-rose-600" /> Reason
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Brief description of the visit..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border border-gray-100 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {loading ? 'Scheduling...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AppointmentModal;
