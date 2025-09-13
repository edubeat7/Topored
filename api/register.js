import Airtable from 'airtable';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidPhoneNumber } from 'libphonenumber-js';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET; // Necesitarás el mismo secreto que en el login

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Ahora esperamos un token temporal y el código OTP
  const { verificationToken, otp } = req.body;

  if (!verificationToken || !otp) {
    return res.status(400).json({ message: 'Faltan el token de verificación o el código.' });
  }

  try {
    // 1. Verificar el token temporal que contiene los datos del usuario y el código OTP hasheado
    const decoded = jwt.verify(verificationToken, JWT_SECRET);
    const { userData, otpHash } = decoded;

    // Comparamos el OTP enviado por el usuario con el hash que guardamos en el token
    const isOtpValid = await bcrypt.compare(otp, otpHash);

    if (!isOtpValid) {
      return res.status(401).json({ message: 'El código de verificación es incorrecto.' });
    }

    // 2. Si el código es válido, procedemos a registrar al usuario
    const { correo, clave, telefono } = userData;

    // Verificación adicional de seguridad en el backend
    if (!isValidPhoneNumber(telefono || '', 'VE')) { // Asumiendo Venezuela como país por defecto
        return res.status(400).json({ message: 'El número de teléfono no es válido.' });
    }
    
    // Verificamos (de nuevo) si el correo ya existe, por si acaso
    const existingRecords = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${correo.toLowerCase()}'`
    }).firstPage();

    if (existingRecords.length > 0) {
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    // Hasheamos la contraseña real del usuario
    const hashedPassword = await bcrypt.hash(clave, 10);

    const fieldsToCreate = {
      "Nombre": userData.nombre,
      "Apellido": userData.apellido,
      "Profesion o Estudiante": userData.profesion,
      "Cargo": userData.cargo,
      "Empresa": userData.empresa,
      "Descripcion de actividad": userData.descripcion,
      "Telefono": telefono,
      "Correo": correo,
      "PalabraClave": userData.palabra_clave,
      "Clave": hashedPassword,
      "Disponibilidad": userData.disponibilidad,
      "Mostrar Telefono": userData.mostrar_telefono,
    };

    await base(tableName).create([{ fields: fieldsToCreate }]);

    res.status(201).json({ success: true, message: 'Usuario verificado y registrado con éxito.' });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'El código de verificación ha expirado. Por favor, solicita uno nuevo.' });
    }
    console.error("Error en /api/register:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}