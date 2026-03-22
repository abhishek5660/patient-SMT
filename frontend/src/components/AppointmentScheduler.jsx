import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import { Calendar, Clock, User as UserIcon, FileText } from 'lucide-react';

const AppointmentScheduler = ({ onSuccess }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const { data } = await axios.get(`${API_BASE_URL}/api/users/doctors`, config);
                if (data.success) {
                    setDoctors(data.data);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error("Failed to load doctors");
            }
        };
        fetchDoctors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Combine date and time
            const appointmentDate = new Date(`${date}T${time}`);

            await axios.post(`${API_BASE_URL}/api/appointments`, {
                doctorId: selectedDoctor,
                appointmentDate,
                reason
            }, config);

            toast.success('Appointment scheduled successfully!');
            setDoctors([]); // Optional: trigger re-fetch or clear form
            setSelectedDoctor('');
            setDate('');
            setTime('');
            setReason('');

            if (onSuccess) onSuccess(); // Refresh parent data
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to schedule appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8 rounded-3xl max-w-3xl mx-auto animate-slide-up relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Book an Appointment
                    </h2>
                    <p className="text-gray-500 mt-2">Schedule a visit with our top specialists</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Doctor Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <UserIcon size={18} className="text-blue-500" /> Select Specialist
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                                className="w-full p-4 pl-5 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                            >
                                <option value="">-- Choose a Doctor --</option>
                                {doctors.map(doc => (
                                    <option key={doc._id} value={doc._id}>
                                        Dr. {doc.name} - {doc.specialization || 'General'}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar size={18} className="text-purple-500" /> Preferred Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-4 rounded-xl bg-white/50 border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                            />
                        </div>

                        {/* Time Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Clock size={18} className="text-teal-500" /> Preferred Time
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="w-full p-4 rounded-xl bg-white/50 border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText size={18} className="text-orange-500" /> Reason for Visit
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows="3"
                            placeholder="Briefly describe your symptoms..."
                            className="w-full p-4 rounded-xl bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentScheduler;
