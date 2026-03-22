import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import API_BASE_URL from '../../config';

const DoctorEarnings = () => {
    // Placeholder - Ideally we would have a dedicated Earnings endpoint or reuse Stats
    const [earnings, setEarnings] = useState({ total: 0, monthly: 0 });

    // Using stats endpoint to get total earnings for now
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/doctor/stats`, config);
                setEarnings({ total: res.data.data.totalEarnings, monthly: res.data.data.totalEarnings }); // Simplified
            } catch (error) {
                console.error(error);
            }
        };
        fetchEarnings();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Earnings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
                    <p className="flex items-center gap-2 text-green-100 font-medium mb-1"><DollarSign size={18} /> Total Earnings</p>
                    <h3 className="text-4xl font-bold">${earnings.total}</h3>
                    <p className="text-sm text-green-100 mt-4 opacity-80">Lifetime revenue from consultations</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="flex items-center gap-2 text-gray-500 font-medium mb-1"><Calendar size={18} /> This Month</p>
                    <h3 className="text-4xl font-bold text-gray-900">${earnings.monthly}</h3>
                    <p className="text-sm text-green-600 mt-4 font-medium flex items-center gap-1">
                        <TrendingUp size={16} /> +12% from last month
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>Detailed transaction history table coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default DoctorEarnings;
