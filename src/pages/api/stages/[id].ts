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

  const { id } = req.query;
  const stageId = parseInt(id as string);

  if (isNaN(stageId)) {
    return res.status(400).json({ error: 'Invalid stage ID' });
  }

  // Check if stage exists
  const existingStage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      enrollment_plan: true,
    },
  });

  if (!existingStage) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json(existingStage);

    case 'PUT':
      try {
        const { name, description, start_date, end_date, order } = req.body;

        // Validate required fields
        if (!name || !description || !start_date || !end_date || !order) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (endDate <= startDate) {
          return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Validate dates against plan dates
        if (startDate < existingStage.enrollment_plan.start_date || 
            endDate > existingStage.enrollment_plan.end_date) {
          return res.status(400).json({ error: 'Stage dates must be within enrollment plan dates' });
        }

        // Check if new order is unique (excluding current stage)
        if (order !== existingStage.order) {
          const stageWithOrder = await prisma.stage.findFirst({
            where: {
              enrollment_plan_id: existingStage.enrollment_plan_id,
              order,
              NOT: {
                id: stageId,
              },
            },
          });

          if (stageWithOrder) {
            return res.status(400).json({ error: 'A stage with this order already exists in the plan' });
          }
        }

        const updatedStage = await prisma.stage.update({
          where: { id: stageId },
          data: {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            order,
            updated_at: new Date(),
          },
        });

        return res.status(200).json(updatedStage);
      } catch (error) {
        console.error('Error updating stage:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'DELETE':
      try {
        // Delete all assignments first
        await prisma.assignment.deleteMany({
          where: {
            stage_id: stageId,
          },
        });

        // Then delete the stage
        await prisma.stage.delete({
          where: { id: stageId },
        });

        return res.status(200).json({ message: 'Stage deleted successfully' });
      } catch (error) {
        console.error('Error deleting stage:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 