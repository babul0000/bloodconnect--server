"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const db_1 = require("../config/db");
const router = express_1.default.Router();
// Profile Endpoints
router.get('/profile', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email query param is required' });
    }
    const profile = await db_1.profilesCollection.findOne({ email: email });
    if (!profile) {
        return res.json({ email, name: '', phone: '', bloodGroup: '', lastDonationDate: '', medicalEligibility: 'Eligible' });
    }
    res.json(profile);
});
router.post('/profile', async (req, res) => {
    const { email, name, phone, bloodGroup, lastDonationDate, medicalEligibility } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    await db_1.profilesCollection.updateOne({ email }, {
        $set: {
            name: name || '',
            phone: phone || '',
            bloodGroup: bloodGroup || '',
            lastDonationDate: lastDonationDate || '',
            medicalEligibility: medicalEligibility || 'Eligible',
            updatedAt: new Date(),
        },
    }, { upsert: true });
    res.json({ message: 'Profile updated successfully' });
});
// Authentication & Registration Schema
const registrationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], {
        message: 'Invalid blood group (Choose A+, A-, B+, B-, O+, O-, AB+, AB-)',
    }),
    role: zod_1.z.string().optional().default('user'),
    lastDonationDate: zod_1.z.string().optional(),
    contactNumber: zod_1.z.string().optional(),
    medicalEligibility: zod_1.z.boolean().optional().default(true),
});
router.post('/auth/register', async (req, res) => {
    try {
        const parseResult = registrationSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Validation error' });
        }
        const { name, email, password, bloodGroup, role, lastDonationDate, contactNumber, medicalEligibility } = parseResult.data;
        // Check if email already registered
        const existingUser = await db_1.usersCollection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const newUser = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            bloodGroup,
            role,
            lastDonationDate: lastDonationDate || '',
            contactNumber: contactNumber || '',
            medicalEligibility,
            createdAt: new Date(),
        };
        const result = await db_1.usersCollection.insertOne(newUser);
        // Exclude password hash
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                ...userWithoutPassword,
                _id: result.insertedId,
            },
        });
    }
    catch (error) {
        console.error('Registration API error:', error);
        res.status(500).json({ error: 'Internal server registration failure' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map