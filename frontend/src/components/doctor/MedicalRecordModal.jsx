import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clipboard,
  Activity,
  Thermometer,
  Weight,
  Heart,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
const MedicalRecordModal = ({ patient, onClose, onRecordAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    description: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
    },
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis) return toast.error("Diagnosis is required");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${API_BASE_URL}/api/medical-records`,
        { patientId: patient._id, ...formData },
        config,
      );
      toast.success("Medical record added and patient notified!");
      if (onRecordAdded) onRecordAdded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to add medical record",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [name]: value },
    }));
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {" "}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />{" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {" "}
        {/* Header */}{" "}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100/50">
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              {" "}
              <Clipboard size={24} />{" "}
            </div>{" "}
            <div>
              {" "}
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                Clinical Note
              </h2>{" "}
              <p className="text-xs font-bold text-slate-400 mt-1">
                Patient: {patient.name}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            {" "}
            <X size={20} />{" "}
          </button>{" "}
        </div>{" "}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar"
        >
          {" "}
          <div className="space-y-8">
            {" "}
            {/* Diagnosis & Description */}{" "}
            <div className="space-y-4">
              {" "}
              <div className="space-y-2">
                {" "}
                <label className="text-xs font-semibold text-slate-400 ml-1">
                  Primary Diagnosis
                </label>{" "}
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  className="input-field !text-lg font-bold !py-4"
                  placeholder="Enter primary diagnosis..."
                  required
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="text-xs font-semibold text-slate-400 ml-1">
                  Clinical Observations
                </label>{" "}
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field min-h-[120px] resize-none !py-4 font-medium"
                  placeholder="Detailed clinical notes and observations..."
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Vital Signs Grid */}{" "}
            <div className="space-y-4">
              {" "}
              <h3 className="text-xs font-semibold text-slate-400 tracking-[0.2em] border-b border-slate-100 pb-2">
                Vital Signs
              </h3>{" "}
              <div className="grid grid-cols-2 gap-4">
                {" "}
                <div className="space-y-2">
                  {" "}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-1">
                    {" "}
                    <Activity size={14} className="text-primary" /> Blood
                    Pressure{" "}
                  </div>{" "}
                  <input
                    type="text"
                    name="bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleVitalChange}
                    className="input-field"
                    placeholder="e.g. 120/80"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-1">
                    {" "}
                    <Heart size={14} className="text-rose-500" /> Heart
                    Rate{" "}
                  </div>{" "}
                  <input
                    type="text"
                    name="heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleVitalChange}
                    className="input-field"
                    placeholder="e.g. 72 bpm"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-1">
                    {" "}
                    <Thermometer size={14} className="text-orange-500" />{" "}
                    Temperature{" "}
                  </div>{" "}
                  <input
                    type="text"
                    name="temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleVitalChange}
                    className="input-field"
                    placeholder="e.g. 98.6°F"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-1">
                    {" "}
                    <Weight size={14} className="text-emerald-500" />{" "}
                    Weight{" "}
                  </div>{" "}
                  <input
                    type="text"
                    name="weight"
                    value={formData.vitalSigns.weight}
                    onChange={handleVitalChange}
                    className="input-field"
                    placeholder="e.g. 150 lbs"
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Notification Warning */}{" "}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
              {" "}
              <AlertCircle size={18} className="text-primary mt-0.5" />{" "}
              <p className="text-xs font-bold text-primary tracking-tight leading-relaxed">
                {" "}
                Submitting this record will automatically notify the patient.
                Ensure all diagnosis details are accurate before saving.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </form>{" "}
        {/* Footer Actions */}{" "}
        <div className="p-8 pt-4 border-t border-slate-100/50 flex gap-4">
          {" "}
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1 py-4"
          >
            {" "}
            Cancel{" "}
          </button>{" "}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="glass-button flex-1 flex items-center justify-center gap-2 py-4"
          >
            {" "}
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {" "}
                <Save size={18} /> <span>Save Clinical Note</span>{" "}
              </>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
};
export default MedicalRecordModal;
