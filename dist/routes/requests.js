"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const { email } = req.query;
    const filter = email ? { email: email } : {};
    const requests = await db_1.requestsCollection.find(filter).toArray();
    res.json(requests);
});
router.get('/:id', async (req, res) => {
    const id = req.params['id'];
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid request ID' });
    }
    const bloodRequest = await db_1.requestsCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
    if (!bloodRequest) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.json(bloodRequest);
});
router.post('/', async (req, res) => {
    const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber, email, imageUrl } = req.body;
    if (!patientName || !bloodGroup || !hospitalName || !location || !urgencyLevel || !contactNumber || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newRequest = {
        patientName,
        bloodGroup,
        hospitalName,
        location,
        urgencyLevel,
        contactNumber,
        email,
        imageUrl: imageUrl || '',
        status: 'Pending',
        createdAt: new Date(),
    };
    const result = await db_1.requestsCollection.insertOne(newRequest);
    res.status(201).json({ ...newRequest, _id: result.insertedId });
});
router.put('/:id', async (req, res) => {
    const id = req.params['id'];
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid request ID' });
    }
    const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber, imageUrl, status } = req.body;
    if (!patientName || !bloodGroup || !hospitalName || !location || !urgencyLevel || !contactNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const updateSet = {
        patientName,
        bloodGroup,
        hospitalName,
        location,
        urgencyLevel,
        contactNumber,
        imageUrl: imageUrl || '',
        updatedAt: new Date(),
    };
    if (status) {
        updateSet.status = status;
    }
    const result = await db_1.requestsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
        $set: updateSet,
    });
    if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request updated successfully' });
});
router.patch('/:id/status', async (req, res) => {
    const id = req.params['id'];
    const { status } = req.body;
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid request ID' });
    }
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    try {
        const result = await db_1.requestsCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json({ message: 'Request status updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update request status' });
    }
});
router.delete('/:id', async (req, res) => {
    const id = req.params['id'];
    if (!id || typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid request ID' });
    }
    const result = await db_1.requestsCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
    if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=requests.js.map