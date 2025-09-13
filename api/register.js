import Airtable from 'airtable';
import bcrypt from 'bcryptjs';
import { isValidPhoneNumber } from 'libphonenumber-js';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    nombre,
    apellido,
    profesion,
    cargo,
    empresa,
    descripcion,
    telefono,
    correo,
    palabra_clave,
    clave,
    disponibilidad,
    mostrar_telefono,
  } = req.body;

  if (!nombre || !correo || !clave || !telefono) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }

  try {
    // --- NUEVO: Validación del formato del teléfono en el backend ---
    // Asumimos Venezuela ('VE') como país. Puedes cambiarlo si es necesario.
    if (!isValidPhoneNumber(telefono, 'VE')) {
      return res.status(400).json({ message: 'El formato del número de teléfono no es válido.' });
    }
    
    // Verificamos si el correo ya existe
    const existingRecords = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${correo.toLowerCase()}'`
    }).firstPage();

    if (existingRecords.length > 0) {
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(clave, 10);

    // Creamos el objeto 'fields' mapeando los nombres
    const fieldsToCreate = {
      "Nombre": nombre,
      "Apellido": apellido,
      "Profesion o Estudiante": profesion,
      "Cargo": cargo,
      "Empresa": empresa,
      "Descripcion de actividad": descripcion,
      "Telefono": telefono,
      "Correo": correo,
      "PalabraClave": palabra_clave,
      "Clave": hashedPassword,
      "Disponibilidad": disponibilidad,
      "Mostrar Telefono": mostrar_telefono,
    };

    // Creamos el nuevo registro en Airtable
    await base(tableName).create([{ fields: fieldsToCreate }]);

    res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });

  } catch (error) {
    console.error("Error en /api/register:", error);
    const errorMessage = error.message || 'Error interno del servidor.';
    res.status(500).json({ message: errorMessage });
  }
}