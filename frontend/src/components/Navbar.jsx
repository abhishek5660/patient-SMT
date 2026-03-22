import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-tr from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/30">
                            <User className="text-white w-5 h-5" />
                        </div>
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary">
                            MedCare
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-md">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm hidden sm:block">{user.name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
