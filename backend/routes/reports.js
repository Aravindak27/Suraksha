const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');

// Get All Reports (for Heatmap)
router.get('/', auth, async (req, res) => {
    try {
        // Return 100 most recent reports for now
        // In real app, we would filter by viewport bounds
        const reports = await Report.find().sort({ timestamp: -1 }).limit(100);
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Create New Report (Optional, for testing)
router.post('/', auth, async (req, res) => {
    const { lat, lng, description, type } = req.body;
    try {
        const newReport = new Report({
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            description,
            type,
            reportedBy: req.userId
        });

        await newReport.save();
        res.json(newReport);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
