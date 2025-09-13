import Airtable from 'airtable';
import jwt from 'jsonwebtoken';
import { isValidPhoneNumber } from 'libphonenumber-js'; // <-- 1. IMPORTAR LA LIBRERÍA

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
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

    const fieldsToUpdate = req.body;

    // --- 2. AÑADIR LA VALIDACIÓN DEL TELÉFONO EN EL BACKEND ---
    // Verificamos si el campo 'telefono' está presente en la petición antes de validarlo
    if (fieldsToUpdate.telefono) {
      if (!isValidPhoneNumber(fieldsToUpdate.telefono, 'VE')) {
        return res.status(400).json({ message: 'El formato del número de teléfono no es válido.' });
      }
    }

    // 3. Actualizar el registro en Airtable
    const updatedRecords = await base(tableName).update([
      {
        "id": userId,
        "fields": fieldsToUpdate
      }
    ]);

    res.status(200).json({ success: true, updatedRecord: updatedRecords[0] });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
    console.error("Error en /api/editProfile:", error);
    const errorMessage = error.message || 'Error al actualizar el perfil.';
    res.status(500).json({ message: errorMessage });
  }
}