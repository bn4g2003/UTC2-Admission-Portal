import { NextApiRequest, NextApiResponse } from 'next'
import db from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Lấy tổng số người dùng
    const totalUsersResult = await db.query(`
      SELECT COUNT(*) FROM users
    `)
    const totalUsers = totalUsersResult.rows[0];

    // Lấy số kế hoạch đang hoạt động
    const activePlansResult = await db.query(`
      SELECT COUNT(*) 
      FROM enrollment_plans 
      WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
    `)
    const activePlans = activePlansResult.rows[0];

    // Lấy số nhiệm vụ đang chờ xử lý
    const pendingAssignmentsResult = await db.query(`
      SELECT COUNT(*) 
      FROM assignments 
      WHERE status = 'pending'
    `)
    const pendingAssignments = pendingAssignmentsResult.rows[0];

    // Lấy số báo cáo chưa duyệt
    const pendingReportsResult = await db.query(`
      SELECT COUNT(*) 
      FROM reports 
      WHERE status = 'submitted'
    `)
    const pendingReports = pendingReportsResult.rows[0];

    res.status(200).json({
      totalUsers: parseInt(totalUsers.count),
      activePlans: parseInt(activePlans.count),
      pendingAssignments: parseInt(pendingAssignments.count),
      pendingReports: parseInt(pendingReports.count)
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
