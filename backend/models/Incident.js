const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
        lat: Number,
        lng: Number,
        accuracy: Number
    },
    decibelLevel: Number,
    status: { type: String, default: 'triggered' }, // triggered, resolved
    resolvedAt: Date,
    notifiedContacts: { type: Boolean, default: false },
    notifiedCommunity: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Incident', IncidentSchema);
