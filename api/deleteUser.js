import Airtable from 'airtable';
import jwt from 'jsonwebtoken';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Verificar que el encabezado de autorización exista
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
    }

    // 2. Extraer y verificar el token JWT para obtener el ID del usuario
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 3. Eliminar el registro del usuario en Airtable usando su ID
    await base(tableName).destroy([userId]);

    // 4. Enviar una respuesta de éxito
    res.status(200).json({ success: true, message: 'Usuario eliminado con éxito.' });

  } catch (error) {
    // 5. Manejar errores específicos de JWT (inválido o expirado)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado: Sesión inválida o expirada.' });
    }
    
    // Manejar otros errores del servidor
    console.error("Error en /api/deleteUser:", error);
    res.status(500).json({ message: 'Error al eliminar la cuenta.' });
  }
}