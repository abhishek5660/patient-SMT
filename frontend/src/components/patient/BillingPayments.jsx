import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    CreditCard, CheckCircle, Clock, Download, FileText,
    Search, Filter, ArrowUpRight, Wallet, Receipt, Calendar,
    CheckCircle2, AlertCircle, DollarSign, ChevronDown, ChevronUp,
    Zap, ShieldCheck, Landmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const BillingPayments = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/invoices`, config);
            setInvoices(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load invoice records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleRazorpayPayment = async (invoice) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Initiate Order on Backend
            const orderRes = await axios.post(`${API_BASE_URL}/api/payments/razorpay/order`, {
                invoiceId: invoice._id,
                amount: invoice.totalAmount - invoice.paidAmount
            }, config);

            const { order } = orderRes.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be in .env
                amount: order.amount,
                currency: order.currency,
                name: "MedCare Hospital",
                description: `Payment for Invoice #${invoice.invoiceNumber}`,
                order_id: order.id,
                handler: async (response) => {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyRes = await axios.post(`${API_BASE_URL}/api/payments/razorpay/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, config);

                        if (verifyRes.data.success) {
                            toast.success("Payment successful! Balance updated.");
                            fetchInvoices();
                        }
                    } catch (err) {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: invoice.patient?.name,
                    email: invoice.patient?.email,
                },
                theme: {
                    color: "#3b82f6"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate payment");
        }
    };

    const generateInvoicePDF = (invoice) => {
        const doc = new jsPDF();

        // Brand Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, 210, 50, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text("HEALTH PULSE", 15, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Advanced Patient Management System", 15, 32);
        doc.text("Invoice Helpline: +91 98765 43210 | billing@healthpulse.com", 15, 38);

        // Invoice Meta
        doc.setFontSize(28);
        doc.text("INVOICE", 140, 30);
        doc.setFontSize(10);
        doc.text(`#${invoice.invoiceNumber}`, 140, 38);

        // Patient & Provider Info
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("BILL TO", 15, 65);

        doc.setFont('helvetica', 'normal');
        doc.text(invoice.patient?.name || 'Patient', 15, 72);
        doc.setFontSize(10);
        doc.text(`Email: ${invoice.patient?.email}`, 15, 77);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("PAYMENT DETAILS", 120, 65);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 120, 72);
        doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate'}`, 120, 77);
        doc.text(`Status: ${invoice.status.toUpperCase()}`, 120, 82);

        // Items Table
        const tableColumn = ["Description", "Unit Cost ($)", "Tax (%)", "Amount ($)"];
        const tableRows = invoice.items.map(item => [
            item.description,
            item.amount.toFixed(2),
            "Included",
            item.amount.toFixed(2)
        ]);

        doc.autoTable({
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], fontSize: 10, halign: 'center' },
            bodyStyles: { fontSize: 9, halign: 'center' },
            columnStyles: { 0: { halign: 'left' } }
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        // Summary
        doc.setFontSize(10);
        doc.text("Subtotal:", 140, finalY);
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

        doc.text("Tax (GST 5%):", 140, finalY + 7);
        doc.text(`$${invoice.tax.toFixed(2)}`, 190, finalY + 7, { align: 'right' });

        doc.setDrawColor(200, 200, 200);
        doc.line(140, finalY + 12, 195, finalY + 12);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text("TOTAL:", 140, finalY + 22);
        doc.text(`$${invoice.totalAmount.toFixed(2)}`, 190, finalY + 22, { align: 'right' });

        if (invoice.paidAmount > 0) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("Amount Paid:", 140, finalY + 30);
            doc.text(`-$${invoice.paidAmount.toFixed(2)}`, 190, finalY + 30, { align: 'right' });

            doc.setTextColor(invoice.totalAmount - invoice.paidAmount <= 0 ? [10, 190, 110] : [220, 38, 38]);
            doc.text("Balance Due:", 140, finalY + 37);
            doc.text(`$${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}`, 190, finalY + 37, { align: 'right' });
        }

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text("This is a computer generated invoice and does not require a physical signature.", 105, 280, { align: 'center' });
        doc.text("Thank you for choosing Health Pulse - Your trusted healthcare partner.", 105, 285, { align: 'center' });

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    const stats = {
        total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paid: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        pending: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs animate-pulse">Synchronizing Ledgers...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-12">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tight">
                        Billing & Invoices
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Manage your medical expenses and settle balances instantly.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <button className="glass-button !bg-white !text-slate-700 border border-slate-200">
                        Payment History
                    </button>
                    <button className="glass-button">
                        Download All
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Billed', value: stats.total, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-500/10', delay: 0 },
                    { label: 'Settled Amount', value: stats.paid, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', delay: 0.1 },
                    { label: 'Due Balance', value: stats.pending, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-500/10', delay: 0.2 },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stat.delay }}
                        className="glass-card p-8 relative overflow-hidden group"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.color.replace('text', 'bg')} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                <stat.icon size={32} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-semibold text-slate-900 tracking-tight mt-1">${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
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
                        placeholder="Search by Invoice # or Doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 md:w-48 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Interactive Invoice List */}
            <div className="space-y-6">
                <AnimatePresence mode='popLayout'>
                    {filteredInvoices.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card p-20 text-center"
                        >
                            <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">No invoices found matching your criteria</p>
                        </motion.div>
                    ) : (
                        filteredInvoices.map((inv, index) => (
                            <motion.div
                                key={inv._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card overflow-hidden transition-all duration-300 ${expandedInvoice === inv._id ? 'ring-2 ring-primary/20 shadow-2xl' : 'hover:shadow-lg'}`}
                            >
                                <div
                                    onClick={() => setExpandedInvoice(expandedInvoice === inv._id ? null : inv._id)}
                                    className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <Receipt size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-semibold text-slate-800 tracking-tight">#{inv.invoiceNumber}</h4>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                                                    ${inv.status === 'paid' ? 'bg-emerald-500 text-white' :
                                                        inv.status === 'partial' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium mt-1">
                                                By {inv.doctor?.name ? `Dr. ${inv.doctor.name}` : 'Hospital Admin'} • {new Date(inv.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-slate-400">Total Amount</p>
                                            <p className="text-2xl font-semibold text-slate-900">${inv.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {expandedInvoice === inv._id ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedInvoice === inv._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-slate-50/50"
                                        >
                                            <div className="p-8 space-y-8">
                                                {/* Breakdown Table */}
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                                        <FileText size={14} /> Fee Breakdown
                                                    </h5>
                                                    <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto shadow-sm">
                                                        <table className="w-full text-left min-w-[300px]">
                                                            <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
                                                                <tr>
                                                                    <th className="px-6 py-4">Description</th>
                                                                    <th className="px-6 py-4 text-right">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {inv.items.map((item, i) => (
                                                                    <tr key={i} className="text-sm font-medium text-slate-600">
                                                                        <td className="px-6 py-4">{item.description}</td>
                                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">${item.amount.toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                                <tr className="bg-slate-50/50 text-sm font-bold text-slate-900">
                                                                    <td className="px-6 py-4">Tax (Included GST/Service Tax)</td>
                                                                    <td className="px-6 py-4 text-right">${inv.tax.toFixed(2)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Payment Actions */}
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-slate-400">Paid so far: <span className="text-emerald-500">${inv.paidAmount.toLocaleString()}</span></p>
                                                        <p className="text-xl font-semibold text-slate-800">Remaining Balance: <span className="text-rose-500">${(inv.totalAmount - inv.paidAmount).toLocaleString()}</span></p>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                        <button
                                                            onClick={() => generateInvoicePDF(inv)}
                                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all shadow-sm"
                                                        >
                                                            <Download size={18} /> Receipt
                                                        </button>
                                                        {inv.status !== 'paid' && (
                                                            <button
                                                                onClick={() => handleRazorpayPayment(inv)}
                                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                <Landmark size={18} /> Pay With UPI / Card
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BillingPayments;
