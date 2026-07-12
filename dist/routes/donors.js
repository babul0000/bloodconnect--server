"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    let donors = await db_1.donorsCollection.find().toArray();
    if (donors.length === 0) {
        const dummyDonors = [
            {
                name: 'Rahim Ahmed',
                bloodType: 'O+',
                location: 'Dhaka Medical College, Dhaka',
                email: 'rahim@gmail.com',
                contactNumber: '01712345678',
                status: 'Available',
                verified: true,
                active: true,
                createdAt: new Date(),
            },
            {
                name: 'Sultana Razia',
                bloodType: 'A-',
                location: 'Chittagong General Hospital, Chittagong',
                email: 'sultana@gmail.com',
                contactNumber: '01812345678',
                status: 'Available',
                verified: false,
                active: true,
                createdAt: new Date(),
            },
            {
                name: 'Tanvir Hossain',
                bloodType: 'B+',
                location: 'Rajshahi Medical Hospital, Rajshahi',
                email: 'tanvir@gmail.com',
                contactNumber: '01912345678',
                status: 'Available',
                verified: true,
                active: true,
                createdAt: new Date(),
            },
            {
                name: 'Nusrat Jahan',
                bloodType: 'AB+',
                location: 'Sylhet Osmani Medical, Sylhet',
                email: 'nusrat@gmail.com',
                contactNumber: '01512345678',
                status: 'Unavailable',
                verified: false,
                active: true,
                createdAt: new Date(),
            },
            {
                name: 'Arifur Rahman',
                bloodType: 'O-',
                location: 'Mymensingh Medical, Mymensingh',
                email: 'arif@gmail.com',
                contactNumber: '01612345678',
                status: 'Available',
                verified: true,
                active: false,
                createdAt: new Date(),
            }
        ];
        await db_1.donorsCollection.insertMany(dummyDonors);
        donors = await db_1.donorsCollection.find().toArray();
    }
    res.json(donors);
});
router.get('/:id', async (req, res) => {
    const id = req.params['id'];
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid donor id' });
    }
    const donor = await db_1.donorsCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
    if (!donor) {
        return res.status(404).json({ error: 'Donor not found' });
    }
    res.json(donor);
});
router.post('/', async (req, res) => {
    const { name, bloodType, location, email, contactNumber, status, verified, active } = req.body;
    if (!name || !bloodType || !location) {
        return res.status(400).json({ error: 'name, bloodType, and location are required' });
    }
    const newDonor = {
        name,
        bloodType,
        location,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        contactNumber: contactNumber || `01${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: status || 'Available',
        verified: verified || false,
        active: active !== false,
        createdAt: new Date(),
    };
    const result = await db_1.donorsCollection.insertOne(newDonor);
    res.status(201).json({ ...newDonor, _id: result.insertedId });
});
router.put('/:id/verify', async (req, res) => {
    const id = req.params['id'];
    const { verified } = req.body;
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid donor ID' });
    }
    try {
        const result = await db_1.donorsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { verified: !!verified } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json({ message: 'Donor verification status updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify donor' });
    }
});
router.put('/:id/status', async (req, res) => {
    const id = req.params['id'];
    const { active, status } = req.body;
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid donor ID' });
    }
    const updateObj = {};
    if (active !== undefined)
        updateObj.active = !!active;
    if (status !== undefined)
        updateObj.status = status;
    try {
        const result = await db_1.donorsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateObj });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json({ message: 'Donor status/eligibility updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update donor status' });
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params['id'];
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid donor id' });
    }
    const result = await db_1.donorsCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
    if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Donor not found' });
    }
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=donors.js.map