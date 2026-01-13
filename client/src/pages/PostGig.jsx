import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TagInput from '../components/TagInput';
import { toast } from 'react-toastify';

const PostGig = () => {
    const [formData, setFormData] = useState({ title: '', description: '', minBudget: '', maxBudget: '' });
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/gigs', { ...formData, tags });
            toast.success('Gig posted successfully!');
            navigate('/');
        } catch (err) {
            toast.error('Failed to post gig');
        }
    };

    return (
        <div className="p-8 flex justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-lg">
                <h2 className="text-2xl mb-6 font-bold">Post a New Gig</h2>

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

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Post Gig
                </button>
            </form>
        </div>
    );
};

export default PostGig;
