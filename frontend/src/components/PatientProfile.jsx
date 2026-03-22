import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, FileText, Pill, Clock } from 'lucide-react';

const PatientProfile = ({ user }) => {
    const [stats, setStats] = useState({
        weight: '70 kg',
        bp: '120/80',
        bloodSugar: '90 mg/dL'
    });
    // Placeholder for now, ideally fetched from backend if we had a detailed HealthMetric model

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <User size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-6 w-full space-y-3">
                        <div className="flex justifying-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Blood Group</span>
                            <span className="font-semibold text-gray-800">{user?.bloodGroup || 'O+'}</span>
                        </div>
                        <div className="flex justifying-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Age</span>
                            <span className="font-semibold text-gray-800">28</span>
                        </div>
                    </div>
                </div>

                {/* Health Metrics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="text-red-500" size={20} /> Health Metrics
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Weight</span>
                                <span className="font-medium text-gray-900">{stats.weight}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 table h-2 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Blood Pressure</span>
                                <span className="font-medium text-gray-900">{stats.bp}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 w-full h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Blood Sugar</span>
                                <span className="font-medium text-gray-900">{stats.bloodSugar}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-500 table h-2 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: History & Prescriptions */}
            <div className="lg:col-span-2 space-y-6">

                {/* Tabs / Sections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="text-blue-500" size={20} /> Medical History
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900">General Checkup - Dr. Sarah</h4>
                                        <p className="text-sm text-gray-500 mb-1">Oct 24, 2024</p>
                                        <p className="text-gray-600 text-sm">Routine yearly checkup. Everything looks normal. Advised to increase water intake.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Pill className="text-purple-500" size={20} /> Prescriptions
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                                <h4 className="font-semibold text-purple-900">Amoxicillin</h4>
                                <p className="text-sm text-purple-700">500mg • 3 times daily</p>
                                <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                                    <Clock size={12} /> 5 days remaining
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                                <h4 className="font-semibold text-green-900">Vitamin D</h4>
                                <p className="text-sm text-green-700">1000 IU • Once daily</p>
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <Clock size={12} /> Ongoing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PatientProfile;
