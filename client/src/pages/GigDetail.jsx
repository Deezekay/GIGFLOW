import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GigDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [gig, setGig] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [bidMessage, setBidMessage] = useState('');
    const [bids, setBids] = useState([]);
    const [contactInfo, setContactInfo] = useState(null); // NEW

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const res = await api.get(`/api/gigs/${id}`);
                setGig(res.data);

                const isMyGig = user && res.data.ownerId && (res.data.ownerId._id === user._id || res.data.ownerId === user._id);
                if (isMyGig) {
                    fetchBids();
                }

                // If assigned, try to fetch contact info (works for Owner AND Hired Freelancer)
                if (res.data.status === 'assigned') {
                    fetchContactInfo();
                }

            } catch (err) {
                console.error(err);
            }
        };
        fetchGig();
    }, [id, user]);

    const fetchContactInfo = async () => {
        try {
            const res = await api.get(`/api/gigs/${id}/contact`);
            setContactInfo(res.data);
        } catch (err) {
            // Not authorized or not part of the deal, ignore.
        }
    };

    const fetchBids = async () => {
        try {
            const res = await api.get(`/api/bids/${id}`);
            setBids(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/bids', {
                gigId: id,
                price: bidPrice,
                message: bidMessage,
            });
            toast.success('Bid submitted successfully!');
            navigate('/gigs');
        } catch (err) {
            toast.error('Failed to submit bid');
        }
    };

    const handleHire = async (bidId) => {
        try {
            await api.patch(`/api/bids/${bidId}/hire`);
            toast.success('Freelancer hired!');
            // Refresh data
            const gigRes = await api.get(`/api/gigs/${id}`);
            setGig(gigRes.data);
            fetchBids();
        } catch (error) {
            toast.error('Hire failed: ' + (error.response?.data?.message || error.message));
        }
    }

    if (!gig) return <div>Loading...</div>;

    const isOwner = user && (gig.ownerId._id === user._id || gig.ownerId === user._id);

    return (
        <div className="p-8">
            <Link to="/" className="text-gray-500 mb-4 inline-block">&larr; Back to Feed</Link>
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
                    <span className={`px-3 py-1 rounded text-sm ${gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {gig.status.toUpperCase()}
                    </span>
                </div>
                <p className="text-gray-700 text-lg mb-4">{gig.description}</p>
                <div className="text-sm text-gray-500">
                    <p className="font-bold text-green-600 text-xl mb-2">
                        Budget: ₹{gig.minBudget === gig.maxBudget ? gig.minBudget : `${gig.minBudget} - ₹${gig.maxBudget}`}
                    </p>
                    <p>Owner: {gig.ownerId.name || 'Unknown'}</p>
                </div>

                {/* NEW: Contact Info for Matches */}
                {contactInfo && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="text-blue-800 font-bold mb-2">
                            {contactInfo.role === 'owner' ? 'Hired Freelancer Contact' : 'Client Contact'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-white p-3 rounded border border-blue-100">
                            <div>
                                <span className="font-medium text-gray-900">{contactInfo.contactName}</span>
                                <span className="ml-2 text-gray-500 text-sm">({contactInfo.contactEmail})</span>
                            </div>
                            <a href={`mailto:${contactInfo.contactEmail}`} className="mt-2 sm:mt-0 text-white bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700 transition">
                                Send Email
                            </a>
                        </div>
                    </div>
                )}

                {isOwner && (
                    <>
                        <button
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this gig?')) {
                                    try {
                                        await api.delete(`/api/gigs/${gig._id}`);
                                        toast.success('Gig deleted');
                                        navigate('/gigs');
                                    } catch (err) {
                                        toast.error('Failed to delete gig');
                                    }
                                }
                            }}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
                        >
                            Delete Gig
                        </button>
                        <button
                            onClick={() => navigate(`/gigs/${gig._id}/edit`)}
                            className="mt-4 ml-4 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition"
                        >
                            Edit Gig
                        </button>
                    </>
                )}
            </div>

            {user && !isOwner && gig.status === 'open' && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Submit a Bid</h2>
                    <form onSubmit={handleBidSubmit}>
                        <input
                            type="number"
                            placeholder="Price"
                            className="w-full p-2 mb-4 border rounded"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Message"
                            className="w-full p-2 mb-4 border rounded"
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Bid</button>
                    </form>
                </div>
            )}

            {isOwner && (
                <div className="bg-white p-6 rounded shadow mt-6">
                    <h2 className="text-xl font-bold mb-4">Bids ({bids.length})</h2>
                    {bids.map(bid => (
                        <div key={bid._id} className="border-b py-4 last:border-b-0 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{bid.freelancerId.name} <span className="text-gray-500 text-sm">(₹{bid.price})</span></p>
                                <p className="text-gray-700">{bid.message}</p>
                                <p className="text-xs text-gray-500">Status: {bid.status}</p>
                            </div>
                            {gig.status === 'open' && bid.status === 'pending' && (
                                <button
                                    onClick={() => handleHire(bid._id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Hire
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GigDetail;
