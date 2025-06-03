import { NextApiRequest, NextApiResponse } from 'next'
import { decode } from 'jsonwebtoken'
import { supabase } from '../../../../lib/supabase'
import pool from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const client = await pool.connect()

  try {
    const decodedToken = decode(token) as { role: string; id: string } | null
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    switch (req.method) {
      case 'GET':
        const documents = await client.query(`
          SELECT 
            d.id,
            d.document_name,
            d.file_path,
            d.file_type,
            d.file_size_kb,
            d.uploaded_at,
            u.full_name as uploaded_by_name
          FROM documents d
          JOIN users u ON d.uploaded_by = u.id
          ORDER BY d.uploaded_at DESC
        `)

        // Get signed URLs for each document
        const documentsWithUrls = await Promise.all(
          documents.rows.map(async (doc) => {
            try {
              console.log('Getting signed URL for file:', doc.file_path)
              
              // Kiểm tra xem file có tồn tại không
              const { data: checkData, error: checkError } = await supabase.storage
                .from('documents')
                .list('', {
                  search: doc.file_path
                })

              if (checkError || !checkData?.length) {
                console.error('File not found in storage:', doc.file_path)
                return {
                  ...doc,
                  downloadUrl: null,
                }
              }

              const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.file_path, 60 * 60, {
                  download: doc.document_name // Sử dụng tên gốc của file khi tải xuống
                })

              if (error) {
                console.error('Error creating signed URL:', error)
                return {
                  ...doc,
                  downloadUrl: null,
                }
              }

              return {
                ...doc,
                downloadUrl: data?.signedUrl || null,
              }
            } catch (error) {
              console.error('Error processing file:', doc.file_path, error)
              return {
                ...doc,
                downloadUrl: null,
              }
            }
          })
        )

        return res.status(200).json(documentsWithUrls)

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
} 