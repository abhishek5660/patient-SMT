import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Trash2, Search, User, UserCheck, Users,
    Calendar, Mail, Phone, Download, Eye, X,
    ChevronRight, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
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

        {trend && (
            <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                    +{trend}%
                </span>
                <p className="text-xs text-gray-400">from last month</p>
            </div>
        )}
    </div>
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

    // Stats calculations
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
                        Manage Patients
                    </h2>
                    <p className="text-gray-500 mt-1">Found {filteredPatients.length} registered patients</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/80"
                        />
                    </div>
                    <button
                        onClick={exportPatientsCSV}
                        className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Download size={18} /> Export List
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.total}
                    icon={Users}
                    color="from-blue-500 to-blue-600"
                    trend={12}
                />
                <StatCard
                    title="New Registered"
                    value={stats.newThisMonth}
                    icon={UserCheck}
                    color="from-emerald-500 to-emerald-600"
                    trend={5}
                />
                <StatCard
                    title="Male Patients"
                    value={stats.male}
                    icon={User}
                    color="from-indigo-500 to-indigo-600"
                />
                <StatCard
                    title="Female Patients"
                    value={stats.female}
                    icon={User}
                    color="from-rose-500 to-rose-600"
                />
            </div>

            {/* Patients Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPatients.map((patient) => (
                                <motion.tr
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={patient._id}
                                    className="hover:bg-blue-50/30 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {patient.profileImage && patient.profileImage !== 'default-profile.png' ? (
                                                    <img src={`${API_BASE_URL}${patient.profileImage.startsWith('/') ? '' : '/'}${patient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} className="text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {patient.age || 'N/A'} yrs • {patient.gender || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                <span>{patient.email}</span>
                                            </div>
                                            {patient.phone && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span>{patient.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(patient.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => {
                                                    setSelectedPatient(patient);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Patient"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPatients.length === 0 && (
                    <div className="px-6 py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No patients found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>

            {/* Patient Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedPatient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden z-10"
                        >
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="flex flex-col sm:flex-row gap-6 -mt-12 items-end">
                                    <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                                        <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {selectedPatient.profileImage && selectedPatient.profileImage !== 'default-profile.png' ? (
                                                <img src={`${API_BASE_URL}${selectedPatient.profileImage.startsWith('/') ? '' : '/'}${selectedPatient.profileImage}`} alt="Patient" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h3>
                                        <p className="text-blue-600 font-medium">{selectedPatient.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2">
                                            Patient History <ArrowUpRight size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Personal Info</p>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Gender</span>
                                                <span className="font-bold text-gray-800 capitalize">{selectedPatient.gender || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Age</span>
                                                <span className="font-bold text-gray-800">{selectedPatient.age || 'N/A'} yrs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Contact</p>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phone</span>
                                                <span className="font-bold text-gray-800">{selectedPatient.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">System Info</p>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Registered</span>
                                                <span className="font-bold text-gray-800">{new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(selectedPatient._id)}
                                        className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManagePatients;
