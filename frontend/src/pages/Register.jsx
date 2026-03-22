import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        gender: 'Male',
        phone: ''
    });
    const { register } = useContext(AuthContext);
    const { name, email, password, role, gender, phone } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        register(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

            <div className="w-full max-w-lg p-8 glass-card animate-slide-up relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                        Create Account
                    </h2>
                    <p className="text-gray-500 mt-2">Join MedCare for better health management</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={role}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={gender}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="glass-button w-full py-3 mt-6 shadow-lg shadow-primary/30"
                    >
                        Register
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
