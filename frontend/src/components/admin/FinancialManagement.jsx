import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    DollarSign, Download, Plus, Search, Filter,
    Calendar, User, Receipt, TrendingUp, Wallet,
    CheckCircle, Clock, X, Trash2, PieChart, ArrowUpRight,
    ChevronDown, ChevronUp, FileText, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_BASE_URL from '../../config';

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
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold text-xs tracking-widest uppercase">Analyzing Financials...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Financial Hub</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage hospital billing, invoices, and revenue projections.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} /> Create New Invoice
                </button>
            </div>

            {/* Advanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: stats.totalRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Pending Collections', value: stats.pendingRevenue, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Gross Billing', value: stats.totalBilled, icon: Landmark, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Total Invoices', value: stats.invoiceCount, icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="glass-card p-6 flex items-center gap-5 hover:border-slate-300 transition-colors"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 mt-2 tracking-tighter">
                                {stat.label.includes('Count') ? stat.value : `$${stat.value.toLocaleString()}`}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Smart Controls */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Invoice # or Patient Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-900/5 outline-none"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full md:w-48 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
                >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                </select>
            </div>

            {/* Invoice List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6">Invoice & Patient</th>
                                <th className="px-8 py-6">Issued Date</th>
                                <th className="px-8 py-6">Amount Details</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-4 ring-white">
                                                INV
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">#{inv.invoiceNumber}</p>
                                                <p className="text-xs text-slate-500 font-medium">{inv.patient?.name || 'Unknown Patient'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-900">${inv.totalAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Paid: ${inv.paidAmount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                                            ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                inv.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 flex items-center justify-end gap-2">
                                        {inv.status !== 'paid' && (
                                            <button
                                                onClick={() => handleUpdateStatus(inv._id, 'paid')}
                                                className="p-3 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => downloadInvoice(inv)}
                                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Download PDF"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl"
                        >
                            <form onSubmit={handleCreateInvoice} className="flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
                                <div className="p-10 pb-6 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Invoice</h3>
                                        <p className="text-slate-400 text-sm font-medium">Issue a new bill for patient services.</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Patient Selection</label>
                                            <select
                                                required
                                                value={formData.patientId}
                                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-slate-900/10 outline-none"
                                            >
                                                <option value="">Choose Patient...</option>
                                                {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Due Date</label>
                                            <input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-slate-900/10 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pl-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billable Items</label>
                                            <button type="button" onClick={addItem} className="text-xs font-black text-slate-900 flex items-center gap-1 hover:underline">
                                                <Plus size={14} /> Add Line
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.items.map((item, index) => (
                                                <div key={index} className="flex gap-3 items-center group">
                                                    <input
                                                        required
                                                        placeholder="Description (e.g. Consult, X-Ray)"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="flex-1 px-5 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none"
                                                    />
                                                    <input
                                                        required
                                                        type="number"
                                                        placeholder="$ 0.00"
                                                        value={item.amount}
                                                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                        className="w-32 px-5 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none text-right"
                                                    />
                                                    {formData.items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Grand Total</p>
                                        <p className="text-2xl font-black text-slate-900">
                                            ${formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Generate Invoice
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FinancialManagement;
