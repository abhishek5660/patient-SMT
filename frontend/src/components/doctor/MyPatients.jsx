import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, User, FileText, Phone, MapPin, Mail, Calendar, ChevronRight, CalendarPlus, X, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const PatientDetailModal = ({ patient, onClose, navigate }) => {
    if (!patient) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 z-10 overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            {patient.profileImage && patient.profileImage !== 'default-profile.png' ? (
                                <img src={`${API_BASE_URL}${patient.profileImage.startsWith('/') ? '' : '/'}${patient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-teal-600" />
                            )}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 py-1.5 rounded-xl border border-teal-100 tracking-wide">
                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div> Active
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{patient.name}</h2>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <Calendar size={16} className="text-gray-400" /> {patient.age} Years Old
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <User size={16} className="text-gray-400" /> {patient.gender}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 border-b border-gray-100 pb-2">Contact Information</h3>
                            <div className="flex items-center gap-4 text-gray-700 font-medium">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <Phone size={18} />
                                </div>
                                {patient.phone || 'No phone number provided'}
                            </div>
                            <div className="flex items-center gap-4 text-gray-700 font-medium">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                                    <Mail size={18} />
                                </div>
                                <span className="truncate">{patient.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700 font-medium">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <span className="break-words">{patient.address || 'No address provided'}</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => navigate(`/doctor-dashboard/appointments`, { state: { patientId: patient._id, openScheduler: true } })}
                                className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-teal-600 text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition-all shadow-sm"
                            >
                                <CalendarPlus size={16} /> Schedule
                            </button>
                            <button
                                onClick={() => navigate(`/doctor-dashboard/prescriptions`, { state: { patientId: patient._id } })}
                                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <FileText size={16} /> Prescribe
                            </button>
                            <button
                                onClick={() => navigate(`/doctor-dashboard/reports`, { state: { patientId: patient._id } })}
                                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                            >
                                <Activity size={16} /> Records
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const PatientCard = ({ patient, navigate, onSelect }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group relative bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-500"></div>

        <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md transition-transform group-hover:scale-105 duration-500">
                        {patient.profileImage && patient.profileImage !== 'default-profile.png' ? (
                            <img src={`${API_BASE_URL}${patient.profileImage.startsWith('/') ? '' : '/'}${patient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                        ) : (
                            <User size={36} className="text-gray-400" />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 mb-2">
                        Active Patient
                    </span>
                    <button 
                        onClick={() => navigate(`/doctor-dashboard/appointments`, { state: { patientId: patient._id, openScheduler: true } })}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-teal-100"
                        title="Schedule Appointment"
                    >
                        <CalendarPlus size={20} />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors tracking-tight truncate" title={patient.name}>{patient.name}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> {patient.age} Yrs
                    </span>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm font-semibold text-gray-500">{patient.gender}</span>
                </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors flex-shrink-0">
                        <Phone size={14} />
                    </div>
                    {patient.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors flex-shrink-0">
                        <Mail size={14} />
                    </div>
                    <span className="truncate" title={patient.email || 'N/A'}>{patient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors flex-shrink-0">
                        <MapPin size={14} />
                    </div>
                    <span className="truncate" title={patient.address || 'N/A'}>{patient.address || 'N/A'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={() => navigate(`/doctor-dashboard/prescriptions`, { state: { patientId: patient._id } })}
                    className="flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-all duration-300 shadow-sm"
                >
                    <FileText size={16} /> Prescribe
                </button>
                <button
                    onClick={() => onSelect(patient)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-300 transform active:scale-95"
                >
                    Details <ChevronRight size={16} />
                </button>
            </div>
        </div>
    </motion.div>
);

const MyPatients = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/doctor/patients`, config);
                const patientsData = res.data.data;
                setPatients(patientsData);
                
                // If navigating from Dashboard Overview with a patientId, automatically pop up the detail modal
                if (location.state?.patientId) {
                    const p = patientsData.find(p => p._id === location.state.patientId);
                    if (p) setSelectedPatient(p);
                    // We don't remove the state here so if they refresh it stays open, 
                    // or depends on how router persists it.
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load patients");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [location.state?.patientId]);

    // Fixed filtered patients logic - previously it heavily masked results because of location.state
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Patients</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and monitor your patient profiles</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[1.5rem] shadow-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Patients Grid */}
            <div>
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold tracking-wide text-xs">Loading Patients...</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="popLayout">
                            {filteredPatients.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-24 text-center border border-white/60"
                                >
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                                            <User size={40} className="text-gray-300" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">No patients found</p>
                                        <p className="text-gray-500 mt-2 font-medium">Try adjusting your search terms to find your patients.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                    layout
                                >
                                    {filteredPatients.map((patient) => (
                                        <PatientCard 
                                            key={patient._id} 
                                            patient={patient} 
                                            navigate={navigate} 
                                            onSelect={(p) => setSelectedPatient(p)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Patient Detail Modal Overlay */}
            <AnimatePresence>
                {selectedPatient && (
                    <PatientDetailModal
                        patient={selectedPatient}
                        onClose={() => setSelectedPatient(null)}
                        navigate={navigate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyPatients;
