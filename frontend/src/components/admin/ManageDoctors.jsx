import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, Search, User, X } from 'lucide-react';
import API_BASE_URL from '../../config';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        consultationFee: ''
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
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
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

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading doctors...</div>;

    return (
        <div className="space-y-8 animate-fade-in text-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Manage Doctors
                    </h2>
                    <p className="text-gray-500 mt-1">Oversee and manage your medical staff</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/80"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <UserPlus size={20} /> <span className="sm:hidden md:inline">Add Doctor</span>
                    </button>
                </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDoctors.map((doc) => (
                                <tr key={doc._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                                {doc.profileImage && doc.profileImage !== 'default-profile.png' ? (
                                                    <img src={`${API_BASE_URL}${doc.profileImage.startsWith('/') ? '' : '/'}${doc.profileImage}`} alt="Doc" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{doc.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">Exp: {doc.experience || 0} yrs</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                            {doc.specialization || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{doc.email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(doc._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Doctor"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredDoctors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search size={40} className="text-gray-200" />
                                            <p>No doctors found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {filteredDoctors.map((doc) => (
                    <div key={doc._id} className="glass-card p-5 flex flex-col gap-4 animate-slide-up">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-blue-600 shadow-sm overflow-hidden">
                                {doc.profileImage && doc.profileImage !== 'default-profile.png' ? (
                                    <img src={`${API_BASE_URL}${doc.profileImage.startsWith('/') ? '' : '/'}${doc.profileImage}`} alt="Doc" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={28} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{doc.name}</h3>
                                <p className="text-sm text-blue-600 font-medium">{doc.specialization || 'General'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Experience</p>
                                <p className="font-semibold text-gray-900">{doc.experience || 0} Years</p>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Actions</p>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="text-red-500 hover:text-red-600 font-medium text-xs flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                        <div className="px-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                            <p className="font-medium text-gray-700 truncate">{doc.email}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Doctor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Add New Doctor</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddDoctor} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={newDoctor.name}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    value={newDoctor.email}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                    placeholder="doctor@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    value={newDoctor.password}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={newDoctor.specialization}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                        placeholder="Cardiology"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (Yrs)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={newDoctor.experience}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee ($)</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={newDoctor.consultationFee}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                                    placeholder="50"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="glass-button flex-1 py-3"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDoctors;
