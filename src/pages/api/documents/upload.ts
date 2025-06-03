import { NextApiRequest, NextApiResponse } from 'next'
import { decode } from 'jsonwebtoken'
import { supabase } from '../../../../lib/supabase'
import pool from '../../../../lib/db'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decodedToken = decode(token) as { role: string; id: string } | null
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Chỉ TRUONGBAN mới được upload file
    if (decodedToken.role !== 'TRUONGBAN') {
      return res.status(403).json({ message: 'Only TRUONGBAN can upload documents' })
    }

    const { file, fileName, fileType } = req.body

    if (!file || !fileName || !fileType) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Xử lý file type để đảm bảo không vượt quá 50 ký tự
    const simplifiedFileType = fileType.split(';')[0].substring(0, 50)
    
    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueFileName = `${Date.now()}_${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(uniqueFileName, Buffer.from(file, 'base64'), {
        contentType: fileType,
        cacheControl: '3600',
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return res.status(500).json({ message: 'Error uploading file to storage' })
    }

    // Save file metadata to database
    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO documents (
          document_name,
          file_path,
          file_type,
          file_size_kb,
          uploaded_by,
          uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id, document_name, file_type, file_size_kb, uploaded_at`,
        [
          fileName.substring(0, 255), // Giới hạn độ dài tên file
          uniqueFileName, // Lưu tên file duy nhất
          simplifiedFileType, // Sử dụng file type đã được xử lý
          Math.round(Buffer.from(file, 'base64').length / 1024), // Convert bytes to KB
          decodedToken.id,
        ]
      )

      return res.status(200).json({
        message: 'File uploaded successfully',
        document: result.rows[0],
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error handling file upload:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 