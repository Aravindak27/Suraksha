const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    type: { type: String, default: 'unsafe' }, // unsafe, harassment, theft, etc.
    description: { type: String },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
});

ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
