const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "secret-key";

const authorizeMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach decoded token data to request (e.g., user ID)
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(403).json({ error: "Forbidden: Invalid token" });
    }
};

module.exports = authorizeMiddleware;
