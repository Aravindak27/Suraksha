const mongoose = require('mongoose');
const Report = require('./models/Report');
const dotenv = require('dotenv');

dotenv.config();

const CENTER_LAT = 13.0827;
const CENTER_LNG = 80.2707;

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/suraksha');
        console.log("Connected to DB");

        await Report.deleteMany({}); // Clear old reports
        console.log("Cleared old reports.");

        // User Requested Area: 10° 13' – 10° 31' N, 76° 52' – 77° 23' E (Coimbatore/Pollachi)
        const LAT_MIN = 10.216;
        const LAT_MAX = 10.516;
        const LNG_MIN = 76.866;
        const LNG_MAX = 77.383;

        console.log(`Seeding Unsafe Zones in Range: Lat[${LAT_MIN}-${LAT_MAX}], Lng[${LNG_MIN}-${LNG_MAX}]`);

        // Create 50 unsafe zones scattered in this area
        for (let i = 0; i < 50; i++) {
            const lat = LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN);
            const lng = LNG_MIN + Math.random() * (LNG_MAX - LNG_MIN);

            const report = new Report({
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                type: 'unsafe',
                description: 'High Risk Zone: Reported by User Request',
                timestamp: new Date()
            });

            await report.save();
            console.log(`Created Red Zone at ${report.location.coordinates}`);
        }

        console.log("Seeding Reports Complete!");

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

seed();
