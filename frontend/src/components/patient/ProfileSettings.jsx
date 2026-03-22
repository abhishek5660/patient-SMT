import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User, Mail, Phone, MapPin, Save, Camera,
    ShieldAlert, Fingerprint, Calendar, Info, 
    Droplets, CalendarDays, Lock, ShieldCheck, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config';

const ProfileSettings = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        age: '',
        gender: '',
        dob: '',
        bloodGroup: '',
        emergencyName: '',
        emergencyPhone: '',
        password: '',
        confirmPassword: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [deleteProfilePic, setDeleteProfilePic] = useState(false);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, config);
            const u = res.data;
            setFormData({
                name: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                address: u.address || '',
                age: u.age || '',
                gender: u.gender || 'Male',
                dob: u.dob ? u.dob.split('T')[0] : '', // Extract YYYY-MM-DD
                bloodGroup: u.bloodGroup || '',
                emergencyName: u.emergencyContact?.name || '',
                emergencyPhone: u.emergencyContact?.phone || '',
                password: '',
                confirmPassword: ''
            });
            if (u.profileImage && u.profileImage !== 'default-profile.png') {
                setPreview(`${API_BASE_URL}${u.profileImage.startsWith('/') ? '' : '/'}${u.profileImage}`);
            } else {
                setPreview(null);
            }
            setDeleteProfilePic(false);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setDeleteProfilePic(false);
        }
    };

    const handleDeleteProfilePic = () => {
        setPreview(null);
        setImage(null);
        setDeleteProfilePic(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Password Validation
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'emergencyName' || key === 'emergencyPhone') return;
                
                // Password logic
                if (key === 'password' || key === 'confirmPassword') {
                    if (key === 'password' && formData.password.trim() !== '') {
                        data.append('password', formData.password);
                    }
                    return;
                }
                
                data.append(key, formData[key]);
            });

            data.append('emergencyContact[name]', formData.emergencyName);
            data.append('emergencyContact[phone]', formData.emergencyPhone);

            if (deleteProfilePic) {
                data.append('deleteProfilePicture', 'true');
            }
            if (image) data.append('profileImage', image);

            await axios.put(`${API_BASE_URL}/api/users/profile`, data, config);
            toast.success("Profile updated successfully!");
            
            // Clear password fields after successful update
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            fetchUser(); // Refresh server data
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Accessing profile data...</p>
        </div>
    );

    return (
        <div className="max-w-5xl space-y-10 pb-12 mx-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                    Profile Settings
                </h2>
                <p className="text-slate-500 font-medium mt-1">Manage your digital health identity and preferences.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-10 flex flex-col items-center md:flex-row gap-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl relative z-10">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 flex flex-col gap-2 z-20">
                            <label className="p-3 bg-primary text-white rounded-2xl cursor-pointer hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 border-[3px] border-white flex items-center justify-center" title="Change Photo">
                                <Camera size={24} />
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                            {preview && (
                                <button type="button" onClick={handleDeleteProfilePic} className="p-3 bg-rose-500 text-white rounded-2xl cursor-pointer hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30 hover:scale-110 active:scale-95 border-[3px] border-white flex items-center justify-center" title="Delete Photo">
                                    <Trash2 size={24} />
                                </button>
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20 group-hover:block hidden"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{formData.name || 'Your Name'}</h3>
                        <p className="text-primary font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                            <Fingerprint size={16} />
                            ID: PX-{Math.floor(Math.random() * 100000)}
                        </p>
                        <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-md font-medium">
                            Your profile picture will be visible to your doctors and clinic staff.
                            Supported formats: JPG, PNG (Max 5MB).
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Info size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Essential Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} className="text-primary" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="input-field"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail size={14} className="text-primary" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        className="input-field"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Phone size={14} className="text-primary" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 890"
                                        className="input-field"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={14} className="text-primary" />
                                        Residential Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Street, City, Country"
                                        className="input-field"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-primary" />
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder="Years"
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-primary" />
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="input-field appearance-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <CalendarDays size={14} className="text-primary" />
                                            DOB
                                        </label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Droplets size={14} className="text-primary" />
                                            Blood Group
                                        </label>
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className="input-field appearance-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Columns 2 (Emergency + Security) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Emergency Contact */}
                        <div className="glass-card p-8 space-y-8 bg-gradient-to-br from-white to-rose-50/30">
                            <div className="flex items-center gap-3 border-b border-rose-100 pb-5">
                                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                                    <ShieldAlert size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Emergency Support</h3>
                            </div>

                            <p className="text-xs font-medium text-slate-500 italic">
                                Person we should contact in case of an medical emergency.
                            </p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-rose-400 uppercase tracking-widest">Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergencyName"
                                        value={formData.emergencyName}
                                        onChange={handleChange}
                                        placeholder="Next of Kin Name"
                                        className="input-field !bg-white/60 focus:!border-rose-300 focus:!ring-rose-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-rose-400 uppercase tracking-widest">Contact Phone</label>
                                    <input
                                        type="text"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleChange}
                                        placeholder="Emergency Hotline"
                                        className="input-field !bg-white/60 focus:!border-rose-300 focus:!ring-rose-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-white to-slate-50/50">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Security Settings</h3>
                            </div>
                            
                            <p className="text-xs font-medium text-slate-500 italic">
                                Leave fields blank to retain your current password.
                            </p>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Lock size={14} className="text-slate-500" /> 
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Lock size={14} className="text-slate-500" /> 
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end pt-4"
                >
                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-button !px-12 !py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white border-none shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 w-full md:w-auto"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        <span className="text-lg font-black uppercase tracking-tight">
                            {loading ? 'Propagating Changes...' : 'Save Profile Settings'}
                        </span>
                    </button>
                </motion.div>
            </form>
        </div>
    );
};

export default ProfileSettings;
