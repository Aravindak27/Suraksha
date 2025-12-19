const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get Profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// Update Profile (Add Contacts, etc)
router.put('/', auth, async (req, res) => {
    const { name, age, emergencyContacts, location } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (name) user.name = name;
        if (age) user.age = age;
        if (emergencyContacts) user.emergencyContacts = emergencyContacts;

        // Handle GeoJSON Location Update
        if (location) {
            console.log(`Updating location for User ${req.userId} to:`, location);
            user.location = {
                type: 'Point',
                coordinates: [location.lng, location.lat] // GeoJSON is [lng, lat]
            };
        }

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
