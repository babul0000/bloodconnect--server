import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { profilesCollection, usersCollection } from '../config/db';

const router = express.Router();

// Profile Endpoints
router.get('/profile', async (req: Request, res: Response): Promise<any> => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email query param is required' });
  }

  const profile = await profilesCollection.findOne({ email: email as string });
  if (!profile) {
    return res.json({ email, name: '', phone: '', bloodGroup: '', lastDonationDate: '', medicalEligibility: 'Eligible' });
  }

  res.json(profile);
});

router.post('/profile', async (req: Request, res: Response): Promise<any> => {
  const { email, name, phone, bloodGroup, lastDonationDate, medicalEligibility } = req.body as {
    email?: string;
    name?: string;
    phone?: string;
    bloodGroup?: string;
    lastDonationDate?: string;
    medicalEligibility?: string;
  };

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  await profilesCollection.updateOne(
    { email },
    {
      $set: {
        name: name || '',
        phone: phone || '',
        bloodGroup: bloodGroup || '',
        lastDonationDate: lastDonationDate || '',
        medicalEligibility: medicalEligibility || 'Eligible',
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  res.json({ message: 'Profile updated successfully' });
});

// Authentication & Registration Schema
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as any, {
    message: 'Invalid blood group (Choose A+, A-, B+, B-, O+, O-, AB+, AB-)',
  }),
  role: z.string().optional().default('user'),
  lastDonationDate: z.string().optional(),
  contactNumber: z.string().optional(),
  medicalEligibility: z.boolean().optional().default(true),
});

router.post('/auth/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const parseResult = registrationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Validation error' });
    }

    const { name, email, password, bloodGroup, role, lastDonationDate, contactNumber, medicalEligibility } = parseResult.data;

    // Check if email already registered
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

    const result = await usersCollection.insertOne(newUser);

    // Exclude password hash
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ...userWithoutPassword,
        _id: result.insertedId,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    res.status(500).json({ error: 'Internal server registration failure' });
  }
});

export default router;
