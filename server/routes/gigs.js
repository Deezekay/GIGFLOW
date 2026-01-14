const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
    const { title, description, minBudget, maxBudget, tags } = req.body;

    const gig = new Gig({
        title,
        description,
        minBudget,
        maxBudget,
        budget: maxBudget, // Legacy fallback
        tags: tags || [],
        ownerId: req.user._id,
    });

    const createdGig = await gig.save();
    res.status(201).json(createdGig);
});

router.get('/', async (req, res) => {
    let query = { status: 'open' };

    if (req.query.keyword) {
        query.title = { $regex: req.query.keyword, $options: 'i' };
    }

    if (req.query.tags) {
        const tags = req.query.tags.split(',').map(t => t.trim());
        if (tags.length > 0) {
            // Filter by Tags
            query.tags = { $in: tags.map(t => new RegExp(t, 'i')) };
        }
    }

    const gigs = await Gig.find(query)
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 }); // Default: Newest first

    res.json({ payload: gigs });

});

// NEW: Get logged-in user's gigs (Active & Assigned)
router.get('/my-gigs', protect, async (req, res) => {
    const gigs = await Gig.find({ ownerId: req.user._id })
        .sort({ createdAt: -1 });
    res.json({ payload: gigs });

});

// NEW: Get Contact details for a hired gig
router.get('/:id/contact', protect, async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email');

    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    // 1. If Requester is OWNER -> Return Hired Freelancer's Email
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
        const Bid = require('../models/Bid'); // Lazy load
        const hiredBid = await Bid.findOne({ gigId: gig._id, status: 'hired' }).populate('freelancerId', 'name email');

        if (hiredBid) {
            return res.json({
                role: 'owner',
                contactName: hiredBid.freelancerId.name,
                contactEmail: hiredBid.freelancerId.email,
                hiredPrice: hiredBid.price
            });
        } else {
            return res.status(404).json({ message: 'No freelancer hired yet' });
        }
    }

    // 2. If Requester is FREELANCER (and is hired) -> Return Owner's Email
    const Bid = require('../models/Bid');
    const myBid = await Bid.findOne({ gigId: gig._id, freelancerId: req.user._id, status: 'hired' });

    if (myBid) {
        return res.json({
            role: 'freelancer',
            contactName: gig.ownerId.name,
            contactEmail: gig.ownerId.email,
            hiredPrice: myBid.price
        });
    }

    return res.status(403).json({ message: 'Not authorized to view contact info' });
});

router.get('/:id', async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name');

    if (gig) {
        res.json(gig);
    } else {
        res.status(404).json({ message: 'Gig not found' });
    }
});

router.put('/:id', protect, async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig) {
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        gig.title = req.body.title || gig.title;
        gig.description = req.body.description || gig.description;

        if (req.body.minBudget) gig.minBudget = req.body.minBudget;
        if (req.body.maxBudget) gig.maxBudget = req.body.maxBudget;
        // Update legacy budget too
        if (req.body.maxBudget) gig.budget = req.body.maxBudget;

        gig.tags = req.body.tags || gig.tags;

        const updatedGig = await gig.save();
        res.json(updatedGig);
    } else {
        res.status(404).json({ message: 'Gig not found' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig) {
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await gig.deleteOne();
        res.json({ message: 'Gig removed' });
    } else {
        res.status(404).json({ message: 'Gig not found' });
    }
});

module.exports = router;
