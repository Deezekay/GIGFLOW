import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Note: In real app, we might need to handle reconnection or auth explicitly if cookie isn't sent automatically in handshake for some versions,
        // but withCredentials: true in axios usually handles cookies for HTTP.
        // For Socket.io v4 client, it doesn't automatically send cookies unless configured.
        // But the browser handles sending cookies to the same domain/origin or if configured.
        // Here we are cross-origin so we need withCredentials.

        const socket = io(import.meta.env.VITE_API_BASE_URL, {
            withCredentials: true
        });

        socket.on('connect_error', (err) => {
            console.error('Socket error:', err.message);
        });

        socket.on('notification', (data) => {
            setNotifications(prev => [data, ...prev]);
            // You have been hired for <Gig Title>
        });

        return () => socket.disconnect();
    }, [user]);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Notifications</h2>
                {notifications.length === 0 ? (
                    <p className="text-gray-500">No new notifications.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notif, idx) => (
                            <li key={idx} className="p-3 bg-blue-50 text-blue-800 rounded">
                                {notif.message}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
