const Airtable = require('airtable');
const jwt = require('jsonwebtoken');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Verificar el Token de Autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; // Obtenemos el ID del usuario desde el token

    // 2. Eliminar el registro en Airtable
    const deletedRecords = await base(tableName).destroy([userId]);

    res.status(200).json({ success: true, message: 'Usuario eliminado con éxito.' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la cuenta.' });
  }
}