import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Save, Shield, Camera, Lock, Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const AdminProfile = () => {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, config);
                setUser(res.data);
                setFormData({
                    name: res.data.name,
                    email: res.data.email
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load profile data");
            } finally {
                setFetching(false);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);

            const res = await axios.put(`${API_BASE_URL}/api/users/profile`, data, config);
            setUser(res.data.data);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-[4px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[4px] border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="max-w-5xl mx-auto space-y-8"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} className="pb-4 border-b border-slate-200">
                <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">System Account</h2>
                <p className="text-slate-500 mt-1 font-medium">Manage your administrative credentials and preferences.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Identity Card */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <div className="glass-card p-8 text-center relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        
                        <div className="relative flex flex-col items-center">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-blue-100 p-1.5 shadow-xl border border-white mb-6 relative">
                                <div className="w-full h-full rounded-[2.2rem] bg-white flex items-center justify-center overflow-hidden">
                                    <Shield size={56} className="text-primary" />
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 border-4 border-white text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                            
                            <h3 className="text-2xl font-semibold text-slate-800 tracking-tight">{formData.name || 'Admin'}</h3>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                <span className="bg-primary/10 text-primary text-[10px] font-semibold px-3 py-1 rounded-full border border-primary/20">
                                    Superuser
                                </span>
                            </div>
                            
                            <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">
                                You have full access to health records, financial reports, and personnel management.
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                            <button className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all font-bold text-sm">
                                <Lock size={18} className="text-slate-400" /> Security Log
                            </button>
                            <button className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all font-bold text-sm">
                                <Bell size={18} className="text-slate-400" /> System Notifications
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Settings Forms */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <Settings size={20} />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-800 tracking-tight">Personal Information</h4>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-[10px] font-semibold text-slate-400 pl-2">Display Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field pl-11 shadow-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-1">
                                <label className="text-[10px] font-semibold text-slate-400 pl-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@pulse.systems"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field pl-11 shadow-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                                    <div className="p-2 bg-white rounded-xl text-primary shadow-sm h-fit">
                                        <Shield size={18} />
                                    </div>
                                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                        <strong>Note:</strong> Modifying your primary email address will require re-verification. System logs will be updated to reflect this administrative change.
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary px-10 py-4 flex items-center gap-2 group"
                                >
                                    <Save size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                                    <span>{loading ? 'Saving Changes...' : 'Update Records'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Additional Security Section Placeholder */}
                    <div className="glass-card p-1">
                        <button className="w-full flex items-center justify-between p-7 hover:bg-slate-50 transition-all rounded-[1.5rem] group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                    <Lock size={22} />
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-semibold text-slate-800 tracking-tight">Security & Password</p>
                                    <p className="text-xs text-slate-500 font-bold mt-1">Last updated 12 days ago</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                <ArrowUpRight size={18} strokeWidth={2.5} />
                            </div>
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminProfile;
