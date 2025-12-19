const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Incident = require('../models/Incident');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Trigger Emergency
router.post('/trigger', auth, async (req, res) => {
    const { location, decibelLevel } = req.body;
    try {
        const user = await User.findById(req.userId);

        // 1. Log Incident
        const incident = new Incident({
            userId: req.userId,
            location,
            decibelLevel,
            status: 'triggered'
        });
        await incident.save();

        // 2. Send Email Alerts
        if (user.emergencyContacts.length > 0) {
            const contactEmails = user.emergencyContacts.map(c => c.email).filter(e => e);

            if (contactEmails.length > 0) {
                const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
                const emailBody = `
                    <h1>EMERGENCY ALERT</h1>
                    <p>${user.name} has triggered an emergency alert!</p>
                    <p><strong>Decibel Level:</strong> ${decibelLevel} dB</p>
                    <p><strong>Location:</strong> <a href="${mapLink}">Click to View on Map</a></p>
                    <p>Coordinates: ${location.lat}, ${location.lng} (Accuracy: ${location.accuracy}m)</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                `;

                // Send to all contacts (in parallel)
                // Note: In production, use a queue. Here we await for simplicity.
                await Promise.all(contactEmails.map(email =>
                    sendEmail(email, `EMERGENCY: Help ${user.name}!`, "Emergency Alert", emailBody)
                ));

                incident.notifiedContacts = true;
                await incident.save();
            }
        }

        res.json({ msg: "Emergency Triggered & Alerts Sent", incidentId: incident._id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Get History
// Get History
router.get('/history', auth, async (req, res) => {
    try {
        const incidents = await Incident.find({ userId: req.userId })
            .sort({ timestamp: -1 })
            .populate('notifiedCommunity', 'name email'); // Populate names
        res.json(incidents);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
