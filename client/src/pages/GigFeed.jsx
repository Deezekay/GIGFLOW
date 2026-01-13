import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SKILLS_LIST } from '../constants';
import { formatDistanceToNow } from 'date-fns';

const POPULAR_TAGS = SKILLS_LIST.slice(0, 8); // Top 8 for rapid display

const GigFeed = () => {
    const { user } = useContext(AuthContext);
    const [gigs, setGigs] = useState([]);
    const [myPostedGigs, setMyPostedGigs] = useState([]);
    const [appliedGigs, setAppliedGigs] = useState([]);
    const [myJobs, setMyJobs] = useState([]); // FL: Assigned Jobs
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagSearch, setTagSearch] = useState('');
    const [activeTab, setActiveTab] = useState('browse');
    const [sortBy, setSortBy] = useState('newest');

    const sortGigs = (gigsToSort) => {
        const sorted = [...gigsToSort];
        switch (sortBy) {
            case 'budget_low':
                return sorted.sort((a, b) => a.minBudget - b.minBudget);
            case 'budget_high':
                return sorted.sort((a, b) => b.minBudget - a.minBudget);
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
    };

    const fetchData = async () => {
        try {
            let query = `?keyword=${search}`;
            if (selectedTags.length > 0) {
                query += `&tags=${selectedTags.join(',')}`;
            }

            // 1. Fetch public open gigs for Browse
            const gigRes = await api.get(`/api/gigs${query}`);
            let allGigs = gigRes.data;

            if (user) {
                // 2. Fetch my bids
                const bidRes = await api.get('/api/bids/my-bids');
                const myBids = bidRes.data || [];
                const activeBids = myBids.filter(bid => bid.gigId && bid.gigId._id);

                const appliedGigIds = new Set(activeBids.map(bid => bid.gigId._id));
                const appliedList = activeBids.map(bid => ({ ...bid.gigId, bidStatus: bid.status }));

                // 2a. Fetch 'My Posted Gigs' (Open AND Assigned) from new endpoint
                const myGigsRes = await api.get('/api/gigs/my-gigs');
                setMyPostedGigs(myGigsRes.data);

                // 2b. Remove my posted gigs from Browse list (User shouldn't apply to own gig here)
                allGigs = allGigs.filter(gig => {
                    const oId = gig.ownerId._id || gig.ownerId;
                    return oId !== user._id;
                });

                // 3. Filter: Remove applied gigs from main list
                allGigs = allGigs.filter(gig => !appliedGigIds.has(gig._id));

                // 2c. Identify Gigs where I am HIRED
                const hiredList = activeBids
                    .filter(bid => bid.status === 'hired')
                    .map(bid => ({ ...bid.gigId, bidStatus: bid.status, myHiredPrice: bid.price }));

                setAppliedGigs(appliedList);
                setMyJobs(hiredList);
            }

            setGigs(allGigs);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedTags]); // Re-fetch when tags change

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const addTag = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setTagSearch('');
    };

    const removeTag = (tag) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    const filteredTags = POPULAR_TAGS.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t));

    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8 items-start">
            {/* Sidebar: Filters */}
            <div className="hidden md:block w-1/4 sticky top-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Filter by Skill</h3>

                    {/* Active Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTags.map(tag => (
                            <span key={tag} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm flex items-center">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="ml-1 font-bold hover:text-primary-900">×</button>
                            </span>
                        ))}
                    </div>

                    {/* Filter Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type to find tags..."
                            className="w-full p-2 border rounded mb-2 focus:outline-none focus:border-primary-500"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                        />
                        {/* Dropdown Suggestions */}
                        {tagSearch && (
                            <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                {filteredTags.length > 0 ? (
                                    filteredTags.map(tag => (
                                        <div
                                            key={tag}
                                            onClick={() => addTag(tag)}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            {tag}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500 text-sm">No matches</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Select for Popular (Optional, below input) */}
                    <div className="mt-4">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Popular</p>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_TAGS.slice(0, 5).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => addTag(tag)}
                                    disabled={selectedTags.includes(tag)}
                                    className={`text-xs px-2 py-1 rounded border transition ${selectedTags.includes(tag)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-600 hover:border-primary-500 hover:text-primary-600'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sort By Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
                    <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:border-primary-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="budget_low">Budget: Low to High</option>
                        <option value="budget_high">Budget: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow">
                {/* Header Area */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">Find Work</h1>
                        <p className="text-gray-500 mt-1">Browse the latest opportunities</p>
                    </div>
                </div>

                {/* Tabs */}
                {user && (
                    <div className="flex space-x-6 border-b border-gray-200 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`pb-3 font-medium text-sm transition whitespace-nowrap ${activeTab === 'browse' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Browse Jobs ({gigs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('my_posted')}
                            className={`pb-3 font-medium text-sm transition whitespace-nowrap ${activeTab === 'my_posted' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Posted Gigs ({myPostedGigs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('applied')}
                            className={`pb-3 font-medium text-sm transition whitespace-nowrap ${activeTab === 'applied' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Applied ({appliedGigs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('my_jobs')}
                            className={`pb-3 font-medium text-sm transition whitespace-nowrap ${activeTab === 'my_jobs' ? 'border-b-2 border-green-600 text-green-700' : 'text-green-600 hover:text-green-800'}`}
                        >
                            ★ My Jobs ({myJobs.length})
                        </button>
                    </div>
                )}

                {/* Search Bar (Only for Browse) */}
                {activeTab === 'browse' && (
                    <form onSubmit={handleSearch} className="mb-8 flex gap-3">
                        <div className="flex-grow relative">
                            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search for skills, keywords..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition shadow-md">Search</button>
                    </form>
                )}

                {/* Tab Content */}
                <div className="grid gap-4">
                    {activeTab === 'browse' ? (
                        // Browse Tab
                        gigs.length > 0 ? (
                            sortGigs(gigs).map((gig) => (
                                <div key={gig._id} className="border border-gray-200 p-6 rounded-xl bg-white hover:border-primary-300 hover:shadow-md transition group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition">{gig.title}</h2>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Posted by {gig.ownerId?.name || 'Unknown'} • {gig.createdAt ? formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true }) : 'Recently'}
                                            </div>
                                        </div>
                                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-100">
                                            ₹{gig.minBudget === gig.maxBudget ? gig.minBudget : `${gig.minBudget} - ₹${gig.maxBudget}`}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-gray-600 leading-relaxed line-clamp-2">{gig.description}</p>

                                    {/* Tags Display */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {gig.tags && gig.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <Link to={`/gigs/${gig._id}`} className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">No gigs found. Try adjusting your search or filters.</div>
                        )
                    ) : activeTab === 'applied' ? (
                        // Applied Tab
                        appliedGigs.length > 0 ? (
                            appliedGigs.map((gig) => (
                                <div key={gig._id} className="border border-gray-200 p-6 rounded-xl bg-white opacity-75">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{gig.title}</h2>
                                            <div className="text-sm text-gray-500 mt-1">Status: <span className="capitalize font-medium text-blue-600">{gig.bidStatus || 'Pending'}</span></div>
                                        </div>
                                        <span className="text-gray-400 font-medium">₹{gig.budget}</span>
                                    </div>
                                    <p className="mt-2 text-gray-500 text-sm line-clamp-1">{gig.description}</p>
                                    <div className="mt-4">
                                        <Link to={`/gigs/${gig._id}`} className="text-primary-600 text-sm font-medium hover:underline">View Proposal</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">You haven't applied to any gigs yet.</div>
                        )
                    ) : activeTab === 'my_jobs' ? (
                        // My Assigned Jobs Tab
                        myJobs.length > 0 ? (
                            myJobs.map((gig) => (
                                <div key={gig._id} className="border-l-4 border-l-green-500 border border-gray-200 p-6 rounded-r-xl bg-white shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-bold text-gray-900">{gig.title}</h2>
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">HIRED</span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Client: {gig.ownerId.name || 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-green-700 font-bold text-lg">₹{gig.myHiredPrice}</span>
                                            <span className="text-xs text-gray-400 line-through">Bid: ₹{gig.myHiredPrice}</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-700 leading-relaxed line-clamp-2">{gig.description}</p>
                                    <div className="mt-4">
                                        <Link to={`/gigs/${gig._id}`} className="inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
                                            View Project & Contact Info
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-xl mb-2">No active jobs yet.</p>
                                <p className="text-sm">Keep applying to gigs to get hired!</p>
                            </div>
                        )
                    ) : (
                        // My Posted Gigs Tab
                        myPostedGigs.length > 0 ? (
                            myPostedGigs.map((gig) => (
                                <div key={gig._id} className="border-l-4 border-l-primary-500 border border-gray-200 p-6 rounded-r-xl bg-white shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{gig.title}</h2>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Posted {gig.createdAt ? formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true }) : 'Recently'}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                            {gig.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <Link to={`/gigs/${gig._id}`} className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 transition">
                                            Manage Gig
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">You haven't posted any gigs yet.</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default GigFeed;
