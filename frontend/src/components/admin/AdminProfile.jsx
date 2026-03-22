import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Save, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const AdminProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, config);
            setFormData({
                name: res.data.name,
                email: res.data.email
            });
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Currently reusing general profile update. 
            // If admin needs special fields, backend should be updated.
            // For now, updating Name/Email is standard.
            // Since our backend expects FormData for profile image updates, we might need to adjust or keep it simple.
            // Let's assume generic profile update works for non-file data too or use json.
            // Actually the current backend profile update expects FormData if image is involved, 
            // but let's try standard JSON for text-only updates if supported, or form-data.

            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);

            await axios.put(`${API_BASE_URL}/api/users/profile`, data, config);
            toast.success("Admin Profile Updated");
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">System Administrator</h3>
                        <p className="text-gray-500">Superuser Privileges</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gray-900 text-white w-full py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
