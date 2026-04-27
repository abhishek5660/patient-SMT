import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, Download, Pill, Calendar, Search, Filter,
    User, Clipboard, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../../config';

const MyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/api/prescriptions`, config);
                setPrescriptions(res.data.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load prescriptions");
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    const downloadPDF = (script) => {
        try {
            const doc = new jsPDF();

            // Header Color & Branding
            doc.setFillColor(59, 130, 246); // Primary Blue
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.text('HealthCare Portal - Digital Prescription System', 105, 30, { align: 'center' });

            // Doctor & Patient Info
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('DOCTOR DETAILS', 15, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Dr. ${script.doctor?.name || 'N/A'}`, 15, 62);
            doc.setFontSize(10);
            doc.text(`${script.doctor?.specialization || 'General Physician'}`, 15, 67);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PRESCRIPTION DATE', 140, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`${new Date(script.date).toLocaleDateString()}`, 140, 62);

            // Medicine Table
            const tableData = script.medicines.map(med => [
                med.name,
                med.dosage,
                med.frequency,
                med.duration
            ]);

            autoTable(doc, {
                startY: 80,
                head: [['Medicine Name', 'Dosage', 'Frequency', 'Duration']],
                body: tableData,
                headStyles: { fillColor: [59, 130, 246] },
                alternateRowStyles: { fillColor: [240, 248, 255] },
            });

            // Notes
            if (script.notes) {
                const finalY = doc.lastAutoTable.finalY + 15;
                doc.setFont('helvetica', 'bold');
                doc.text('DOCTOR NOTES:', 15, finalY);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(script.notes, 15, finalY + 7, { maxWidth: 180 });
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('This is a digitally generated prescription.', 105, 285, { align: 'center' });

            doc.save(`Prescription_${script._id.substring(0, 8)}.pdf`);
            toast.success("Prescription downloaded!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        }
    };

    const filteredPrescriptions = prescriptions.filter(script =>
        script.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.medicines.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-text-secondary animate-pulse">Fetching your prescriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-primary-dark bg-clip-text text-transparent">
                        My Prescriptions
                    </h2>
                    <p className="text-text-secondary mt-1">View and download your digital medical prescriptions</p>
                </div>
                <div className="relative w-full md:max-w-xs mt-4 md:mt-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search by doctor or medicine..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredPrescriptions.length === 0 ? (
                    <div className="col-span-full glass-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <Pill size={40} className="text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">No prescriptions found</h3>
                            <p className="text-text-secondary">You don't have any prescriptions matching your search.</p>
                        </div>
                    </div>
                ) : (
                    filteredPrescriptions.map((script) => (
                        <div key={script._id} className="glass-card group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="p-4 sm:p-6 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark shadow-sm">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">Dr. {script.doctor?.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <Clipboard size={14} className="text-slate-400" />
                                            <span>{script.doctor?.specialization}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                                        <Calendar size={12} className="text-primary" />
                                        {new Date(script.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content - Medicine List */}
                            <div className="p-6 flex-grow space-y-4 bg-white/40">
                                <h4 className="text-xs font-bold tracking-wider text-slate-400 flex items-center gap-2">
                                    <Pill size={14} /> Prescribed Medicines
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {script.medicines.map((med, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-50 hover:border-primary/20 hover:shadow-sm transition-all group/med">
                                            <div className="w-8 h-8 rounded-full bg-primary-light/50 flex items-center justify-center text-primary group-hover/med:bg-primary group-hover/med:text-white transition-colors">
                                                <small className="font-bold text-[10px]">{idx + 1}</small>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-800 text-sm">{med.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{med.dosage}</span>
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                        <Clock size={10} />
                                                        <span>{med.frequency}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] font-bold text-slate-400">{med.duration}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {script.notes && (
                                    <div className="relative mt-4 p-4 bg-warning/5 rounded-2xl border border-warning/10 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <FileText size={40} className="text-warning" />
                                        </div>
                                        <span className="block text-xs font-bold text-warning/80 mb-1">Doctor's Note</span>
                                        <p className="text-sm text-gray-700 leading-relaxed italic">"{script.notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Card Actions */}
                            <div className="p-4 sm:p-6 pt-0 mt-auto">
                                <button
                                    onClick={() => downloadPDF(script)}
                                    className="glass-button w-full flex items-center justify-center gap-2 group/btn"
                                >
                                    <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                    <span>Download Digital PDF</span>
                                </button>
                                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                    <CheckCircle2 size={12} className="text-success" />
                                    Verified Digital Prescription
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyPrescriptions;
