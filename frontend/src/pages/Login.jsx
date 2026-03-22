import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

            <div className="w-full max-w-md p-8 glass-card animate-slide-up relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                        Welcome
                    </h2>
                    <p className="text-gray-500 mt-2">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="glass-button w-full py-3 shadow-lg shadow-primary/30"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-8">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
