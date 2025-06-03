import { NextApiRequest, NextApiResponse } from 'next'
import { decode } from 'jsonwebtoken'
import { supabase } from '../../../../lib/supabase'
import pool from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const token = req.cookies.token
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decodedToken = decode(token) as { role: string; id: string } | null
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Chỉ TRUONGBAN mới được xóa tài liệu
    if (decodedToken.role !== 'TRUONGBAN') {
      return res.status(403).json({ message: 'Only TRUONGBAN can delete documents' })
    }

    if (req.method === 'DELETE') {
      const client = await pool.connect()
      
      try {
        // Lấy thông tin file trước khi xóa
        const fileInfo = await client.query(
          'SELECT file_path FROM documents WHERE id = $1',
          [id]
        )

        if (fileInfo.rows.length === 0) {
          return res.status(404).json({ message: 'Document not found' })
        }

        // Xóa file từ Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([fileInfo.rows[0].file_path])

        if (storageError) {
          console.error('Error deleting from storage:', storageError)
          return res.status(500).json({ message: 'Error deleting file from storage' })
        }

        // Xóa metadata từ database
        await client.query('DELETE FROM documents WHERE id = $1', [id])

        return res.status(200).json({ message: 'Document deleted successfully' })
      } finally {
        client.release()
      }
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 