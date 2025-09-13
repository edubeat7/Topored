import Airtable from 'airtable';
import bcrypt from 'bcryptjs';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { correo, palabra_clave, nueva_clave } = req.body;

  try {
    const records = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${correo.toLowerCase()}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(404).json({ message: 'El correo electrónico no fue encontrado.' });
    }

    const user = records[0];
    const storedKeyword = user.get('PalabraClave');

    if (storedKeyword !== palabra_clave) {
      return res.status(401).json({ message: 'La palabra clave es incorrecta.' });
    }

    const hashedPassword = await bcrypt.hash(nueva_clave, 10);

    await base(tableName).update([
      {
        "id": user.id,
        "fields": { "Clave": hashedPassword }
      }
    ]);

    res.status(200).json({ success: true, message: 'Contraseña actualizada con éxito.' });

  } catch (error) {
    console.error("Error en /api/resetPassword:", error);
    res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
}