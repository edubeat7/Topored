import Airtable from 'airtable';
import bcrypt from 'bcryptjs';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    nombre,
    apellido,
    correo,
    clave,
    palabra_clave,
    ...otherFields
  } = req.body;

  if (!nombre || !apellido || !correo || !clave || !palabra_clave) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }

  try {
    const existingRecords = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${correo.toLowerCase()}'`
    }).firstPage();

    if (existingRecords.length > 0) {
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(clave, 10);

    await base(tableName).create([
      {
        fields: {
          "Nombre": nombre,
          "Apellido": apellido,
          "Correo": correo,
          "PalabraClave": palabra_clave,
          ...otherFields,
          "Clave": hashedPassword,
        }
      }
    ]);

    res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });

  } catch (error) {
    console.error("Error en /api/register:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}