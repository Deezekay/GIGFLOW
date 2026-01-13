import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import Register from './pages/Register';
import Login from './pages/Login';
import GigFeed from './pages/GigFeed';
import GigDetail from './pages/GigDetail';
import PostGig from './pages/PostGig';
import EditGig from './pages/EditGig';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-xl font-bold">GigFlow</Link>
            <div className="space-x-4">
                {user ? (
                    <>
                        <Link to="/gigs">Browse Jobs</Link>
                        <Link to="/dashboard">Notifications</Link>
                        <Link to="/post-gig" className="bg-pink-600 text-white px-4 py-2 rounded font-bold hover:bg-pink-700 transition">Post a Project</Link>
                        <span className="text-gray-400 pl-4 border-l border-gray-700">Hi, {user.name}</span>
                        <button onClick={logout} className="text-gray-400 hover:text-white transition text-sm">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const AppContent = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    const { user } = useContext(AuthContext);

    // Global Notification Listener
    useEffect(() => {
        if (!user) return;

        const socket = io('http://localhost:5000', {
            withCredentials: true
        });

        socket.on('notification', (data) => {
            toast.success(data.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        });

        return () => socket.disconnect();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <ToastContainer />
            {/* Hide Global NavBar on Landing Page because it has its own Header */}
            {!isLandingPage && <NavBar />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/gigs" element={<GigFeed />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/gigs/:id" element={<GigDetail />} />
                <Route path="/gigs/:id/edit" element={<ProtectedRoute><EditGig /></ProtectedRoute>} />
                <Route path="/post-gig" element={<ProtectedRoute><PostGig /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
        </div>
    );
}

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;
