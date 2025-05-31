import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has TRUONGBAN role
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
  });

  if (!user || user.role !== 'TRUONGBAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, description, start_date, end_date, order, enrollment_plan_id } = req.body;

    // Validate required fields
    if (!name || !description || !start_date || !end_date || !order || !enrollment_plan_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check if enrollment plan exists and validate dates against plan dates
    const plan = await prisma.enrollmentPlan.findUnique({
      where: { id: enrollment_plan_id },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Enrollment plan not found' });
    }

    if (startDate < plan.start_date || endDate > plan.end_date) {
      return res.status(400).json({ error: 'Stage dates must be within enrollment plan dates' });
    }

    // Check if order is unique within the plan
    const existingStage = await prisma.stage.findFirst({
      where: {
        enrollment_plan_id,
        order,
      },
    });

    if (existingStage) {
      return res.status(400).json({ error: 'A stage with this order already exists in the plan' });
    }

    const stage = await prisma.stage.create({
      data: {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        order,
        enrollment_plan_id,
      },
    });

    return res.status(201).json(stage);
  } catch (error) {
    console.error('Error creating stage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 