import React, { useState } from 'react';
import { SKILLS_LIST } from '../constants';

const TagInput = ({ tags, setTags }) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        if (value.trim()) {
            const matches = SKILLS_LIST.filter(skill =>
                skill.toLowerCase().includes(value.toLowerCase()) &&
                !tags.includes(skill)
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const addTag = (tag) => {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setInput('');
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input.trim());
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="mb-4 relative">
            <label className="block mb-2 font-bold text-gray-700">Required Skills</label>
            <div className="flex flex-wrap gap-2 p-2 border rounded border-gray-300 focus-within:border-primary-500 bg-white min-h-[42px]">
                {tags.map(tag => (
                    <span key={tag} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm flex items-center">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-primary-600 hover:text-primary-900 font-bold">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type skill and press Enter..."
                    className="flex-grow outline-none bg-transparent min-w-[150px]"
                />
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-b shadow-lg max-h-48 overflow-y-auto mt-1">
                    {suggestions.map(skill => (
                        <div
                            key={skill}
                            onClick={() => addTag(skill)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                        >
                            {skill}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagInput;
