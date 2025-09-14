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
    // 1. Verificar que el encabezado de autorización exista
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
    }

    // 2. Extraer y verificar el token JWT
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // 3. Buscar el registro del usuario en Airtable usando su ID
    const record = await base(tableName).find(userId);
    
    // 4. Limpiar datos sensibles antes de enviarlos al frontend
    // Nunca se deben enviar la contraseña hasheada ni la palabra clave.
    const { Clave, PalabraClave, ...safeFields } = record.fields;

    // 5. Enviar los datos del perfil limpios
    res.status(200).json({ id: record.id, fields: safeFields });

  } catch (error) {
    // 6. Manejar errores específicos de JWT (inválido o expirado)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado: Sesión inválida o expirada.' });
    }

    // Manejar otros errores del servidor
    console.error("Error en /api/getProfile:", error);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
  }
}