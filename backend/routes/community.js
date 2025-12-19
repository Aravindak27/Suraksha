const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get Nearby Users (10km radius)
router.get('/nearby', auth, async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ msg: "Latitude and Longitude required" });
    }

    try {
        console.log(`Searching community users (Global) for Lat: ${lat}, Lng: ${lng}`);

        // MongoDB Aggregation to Calculate Distance for ALL users
        const users = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance", // Output field for distance (in meters)
                    spherical: true,
                    // maxDistance: 10000 // Removed to show ALL users
                }
            },
            {
                $match: { _id: { $ne: new mongoose.Types.ObjectId(req.userId) } } // Exclude self
            },
            {
                $project: {
                    name: 1,
                    location: 1,
                    distance: 1 // Include calculated distance
                }
            }
        ]);

        console.log(`Found ${users.length} users globally.`);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
