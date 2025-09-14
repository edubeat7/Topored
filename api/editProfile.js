import Airtable from 'airtable';
import jwt from 'jsonwebtoken';
import { isValidPhoneNumber } from 'libphonenumber-js';

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

    // 2. Obtenemos los datos que vienen del frontend
    const requestBody = req.body;

    // 3. Validación del teléfono en el backend
    // Verificamos si el campo 'telefono' está presente en la petición antes de validarlo
    if (requestBody.telefono && !isValidPhoneNumber(requestBody.telefono, 'VE')) {
      return res.status(400).json({ message: 'El formato del número de teléfono no es válido.' });
    }
    
    // 4. Mapeo de campos para que coincidan con Airtable
    const fieldsToUpdateInAirtable = {
      "Nombre": requestBody.nombre,
      "Apellido": requestBody.apellido,
      "Profesion o Estudiante": requestBody.profesion,
      "Cargo": requestBody.cargo,
      "Empresa": requestBody.empresa,
      "Descripcion de actividad": requestBody.descripcion,
      "Telefono": requestBody.telefono,
      "Disponibilidad": requestBody.disponibilidad,
      "Mostrar Telefono": requestBody.mostrar_telefono,
    };


    // 5. Actualizar el registro en Airtable
    const updatedRecords = await base(tableName).update([
      {
        "id": userId,
        "fields": fieldsToUpdateInAirtable // Usamos el objeto con los nombres corregidos
      }
    ]);

    res.status(200).json({ success: true, updatedRecord: updatedRecords[0] });

  } catch (error) {
    // 6. Manejo de errores específico para JWT
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado: Sesión inválida o expirada.' });
    }
    
    // Manejo de otros errores del servidor
    console.error("Error en /api/editProfile:", error);
    const errorMessage = error.message || 'Error al actualizar el perfil.';
    res.status(500).json({ message: errorMessage });
  }
}