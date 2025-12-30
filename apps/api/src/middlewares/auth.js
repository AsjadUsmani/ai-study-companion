import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    const token = req.cookies?.token;

    if(!token) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" })
    }
}

export default auth