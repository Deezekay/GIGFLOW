import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Validation definitions
    const validations = {
        length: formData.password.length >= 8,
        number: /\d/.test(formData.password),
        special: /[@$!%*?&]/.test(formData.password),
    };

    const isPasswordValid = validations.length && validations.number && validations.special;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError('Please meet all password requirements.');
            return;
        }

        try {
            const res = await api.post('/auth/register', formData);
            login(res.data);
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            const msg = err.response?.data?.message || err.message || 'Registration failed';
            setError(msg);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-4 font-bold">Register</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 mb-4 border rounded"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 mb-2 border rounded"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                {/* Password Strength Indicators */}
                <div className="mb-4 text-xs text-gray-600">
                    <p>Password must have:</p>
                    <ul className="mt-1 space-y-1">
                        <li className={validations.length ? 'text-green-600 font-bold' : 'text-gray-500'}>
                            {validations.length ? '✓' : '○'} At least 8 characters
                        </li>
                        <li className={validations.number ? 'text-green-600 font-bold' : 'text-gray-500'}>
                            {validations.number ? '✓' : '○'} At least 1 number
                        </li>
                        <li className={validations.special ? 'text-green-600 font-bold' : 'text-gray-500'}>
                            {validations.special ? '✓' : '○'} At least 1 special char (@$!%*?&)
                        </li>
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={!isPasswordValid}
                    className={`w-full p-2 rounded transition ${isPasswordValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    Register
                </button>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">Login</Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
