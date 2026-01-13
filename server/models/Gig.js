const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    minBudget: {
        type: Number,
        required: true,
        default: 0
    },
    maxBudget: {
        type: Number,
        required: true,
        default: 0
    },
    budget: {
        type: Number, // Legacy field
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'assigned'],
        default: 'open',
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            // "Smart Fix": If createdAt is missing (old data), extract it from _id
            if (!ret.createdAt) {
                ret.createdAt = doc._id.getTimestamp();
            }
            // "Smart Fix": Budget Range Backfill
            if (!ret.minBudget || ret.minBudget === 0) {
                ret.minBudget = ret.budget;
                ret.maxBudget = ret.budget;
            }
            return ret;
        }
    }
});

const Gig = mongoose.model('Gig', gigSchema);

module.exports = Gig;
