import Airtable from 'airtable';
import jwt from 'jsonwebtoken';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const record = await base(tableName).find(userId);
    
    // Limpiamos datos sensibles antes de enviarlos
    const { Clave, PalabraClave, ...safeFields } = record.fields;

    res.status(200).json({ id: record.id, fields: safeFields });

  } catch (error) {
    console.error("Error en /api/getProfile:", error);
    res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
}