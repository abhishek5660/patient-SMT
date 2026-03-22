import { DollarSign, FileText, TrendingUp, Users, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const data = [
    { name: 'Jan', appointments: 400, revenue: 2400 },
    { name: 'Feb', appointments: 300, revenue: 1398 },
    { name: 'Mar', appointments: 200, revenue: 9800 },
    { name: 'Apr', appointments: 278, revenue: 3908 },
    { name: 'May', appointments: 189, revenue: 4800 },
    { name: 'Jun', appointments: 239, revenue: 3800 },
];

const BillingAnalytics = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Financial Analytics
                </h2>
                <p className="text-gray-500 mt-1">Real-time revenue and appointment insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '$24,500', icon: DollarSign, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Total Patients', value: '1,250', icon: Users, color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', text: 'text-blue-600' },
                    { label: 'Appointments', value: '856', icon: Calendar, color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-600' },
                    { label: 'Active Invoices', value: '12', icon: FileText, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600' },
                ].map((stat, index) => (
                    <div key={index} className="glass-card p-6 flex items-start justify-between group hover:scale-[1.02] transition-transform duration-300">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg opacity-90 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                        Revenue Overview
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Users size={20} />
                        </div>
                        Appointment Statistics
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="appointments" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={40}>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
                    <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-900 uppercase font-semibold text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3].map((item) => (
                                <tr key={item} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#INV-2024-00{item}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                                JD
                                            </div>
                                            John Doe
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">Oct 24, 2024</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">$150.00</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                            Paid
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingAnalytics;
