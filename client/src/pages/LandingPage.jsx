import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useContext(AuthContext);

    // If already logged in, redirect to dashboard (Standard SaaS behavior)
    if (user) {
        return <Navigate to="/gigs" replace />;
    }

    return (
        <div className="min-h-screen bg-surface font-sans text-dark flex flex-col">
            {/* Header */}
            <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="text-2xl font-display font-bold text-primary-900">GigFlow</div>
                <div className="space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Login</Link>
                    <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition shadow-sm">
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-dark leading-tight">
                        Work on <span className="text-primary-600">your terms</span>.
                        <br />
                        Hire with confidence.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        The modern marketplace for top-tier freelancers.
                        Connect, collaborate, and get work done—effortlessly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition shadow hover:shadow-lg transform hover:-translate-y-0.5">
                            Start Hiring Now
                        </Link>
                        <Link to="/register" className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition shadow hover:shadow-lg transform hover:-translate-y-0.5">
                            Start Applying
                        </Link>
                    </div>
                </div>

                {/* Visual Placeholder / Social Proof */}
                <div className="mt-16 text-sm text-gray-400 font-medium uppercase tracking-wider">
                    Trusted by forward-thinking teams
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-6 text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} GigFlow. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
