"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const authorizeAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token is missing' });
        }
        let decoded = null;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.BETTER_AUTH_SECRET || 'secret');
        }
        catch (err) {
            // Session lookup fallback in MongoDB
            const sessionDoc = await db_1.db.collection('session').findOne({ token });
            if (sessionDoc) {
                const userDoc = await db_1.usersCollection.findOne({ _id: new mongodb_1.ObjectId(sessionDoc.userId) });
                if (userDoc && userDoc.role === 'admin') {
                    req.currentUser = userDoc;
                    return next();
                }
            }
            // Unverified decode fallback to check DB record directly
            const unverifiedDecoded = jsonwebtoken_1.default.decode(token);
            if (unverifiedDecoded && (unverifiedDecoded.userId || unverifiedDecoded.email)) {
                const query = unverifiedDecoded.userId
                    ? { _id: new mongodb_1.ObjectId(unverifiedDecoded.userId) }
                    : { email: unverifiedDecoded.email };
                const userDoc = await db_1.usersCollection.findOne(query);
                if (userDoc && userDoc.role === 'admin') {
                    req.currentUser = userDoc;
                    return next();
                }
            }
            return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
        }
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
        }
        const userId = decoded.userId || decoded.sub || decoded.id;
        const userEmail = decoded.email;
        let userDoc = null;
        if (mongodb_1.ObjectId.isValid(userId)) {
            userDoc = await db_1.usersCollection.findOne({ _id: new mongodb_1.ObjectId(userId) });
        }
        else if (userEmail) {
            userDoc = await db_1.usersCollection.findOne({ email: userEmail });
        }
        if (!userDoc) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        if (userDoc.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        req.currentUser = userDoc;
        next();
    }
    catch (error) {
        console.error('Middleware authorization failure:', error);
        res.status(500).json({ error: 'Internal server authorization error' });
    }
};
exports.authorizeAdmin = authorizeAdmin;
//# sourceMappingURL=auth.js.map