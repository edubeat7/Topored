const Airtable = require('airtable');
const jwt = require('jsonwebtoken');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- 1. Verificar el Token de Autenticación ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; // Obtenemos el ID del usuario desde el token

    // --- 2. Actualizar el registro en Airtable ---
    // Los datos a actualizar vienen en el cuerpo de la petición
    const fieldsToUpdate = req.body;

    const updatedRecords = await base(tableName).update([
      {
        "id": userId, // Usamos el ID del token para asegurar que el usuario solo se edite a sí mismo
        "fields": fieldsToUpdate
      }
    ]);

    res.status(200).json({ success: true, updatedRecord: updatedRecords[0] });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el perfil.' });
  }
}