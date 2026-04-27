import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${token}` }
                    };
                    const { data } = await axios.get(`${API_BASE_URL}/api/auth/profile`, config);
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success('Login successful');

            // Redirect based on role
            if (data.role === 'admin') navigate('/admin-dashboard');
            else if (data.role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/patient-dashboard');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success('Registration successful');

            // Redirect based on role
            if (data.role === 'admin') navigate('/admin-dashboard');
            else if (data.role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/patient-dashboard');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
