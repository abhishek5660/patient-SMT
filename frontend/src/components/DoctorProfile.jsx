import { User, Star, Clock, MapPin, Phone } from 'lucide-react';

const DoctorProfile = ({ doctor }) => {
    // If no doctor passed, show placeholder or loading
    if (!doctor) return <div className="text-center p-4">Select a doctor to view profile</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header / Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

            <div className="px-6 pb-6 mt-12 relative text-center sm:text-left">
                {/* Avatar */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 sm:left-6 sm:translate-x-0">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center overflow-hidden">
                        <User size={64} className="text-gray-400" />
                        {/* <img src={doctor.avatar} alt={doctor.name} /> */}
                    </div>
                </div>

                <div className="sm:pl-40 pt-2">
                    <h1 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h1>
                    <p className="text-blue-600 font-medium">{doctor.specialization || 'General Practitioner'}</p>

                    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-gray-900">4.8</span>
                            <span>(120 Reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>Central Hospital, NY</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>10+ Years Exp.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-t border-gray-100">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Dr. {doctor.name} is a dedicated specialist with over a decade of experience in treating complex medical conditions.
                            Committed to providing personalized care and checking the latest treatments.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Cardiology', 'Neurology', 'General Surgery'].map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 h-fit">
                    <h3 className="font-bold text-gray-900 mb-4">Contact Info</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-3 text-gray-600">
                            <Phone size={18} className="text-blue-500" />
                            <span>+1 (555) 123-4567</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <Clock size={18} className="text-blue-500" />
                            <span>Mon - Fri: 09:00 AM - 05:00 PM</span>
                        </li>
                    </ul>
                    <button className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
