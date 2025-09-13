import Airtable from 'airtable';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  try {
    const records = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${email.toLowerCase()}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = records[0];
    const storedHash = user.get('Clave');
    const passwordIsValid = await bcrypt.compare(password, storedHash);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user.id,
        nombre: user.get('Nombre')
      }
    });

  } catch (error) {
    console.error("Error en /api/login:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}