const Airtable = require('airtable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

// ¡IMPORTANTE! Añade un secreto para tus tokens en las variables de entorno de Vercel
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

    // --- NUEVO: Generar el Token JWT ---
    // El token contiene el ID del usuario, que usaremos para identificarlo en otras peticiones.
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' }); // El token expira en 1 día

    res.status(200).json({
      success: true,
      token: token, // Enviamos el token al frontend
      user: {
        id: user.id,
        nombre: user.get('Nombre')
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}