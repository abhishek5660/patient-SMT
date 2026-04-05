import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Search, User, X, Mail, Navigation, HeartPulse } from 'lucide-react';
import API_BASE_URL from '../../config';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', specialization: '',
        experience: '', consultationFee: ''
    });

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/admin/doctors`, config);
            setDoctors(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch doctors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this doctor from the platform?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, config);
            toast.success("Doctor deleted successfully");
            fetchDoctors();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete doctor");
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_BASE_URL}/api/admin/doctors`, newDoctor, config);
            toast.success("Doctor added successfully");
            setIsModalOpen(false);
            setNewDoctor({ name: '', email: '', password: '', specialization: '', experience: '', consultationFee: '' });
            fetchDoctors();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add doctor");
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-slate-200">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manage Doctors</h2>
                    <p className="text-slate-500 mt-1 font-medium">Oversee medical staff and add new practitioners</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors by name, email or spec..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-11 shadow-sm"
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto">
                        <UserPlus size={18} strokeWidth={2.5} />
                        <span>Add Doctor</span>
                    </button>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="glass-card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[35%]">Practitioner</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status / Spec</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {filteredDoctors.map((doc) => (
                                <motion.tr variants={itemVariants} key={doc._id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 p-0.5 shadow-sm">
                                                    <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                                                        {doc.profileImage && doc.profileImage !== 'default-profile.png' ? (
                                                            <img src={`${API_BASE_URL}${doc.profileImage.startsWith('/') ? '' : '/'}${doc.profileImage}`} alt="Doc" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <User size={24} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                    Dr. {doc.name.replace(/^Dr\.\s*/i, '')}
                                                </p>
                                                <p className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1">
                                                    <HeartPulse size={12} /> {doc.experience || 0} years experience
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Mail size={14} className="text-slate-400" /> {doc.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Navigation size={14} className="text-slate-400" /> Remote & In-person
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <span className={`badge mx-auto ${doc.specialization ? 'badge-primary' : 'badge-neutral'}`}>
                                            {doc.specialization || 'General Practice'}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(doc._id)}
                                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm rounded-xl transition-all inline-flex items-center justify-center transform hover:-translate-y-0.5"
                                            title="Remove Practitioner"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredDoctors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-700">No doctors found</p>
                                            <p className="text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Stylish Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-lg"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="glass-panel rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 sm:p-8 flex justify-between items-center bg-white/50 border-b border-slate-100">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">New Practitioner</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Add a new doctor to the platform</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-full transition-all">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddDoctor} className="p-6 sm:p-8 space-y-5 bg-white/40">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                            <input
                                                type="text" required className="input-field"
                                                value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Space</label>
                                            <input
                                                type="email" required className="input-field"
                                                value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                                placeholder="doctor@medcare.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Specialization</label>
                                            <input
                                                type="text" required className="input-field"
                                                value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                                placeholder="e.g. Cardiology"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Experience (Years)</label>
                                            <input
                                                type="number" className="input-field"
                                                value={newDoctor.experience} onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                                                placeholder="5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Consultation Fee ($)</label>
                                            <input
                                                type="number" required className="input-field"
                                                value={newDoctor.consultationFee} onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                                                placeholder="150"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Initial Password</label>
                                            <input
                                                type="password" required className="input-field"
                                                value={newDoctor.password} onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 mt-4 border-t border-slate-200/50">
                                    <button
                                        type="button" onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="glass-button flex-1 py-3 text-lg">
                                        Create Account
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

export default ManageDoctors;
