import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, DollarSign, Clock, Save, Camera, Briefcase, Phone, MapPin, Calendar, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gender: '',
        age: '',
        specialization: '',
        consultationFee: '',
        experience: '',
        qualifications: '',
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
            setUser(u);
            setFormData({
                name: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                address: u.address || '',
                gender: u.gender || '',
                age: u.age || '',
                specialization: u.specialization || '',
                consultationFee: u.consultationFee || '',
                experience: u.experience || '',
                qualifications: u.qualifications || '',
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
            console.error("Error fetching profile", error);
            toast.error("Failed to load profile data");
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
                // Ensure we do not send empty password if not changing
                if (key === 'password' || key === 'confirmPassword') {
                    if (key === 'password' && formData.password.trim() !== '') {
                        data.append('password', formData.password);
                    }
                    return; // Skip append otherwise
                }
                
                // Append all other fields
                data.append(key, formData[key]);
            });
            
            if (deleteProfilePic) {
                data.append('deleteProfilePicture', 'true');
            }
            if (image) data.append('profileImage', image);

            await axios.put(`${API_BASE_URL}/api/users/profile`, data, config);
            toast.success("Profile Updated Successfully!");
            
            // Clear password fields after successful update
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            fetchUser(); // Refresh data from server
        } catch (error) {
            console.error("Profile update error", error);
            const errMsg = error.response?.data?.error || "Update failed";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Profile Settings
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Manage your public profile, contact details, and security</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Section */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm p-8 rounded-[2.5rem] flex flex-col items-center sm:flex-row gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative group flex-shrink-0">
                        <div className="w-36 h-36 rounded-[2rem] overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-teal-50 to-blue-50 relative z-10 flex items-center justify-center">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={56} className="text-teal-300" />
                            )}
                        </div>
                        <div className="absolute -bottom-3 -right-3 flex gap-2 z-20">
                            <label className="p-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all shadow-md border-[3px] border-white" title="Change Photo">
                                <Camera size={20} />
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                            {preview && (
                                <button type="button" onClick={handleDeleteProfilePic} className="p-3.5 bg-rose-500 text-white rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all shadow-md border-[3px] border-white" title="Delete Photo">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left z-10">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formData.name || 'Your Name'}</h3>
                        <p className="text-teal-600 font-bold mt-1 tracking-wide">{formData.specialization || 'Specialization'}</p>
                        <p className="text-gray-500 text-sm mt-3 max-w-lg leading-relaxed font-medium">
                            Upload a professional photo to build trust with your patients. Recommended size 400x400px.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Info */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm p-8 rounded-[2.5rem]">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                <User size={20} />
                            </div>
                            Personal Information
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Age</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Clinic Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Professional Info */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm p-8 rounded-[2.5rem]">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600">
                                    <Briefcase size={20} />
                                </div>
                                Professional Details
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Specialization</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            placeholder="e.g. Cardiologist"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Fee ($)</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={formData.consultationFee}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Experience (Yrs)</label>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                            <input
                                                type="number"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Qualifications</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors">
                                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="qualifications"
                                            value={formData.qualifications}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            placeholder="e.g. MBBS, MD, FACC"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm p-8 rounded-[2.5rem]">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2.5 bg-gray-100 rounded-xl text-gray-600">
                                    <ShieldCheck size={20} />
                                </div>
                                Security Settings
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">New Password <span className="text-[10px] lowercase font-normal">(Leave blank to keep current)</span></label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Confirm New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold text-gray-700 shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md w-full sm:w-auto justify-center"
                    >
                        <Save size={20} />
                        {loading ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorProfile;
