import Airtable from 'airtable';
import jwt from 'jsonwebtoken';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
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

    // 2. Obtenemos los datos del cuerpo de la petición
    const {
      nombre,
      apellido,
      profesion,
      cargo,
      empresa,
      descripcion,
      telefono,
      disponibilidad,
      mostrar_telefono
    } = req.body;

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Creamos un nuevo objeto traduciendo los nombres de los campos
    // a los nombres exactos de las columnas en Airtable.
    const fieldsToUpdateInAirtable = {
      "Nombre": nombre,
      "Apellido": apellido,
      "Profesion o Estudiante": profesion,
      "Cargo": cargo,
      "Empresa": empresa,
      "Descripcion de actividad": descripcion,
      "Telefono": telefono,
      "Disponibilidad": disponibilidad,
      "Mostrar Telefono": mostrar_telefono,
    };

    // 3. Actualizar el registro en Airtable
    const updatedRecords = await base(tableName).update([
      {
        "id": userId, // Usamos el ID del token para la seguridad
        "fields": fieldsToUpdateInAirtable // Usamos el objeto con los nombres corregidos
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