import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db(process.env.MONGODB_DATABASE || 'StayNest');
const donorsCollection = db.collection('donors');
const requestsCollection = db.collection('requests');
const profilesCollection = db.collection('profiles');

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.get('/api/donors', async (_req: Request, res: Response) => {
  const donors = await donorsCollection.find().toArray();
  res.json(donors);
});

app.get('/api/donors/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid donor id' });
  }

  const donor = await donorsCollection.findOne({ _id: new ObjectId(id) });
  if (!donor) {
    return res.status(404).json({ error: 'Donor not found' });
  }

  res.json(donor);
});

app.post('/api/donors', async (req: Request, res: Response) => {
  const { name, bloodType, location } = req.body as {
    name?: string;
    bloodType?: string;
    location?: string;
  };

  if (!name || !bloodType || !location) {
    return res.status(400).json({ error: 'name, bloodType, and location are required' });
  }

  const newDonor = {
    name,
    bloodType,
    location,
    createdAt: new Date(),
  };

  const result = await donorsCollection.insertOne(newDonor);
  res.status(201).json({ ...newDonor, _id: result.insertedId });
});

app.delete('/api/donors/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid donor id' });
  }

  const result = await donorsCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Donor not found' });
  }

  res.status(204).send();
});

// --- Requests Endpoints ---

app.get('/api/requests', async (req: Request, res: Response) => {
  const { email } = req.query;
  const filter = email ? { email: email as string } : {};
  const requests = await requestsCollection.find(filter).toArray();
  res.json(requests);
});

app.get('/api/requests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }
  const bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(id) });
  if (!bloodRequest) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(bloodRequest);
});

app.post('/api/requests', async (req: Request, res: Response) => {
  const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber, email } = req.body as {
    patientName?: string;
    bloodGroup?: string;
    hospitalName?: string;
    location?: string;
    urgencyLevel?: string;
    contactNumber?: string;
    email?: string;
  };

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
    createdAt: new Date(),
  };

  const result = await requestsCollection.insertOne(newRequest);
  res.status(201).json({ ...newRequest, _id: result.insertedId });
});

app.put('/api/requests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber } = req.body as {
    patientName?: string;
    bloodGroup?: string;
    hospitalName?: string;
    location?: string;
    urgencyLevel?: string;
    contactNumber?: string;
  };

  if (!patientName || !bloodGroup || !hospitalName || !location || !urgencyLevel || !contactNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const result = await requestsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        patientName,
        bloodGroup,
        hospitalName,
        location,
        urgencyLevel,
        contactNumber,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ message: 'Request updated successfully' });
});

app.delete('/api/requests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  const result = await requestsCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(204).send();
});

// --- Profile Endpoints ---

app.get('/api/profile', async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email query param is required' });
  }

  const profile = await profilesCollection.findOne({ email: email as string });
  if (!profile) {
    return res.json({ email, bloodGroup: '', lastDonationDate: '', medicalEligibility: 'Eligible' });
  }

  res.json(profile);
});

app.post('/api/profile', async (req: Request, res: Response) => {
  const { email, bloodGroup, lastDonationDate, medicalEligibility } = req.body as {
    email?: string;
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

app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer(): Promise<void> {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();