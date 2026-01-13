const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
    const { gigId, message, price } = req.body;

    const bid = new Bid({
        gigId,
        freelancerId: req.user._id,
        message,
        price,
    });

    const createdBid = await bid.save();
    res.status(201).json(createdBid);
});

router.get('/my-bids', protect, async (req, res) => {
    const bids = await Bid.find({ freelancerId: req.user._id }).populate('gigId');
    res.json(bids);
});

router.get('/:gigId', protect, async (req, res) => {
    const gig = await Gig.findById(req.params.gigId);

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const bids = await Bid.find({ gigId: req.params.gigId }).populate('freelancerId', 'name email');
    res.json(bids);
});

router.patch('/:bidId/hire', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bid = await Bid.findById(req.params.bidId).session(session);
        if (!bid) {
            throw new Error('Bid not found');
        }

        const gig = await Gig.findById(bid.gigId).session(session);
        if (!gig) {
            throw new Error('Gig not found');
        }

        if (gig.status === 'assigned') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Gig already assigned' });
        }

        if (gig.ownerId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ message: 'Not authorized' });
        }

        gig.status = 'assigned';
        await gig.save({ session });

        bid.status = 'hired';
        await bid.save({ session });

        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bid._id } },
            { status: 'rejected' }
        ).session(session);

        await session.commitTransaction();
        session.endSession();

        // Emit socket event after commit
        // Emit socket event to the HIRED freelancer
        const io = req.app.get('socketio');
        io.to(bid.freelancerId.toString()).emit('notification', {
            message: `You have been hired for ${gig.title}`,
        });

        // 2. Fetch and notify REJECTED freelancers
        const rejectedBids = await Bid.find({ gigId: gig._id, _id: { $ne: bid._id } });

        rejectedBids.forEach(rejectedBid => {
            io.to(rejectedBid.freelancerId.toString()).emit('notification', {
                message: `Your bid for ${gig.title} was not selected.`,
            });
        });

        res.json({ message: 'Freelancer hired successfully' });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed', error: error.message });
    }
});

module.exports = router;
