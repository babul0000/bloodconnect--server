import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { requestsCollection } from '../config/db';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const { email } = req.query;
  const filter = email ? { email: email as string } : {};
  const requests = await requestsCollection.find(filter).toArray();
  res.json(requests);
});

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const id = req.params['id'];
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }
  const bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(id) });
  if (!bloodRequest) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(bloodRequest);
});

router.post('/', async (req: Request, res: Response): Promise<any> => {
  const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber, email, imageUrl } = req.body as {
    patientName?: string;
    bloodGroup?: string;
    hospitalName?: string;
    location?: string;
    urgencyLevel?: string;
    contactNumber?: string;
    email?: string;
    imageUrl?: string;
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
    imageUrl: imageUrl || '',
    status: 'Pending',
    createdAt: new Date(),
  };

  const result = await requestsCollection.insertOne(newRequest);
  res.status(201).json({ ...newRequest, _id: result.insertedId });
});

router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  const id = req.params['id'];
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  const { patientName, bloodGroup, hospitalName, location, urgencyLevel, contactNumber, imageUrl, status } = req.body as {
    patientName?: string;
    bloodGroup?: string;
    hospitalName?: string;
    location?: string;
    urgencyLevel?: string;
    contactNumber?: string;
    imageUrl?: string;
    status?: string;
  };

  if (!patientName || !bloodGroup || !hospitalName || !location || !urgencyLevel || !contactNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const updateSet: any = {
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

  const result = await requestsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updateSet,
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ message: 'Request updated successfully' });
});

router.patch('/:id/status', async (req: Request, res: Response): Promise<any> => {
  const id = req.params['id'];
  const { status } = req.body as { status: string };
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  try {
    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const id = req.params['id'];
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  const result = await requestsCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(204).send();
});

export default router;
