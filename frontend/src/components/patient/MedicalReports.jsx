import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileBarChart, Upload, Trash2, Eye, File, Calendar, Plus, Search, Filter,
    Droplets, Activity, Skull, ClipboardList, Zap, Microscope
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const MedicalReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [imageErrors, setImageErrors] = useState({});

    // Upload State
    const [title, setTitle] = useState('');
    const [reportType, setReportType] = useState('Blood Test');
    const [file, setFile] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/reports`, config);
            setReports(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error("Please select a file");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('reportType', reportType);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

            await axios.post(`${API_BASE_URL}/api/reports`, formData, config);
            toast.success("Report Uploaded!");
            fetchReports();
            setTitle(''); // Reset
            setFile(null);
            setShowUploadModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/api/reports/${id}`, config);
            toast.success("Report deleted successfully");
            fetchReports();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'All' || report.reportType === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const getPlaceholderStyle = (type) => {
        switch (type) {
            case 'Blood Test':
                return {
                    icon: <Droplets size={48} className="text-red-500/40" />,
                    bg: 'bg-red-50',
                    gradient: 'from-red-50 to-red-100',
                    accent: 'text-red-600'
                };
            case 'X-Ray':
                return {
                    icon: <Skull size={48} className="text-slate-500/40" />,
                    bg: 'bg-slate-50',
                    gradient: 'from-slate-50 to-slate-100',
                    accent: 'text-slate-600'
                };
            case 'MRI':
                return {
                    icon: <Activity size={48} className="text-blue-500/40" />,
                    bg: 'bg-blue-50',
                    gradient: 'from-blue-50 to-blue-100',
                    accent: 'text-blue-600'
                };
            case 'Ultrasound':
                return {
                    icon: <Zap size={48} className="text-purple-500/40" />,
                    bg: 'bg-purple-50',
                    gradient: 'from-purple-50 to-purple-100',
                    accent: 'text-purple-600'
                };
            case 'Prescription Scan':
                return {
                    icon: <ClipboardList size={48} className="text-emerald-500/40" />,
                    bg: 'bg-emerald-50',
                    gradient: 'from-emerald-50 to-emerald-100',
                    accent: 'text-emerald-600'
                };
            default:
                return {
                    icon: <File size={48} className="text-primary/40" />,
                    bg: 'bg-slate-50',
                    gradient: 'from-slate-50 to-slate-100',
                    accent: 'text-primary'
                };
        }
    };

    const reportTypes = ['Blood Test', 'X-Ray', 'MRI', 'Prescription Scan', 'Ultrasound', 'Other'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-primary-dark bg-clip-text text-transparent">
                        Medical Reports
                    </h2>
                    <p className="text-text-secondary mt-1">Manage and access your medical history securely</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="glass-button flex items-center justify-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Upload Report</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-field pl-10 appearance-none"
                    >
                        <option value="All">All Types</option>
                        {reportTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-end text-sm text-text-secondary">
                    Found {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
                </div>
            </div>

            {/* Upload Modal (Simplified in-page for now) */}
            {showUploadModal && (
                <div className="glass-card p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Upload size={22} className="text-primary" />
                            Upload New Medical Report
                        </h3>
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="text-text-secondary hover:text-error transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Report Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field"
                                placeholder="e.g., Annual Checkup Report"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Report Category</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="input-field appearance-none"
                            >
                                {reportTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Choose File</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-blue-100 transition-all cursor-pointer"
                                required
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="glass-button min-w-[150px] flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span>Confirm Upload</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reports Grid */}
            {filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredReports.map((report) => {
                        const isImage = report.fileUrl.match(/\.(jpeg|jpg|png)$/i);
                        const isBroken = imageErrors[report._id];
                        const style = getPlaceholderStyle(report.reportType);

                        return (
                            <div key={report._id} className="glass-card group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col">
                                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                                    {(isImage && !isBroken) ? (
                                        <img
                                            src={`${API_BASE_URL}${report.fileUrl.startsWith('/') ? '' : '/'}${report.fileUrl}`}
                                            alt={report.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={() => handleImageError(report._id)}
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${style.gradient}`}>
                                            <div className="transform group-hover:scale-110 transition-transform duration-500">
                                                {style.icon}
                                            </div>
                                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${style.accent} opacity-60`}>
                                                {isBroken ? 'Image Not Found' : report.reportType}
                                            </span>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold rounded-full shadow-sm border border-white/50 ${style.accent}`}>
                                            {report.reportType}
                                        </span>
                                    </div>

                                    {/* Hover Actions Overlay */}
                                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-[2px] flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <a
                                            href={`${API_BASE_URL}${report.fileUrl.startsWith('/') ? '' : '/'}${report.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-white text-primary-dark rounded-full hover:bg-primary-dark hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                            title="View Report"
                                        >
                                            <Eye size={22} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            className="p-3 bg-white text-error rounded-full hover:bg-error hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                            title="Delete Report"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h4 className="font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors" title={report.title}>
                                        {report.title}
                                    </h4>
                                    <div className="mt-auto flex items-center justify-between text-xs text-text-secondary border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{new Date(report.uploadedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <FileBarChart size={32} className="text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">No reports found</h3>
                        <p className="text-text-secondary">Try adjusting your search or filters, or upload a new report.</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-primary font-bold hover:underline"
                    >
                        Upload your first report
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicalReports;
