import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    DollarSign, Download, Plus, Search, Filter,
    Calendar, User, Receipt, TrendingUp, Wallet,
    CheckCircle, Clock, X, Trash2, PieChart, ArrowUpRight,
    Landmark, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_BASE_URL from '../../config';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, subtext }) => (
    <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group cursor-pointer">
        <div className={`absolute -right-8 -top-8 w-32 h-32 ${gradientClass} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out`} />
        
        <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-500 tracking-wider">{title}</p>
                <h3 className="text-4xl font-semibold text-slate-800 tracking-tight mt-1">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
            <p className="text-xs font-medium text-slate-400">{subtext}</p>
        </div>
    </motion.div>
);


const FinancialManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Invoice Form State
    const [formData, setFormData] = useState({
        patientId: '',
        dueDate: '',
        items: [{ description: '', amount: 0 }]
    });

    const fetchInvoices = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/invoices`, config);
            setInvoices(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load invoices");
        }
    }, []);

    const fetchPatients = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/admin/patients`, config);
            setPatients(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchInvoices(), fetchPatients()]);
            setLoading(false);
        };
        init();
    }, [fetchInvoices, fetchPatients]);

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_BASE_URL}/api/invoices`, formData, config);

            toast.success("Invoice created successfully");
            setIsModalOpen(false);
            setFormData({ patientId: '', dueDate: '', items: [{ description: '', amount: 0 }] });
            fetchInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create invoice");
        }
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', amount: 0 }] });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setFormData({ ...formData, items: newItems });
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put(`${API_BASE_URL}/api/invoices/${id}/status`, { status }, config);
            
            toast.success(`Invoice marked as ${status}`);
            fetchInvoices();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update invoice status");
        }
    };

    // Reuse PDF Generation from Patient Portal
    const downloadInvoice = (invoice) => {
        const doc = new jsPDF();
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 50, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text("HEALTH PULSE", 15, 25);
        doc.setFontSize(10);
        doc.text("ADMINISTRATION COPY", 15, 32);
        doc.text(`#${invoice.invoiceNumber}`, 140, 38);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text("BILL TO", 15, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.patient?.name || 'Patient', 15, 72);

        const tableColumn = ["Description", "Amount ($)"];
        const tableRows = invoice.items.map(item => [item.description, item.amount.toFixed(2)]);

        doc.autoTable({
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, 140, finalY);
        doc.text(`Paid Amount: $${invoice.paidAmount.toFixed(2)}`, 140, finalY + 7);
        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    };

    const stats = {
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        pendingRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
        totalBilled: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        invoiceCount: invoices.length
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-slate-200">
                <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">Financial Hub</h2>
                    <p className="text-slate-500 mt-1 font-medium">Manage hospital billing, invoices, and revenue.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center justify-center gap-2">
                        <Plus size={18} strokeWidth={2.5}/> <span>Generate Invoice</span>
                    </button>
                </motion.div>
            </div>

            {/* Premium StatGrid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp}
                    colorClass="bg-gradient-to-br from-emerald-400 to-teal-500" gradientClass="bg-emerald-500"
                    subtext="Realized collections"
                />
                <StatCard
                    title="Pending Receivables" value={`$${stats.pendingRevenue.toLocaleString()}`} icon={Clock}
                    colorClass="bg-gradient-to-br from-amber-400 to-orange-500" gradientClass="bg-amber-500"
                    subtext="Awaiting payment"
                />
                <StatCard
                    title="Gross Billing" value={`$${stats.totalBilled.toLocaleString()}`} icon={Landmark}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600" gradientClass="bg-blue-500"
                    subtext="Total invoiced value"
                />
                <StatCard
                    title="Total Issued" value={stats.invoiceCount} icon={Receipt}
                    colorClass="bg-gradient-to-br from-violet-500 to-purple-600" gradientClass="bg-violet-500"
                    subtext="All time tracking"
                />
            </div>

            {/* Controls */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search Invoice # or Patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-11 shadow-sm"
                    />
                </div>
                <div className="relative min-w-[200px] group">
                    <Filter className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field pl-11 shadow-sm cursor-pointer appearance-none text-slate-600 font-semibold"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                    </select>
                </div>
            </motion.div>

            {/* Invoice Table */}
            <motion.div variants={itemVariants} className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500">Invoice Details</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500">Date Issued</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500">Financials</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {filteredInvoices.map((inv) => (
                                <motion.tr variants={itemVariants} key={inv._id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 shadow-sm border border-white group-hover:scale-105 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-800 tracking-tight">#{inv.invoiceNumber}</p>
                                                <p className="text-xs font-bold text-slate-500 mt-0.5">{inv.patient?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-600">
                                            {new Date(inv.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-800">${inv.totalAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-primary font-bold tracking-wider mt-0.5 bg-blue-50 w-fit px-2 py-0.5 rounded-md">Paid: ${inv.paidAmount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm border
                                        ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                inv.status === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {inv.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(inv._id, 'paid')}
                                                    className="p-2.5 bg-white border border-emerald-100 text-emerald-500 hover:text-white hover:bg-emerald-500 shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle size={16} strokeWidth={2.5}/>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => downloadInvoice(inv)}
                                                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5"
                                                title="Download PDF"
                                            >
                                                <Download size={16} strokeWidth={2.5}/>
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-700">No invoices matched</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Create Invoice Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="glass-panel rounded-[32px] w-full max-w-2xl relative overflow-hidden z-10 shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <form onSubmit={handleCreateInvoice} className="flex flex-col h-full">
                                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden shrink-0">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md"
                                    >
                                        <X size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                                
                                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1 -mt-8 relative z-10">
                                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 mb-8 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-semibold text-slate-800 tracking-tight">New Issue</h3>
                                            <p className="text-slate-500 font-bold mt-1 text-sm">Generate invoice for patient.</p>
                                        </div>
                                        <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                                            <Receipt size={28} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-2">Patient Target</label>
                                                <select
                                                    required
                                                    value={formData.patientId}
                                                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                                    className="input-field shadow-sm bg-white"
                                                >
                                                    <option value="">Select Patient...</option>
                                                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-2">Due Date expected</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="input-field shadow-sm bg-white text-slate-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl mt-4">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                                <label className="text-[10px] font-bold text-slate-500">Billable Items</label>
                                                <button type="button" onClick={addItem} className="text-xs font-bold text-primary flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                                                    <Plus size={14} /> Add Line
                                                </button>
                                            </div>
                                            <div className="space-y-4 pt-2">
                                                {formData.items.map((item, index) => (
                                                    <div key={index} className="flex gap-3 items-center group">
                                                        <input
                                                            required
                                                            placeholder="Description (e.g. Consult, Lab test)"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-primary rounded-xl text-sm font-bold outline-none shadow-sm transition-all"
                                                        />
                                                        <input
                                                            required
                                                            type="number"
                                                            placeholder="$ 0.00"
                                                            value={item.amount || ''}
                                                            onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                            className="w-28 px-4 py-3 bg-white border border-slate-200 focus:border-primary rounded-xl text-sm font-bold outline-none shadow-sm text-right transition-all"
                                                        />
                                                        {formData.items.length > 1 && (
                                                            <button type="button" onClick={() => removeItem(index)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400">Projected Total</p>
                                            <p className="text-3xl font-semibold text-slate-800 tracking-tight">
                                                ${formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-primary px-8"
                                        >
                                            Submit Request
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FinancialManagement;
