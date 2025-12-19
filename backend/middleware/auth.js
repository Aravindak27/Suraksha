const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ message: "Unauthenticated" });

        const decodedData = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decodedData?.id;

        next();
    } catch (error) {
        res.status(401).json({ message: "Token Invalid" });
    }
};

module.exports = auth;
