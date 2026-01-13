import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import TagInput from '../components/TagInput';
import { toast } from 'react-toastify';

const EditGig = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', description: '', minBudget: '', maxBudget: '' });
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const res = await api.get(`/api/gigs/${id}`);
                setFormData({
                    title: res.data.title,
                    description: res.data.description,
                    minBudget: res.data.minBudget || res.data.budget,
                    maxBudget: res.data.maxBudget || res.data.budget,
                });
                setTags(res.data.tags || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Error loading gig');
                navigate('/gigs');
            }
        };
        fetchGig();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/gigs/${id}`, { ...formData, tags });
            toast.success('Gig updated successfully!');
            navigate(`/gigs/${id}`);
        } catch (err) {
            toast.error('Failed to update gig');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-8 flex justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-lg">
                <h2 className="text-2xl mb-6 font-bold">Edit Gig</h2>

                <label className="block mb-2 font-bold">Title</label>
                <input
                    type="text"
                    className="w-full p-2 mb-4 border rounded"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />

                <label className="block mb-2 font-bold">Description</label>
                <textarea
                    className="w-full p-2 mb-4 border rounded h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                ></textarea>

                <TagInput tags={tags} setTags={setTags} />

                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block mb-2 font-bold">Min Budget (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={formData.minBudget}
                            onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2 font-bold">Max Budget (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={formData.maxBudget}
                            onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Save Changes
                    </button>
                    <button type="button" onClick={() => navigate(`/gigs/${id}`)} className="flex-1 bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditGig;
