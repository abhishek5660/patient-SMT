import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Trash2, Search, User, UserCheck, Users,
    Calendar, Mail, Phone, Download, Eye, X,
    ArrowUpRight, Activity, CalendarDays, Key
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

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, trend }) => (
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

        {trend !== undefined && (
            <div className="mt-6 flex items-center gap-2">
                <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <span>{trend > 0 ? '+' : ''}{trend}%</span>
                </div>
                <p className="text-xs font-medium text-slate-400">from last month</p>
            </div>
        )}
    </motion.div>
);

const ManagePatients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/admin/patients`, config);
            setPatients(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch patients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, config);
            toast.success("Patient deleted successfully");
            fetchPatients();
            if (selectedPatient?._id === id) setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete patient");
        }
    };

    const exportPatientsCSV = () => {
        const filtered = patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filtered.length === 0) {
            toast.info("No data to export");
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Gender', 'Age', 'Joined Date'];
        const csvContent = [
            headers.join(','),
            ...filtered.map(p => [
                `"${p.name}"`,
                p.email,
                p.phone || 'N/A',
                p.gender || 'N/A',
                p.age || 'N/A',
                new Date(p.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `patients-list-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Patient list exported");
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: patients.length,
        newThisMonth: patients.filter(p => {
            const date = new Date(p.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
        male: patients.filter(p => p.gender?.toLowerCase() === 'male').length,
        female: patients.filter(p => p.gender?.toLowerCase() === 'female').length
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-slate-200">
                <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Patient Directory</h2>
                    <p className="text-slate-500 mt-1 font-medium">Viewing {filteredPatients.length} registered patients</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search patients by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-11 shadow-sm"
                        />
                    </div>
                    <button onClick={exportPatientsCSV} className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto">
                        <Download size={18} strokeWidth={2.5} /> <span>Export CSV</span>
                    </button>
                </motion.div>
            </div>

            {/* Premium StatGrid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients" value={stats.total} icon={Users}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600" gradientClass="bg-blue-500" trend={12}
                />
                <StatCard
                    title="New Profiles" value={stats.newThisMonth} icon={UserCheck}
                    colorClass="bg-gradient-to-br from-emerald-400 to-teal-500" gradientClass="bg-emerald-500" trend={5}
                />
                <StatCard
                    title="Male Patients" value={stats.male} icon={User}
                    colorClass="bg-gradient-to-br from-violet-500 to-purple-600" gradientClass="bg-violet-500"
                />
                <StatCard
                    title="Female Patients" value={stats.female} icon={User}
                    colorClass="bg-gradient-to-br from-rose-400 to-pink-500" gradientClass="bg-rose-500"
                />
            </div>

            {/* Patients Table */}
            <motion.div variants={itemVariants} className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[35%]">Patient Details</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Registered</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {filteredPatients.map((patient) => (
                                <motion.tr variants={itemVariants} key={patient._id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                                                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                                                    {patient.profileImage && patient.profileImage !== 'default-profile.png' ? (
                                                        <img src={`${API_BASE_URL}${patient.profileImage.startsWith('/') ? '' : '/'}${patient.profileImage}`} alt="Patient" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <User size={24} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}>
                                                    {patient.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${patient.gender === 'Female' ? 'bg-rose-50 text-rose-600' : patient.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        {patient.gender || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">{patient.age || '--'} yrs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Mail size={14} className="text-slate-400" /> <span className="truncate">{patient.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Phone size={14} className="text-slate-400" /> <span>{patient.phone || 'No phone provided'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                            <CalendarDays size={16} className="text-slate-400" />
                                            {new Date(patient.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                                                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                title="View Details"
                                            >
                                                <Eye size={16} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient._id)}
                                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                title="Delete Patient"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPatients.length === 0 && (
                    <div className="px-6 py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                <Search size={24} className="text-slate-400" />
                            </div>
                            <p className="text-lg font-bold text-slate-700">No patients found</p>
                            <p className="text-sm">Try adjusting your search criteria or clear filters.</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Premium Patient Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedPatient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="glass-panel rounded-[32px] w-full max-w-3xl relative overflow-hidden z-10 shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header with Abstract Pattern */}
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden shrink-0">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                                <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
                                
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1 -mt-12 relative z-10">
                                <div className="flex flex-col sm:flex-row gap-6 items-end mb-8 pt-2">
                                    <div className="w-28 h-28 rounded-[1.5rem] bg-white p-1.5 shadow-xl shrink-0 border border-slate-100">
                                        <div className="w-full h-full rounded-[1.2rem] bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {selectedPatient.profileImage && selectedPatient.profileImage !== 'default-profile.png' ? (
                                                <img src={`${API_BASE_URL}${selectedPatient.profileImage.startsWith('/') ? '' : '/'}${selectedPatient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{selectedPatient.name}</h3>
                                        <p className="text-primary font-bold mt-1 flex items-center gap-2">
                                            {selectedPatient.email}
                                        </p>
                                    </div>
                                    <div className="pb-2">
                                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold tracking-wide hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
                                            Full History <ArrowUpRight size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Medical & Personal Details */}
                                    <div className="space-y-6">
                                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Activity size={18} className="text-emerald-500" />
                                                <p className="text-sm font-bold text-slate-800 tracking-wide uppercase">Patient Info</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                    <span className="text-slate-500 font-medium">Biological Sex</span>
                                                    <span className="font-bold text-slate-800 capitalize bg-slate-100 px-3 py-1 rounded-lg">{selectedPatient.gender || 'Not Specified'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                    <span className="text-slate-500 font-medium">Age / DOB</span>
                                                    <span className="font-bold text-slate-800">{selectedPatient.age || '--'} Years Old</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact & System Details */}
                                    <div className="space-y-6">
                                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Key size={18} className="text-blue-500" />
                                                <p className="text-sm font-bold text-slate-800 tracking-wide uppercase">System Record</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                    <span className="text-slate-500 font-medium">Contact Phone</span>
                                                    <span className="font-bold text-slate-800">{selectedPatient.phone || 'Unavailable'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                    <span className="text-slate-500 font-medium">Joined Platform</span>
                                                    <span className="font-bold text-slate-800">{new Date(selectedPatient.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-between items-center">
                                    <p className="text-xs font-bold text-slate-400 tracking-wider">USER ID: {selectedPatient._id}</p>
                                    <button
                                        onClick={() => handleDelete(selectedPatient._id)}
                                        className="text-rose-500 hover:text-white hover:bg-rose-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors border border-rose-100 hover:border-rose-500"
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} /> Remove Patient Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManagePatients;
