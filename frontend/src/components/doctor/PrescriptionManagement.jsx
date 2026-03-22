import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import API_BASE_URL from '../../config';

const PrescriptionManagement = () => {
    const location = useLocation();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(location.state?.patientId || '');

    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch User's Patients for the dropdown
        const fetchPatients = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/api/doctor/patients`, config);
            setPatients(res.data.data);
        };
        fetchPatients();
    }, []);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedicine = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleMedicineChange = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_BASE_URL}/api/prescriptions`, {
                patientId: selectedPatient,
                medicines,
                notes
            }, config);

            toast.success("Prescription Sent to Patient!");
            // Reset
            setSelectedPatient('');
            setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
            setNotes('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to send prescription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                    New Prescription
                </h2>
                <p className="text-gray-500 mt-1">Issue digital prescriptions to your patients</p>
            </div>

            <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="max-w-md">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Patient</label>
                        <div className="relative">
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="w-full p-4 pl-5 rounded-xl bg-white/50 border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none appearance-none"
                                required
                            >
                                <option value="">Choose a patient...</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.age}yrs, {p.gender})</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="p-1.5 bg-teal-100 rounded-lg text-teal-600">
                                        <FileText size={18} />
                                    </div>
                                    Medicines
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="flex items-center gap-1.5 text-white bg-teal-500 hover:bg-teal-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-teal-500/20"
                            >
                                <Plus size={16} /> Add Medicine
                            </button>
                        </div>

                        <div className="space-y-3">
                            {medicines.map((med, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 bg-white/60 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow relative group animate-slide-up">
                                    <div className="md:col-span-1 hidden md:flex justify-center text-teal-300 font-bold text-lg select-none">
                                        {index + 1}
                                    </div>
                                    <div className="md:col-span-4">
                                        <input
                                            placeholder="Medicine Name"
                                            value={med.name}
                                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                            className="w-full p-2.5 rounded-lg bg-transparent border-b border-gray-200 focus:border-teal-500 outline-none transition-colors font-medium placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input
                                            placeholder="Dosage (e.g., 500mg)"
                                            value={med.dosage}
                                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                            className="w-full p-2.5 rounded-lg bg-transparent border-b border-gray-200 focus:border-teal-500 outline-none transition-colors placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            placeholder="Freq (1-0-1)"
                                            value={med.frequency}
                                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                            className="w-full p-2.5 rounded-lg bg-transparent border-b border-gray-200 focus:border-teal-500 outline-none transition-colors placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <input
                                            placeholder="Days"
                                            value={med.duration}
                                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                            className="w-full p-2.5 rounded-lg bg-transparent border-b border-gray-200 focus:border-teal-500 outline-none transition-colors placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeMedicine(index)}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            disabled={medicines.length === 1}
                                            title="Remove Medicine"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white/50 border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all h-32 resize-none"
                            placeholder="Dietary advice, precautions, next visit..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {loading ? 'Issuing...' : 'Issue Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionManagement;
