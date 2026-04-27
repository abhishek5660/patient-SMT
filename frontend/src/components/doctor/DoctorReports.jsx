import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, Calendar, User, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const ReportCard = ({ report }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="group relative bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden"
    >
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>

        <div className="relative z-10">
            <div className="flex items-start gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                    <FileText size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-gray-900 truncate" title={report.title}>
                        {report.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 tracking-tight">
                            Medical Report
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                    <User size={16} className="text-blue-400" />
                    <span className="truncate">Patient: {report.patient?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                    <Calendar size={16} className="text-blue-400" />
                    {new Date(report.uploadedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
            </div>

            <a
                href={`${API_BASE_URL}${report.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm group/btn"
            >
                <Eye size={18} className="transition-transform group-hover/btn:scale-110" />
                View Document
            </a>
        </div>
    </motion.div>
);

const DoctorReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/reports`, config);
                setReports(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Patient Reports</h1>
                    <p className="text-gray-500 font-medium mt-1">Review and manage clinical documentation</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[1.5rem] shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div>
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold tracking-wide text-xs">Loading Reports...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredReports.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-24 text-center border border-white/60"
                            >
                                <div className="max-w-xs mx-auto">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                                        <FileText size={40} className="text-gray-300" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">No reports found</p>
                                    <p className="text-gray-500 mt-2 font-medium">Try searching for a different patient or report title.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                layout
                            >
                                {filteredReports.map((report) => (
                                    <ReportCard key={report._id} report={report} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default DoctorReports;
