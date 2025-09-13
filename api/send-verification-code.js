// api/send-verification-code.js

import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { isValidPhoneNumber } from 'libphonenumber-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userData = req.body;

  try {
    // 1. Validar el número de teléfono
    if (!isValidPhoneNumber(userData.telefono || '', 'VE')) { // Código de país de Venezuela
        return res.status(400).json({ message: 'El formato del número de teléfono no es válido.' });
    }

    // 2. Generar un código OTP seguro
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // 3. Crear un token JWT temporal que contenga los datos del usuario y el hash del OTP
    // Este token expira en 10 minutos.
    const verificationToken = jwt.sign({ userData, otpHash }, JWT_SECRET, { expiresIn: '10m' });

    // 4. Enviar el correo con Resend
    await resend.emails.send({
      from: 'noreply@tudominioverificado.com', // ¡IMPORTANTE! Usa tu dominio verificado
      to: userData.correo,
      subject: 'Tu código de verificación para Topored',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Verificación de Cuenta</h2>
          <p>Hola ${userData.nombre},</p>
          <p>Usa el siguiente código para completar tu registro en Topored. El código es válido por 10 minutos.</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f1f5f9; border-radius: 8px;">
            ${otp}
          </p>
        </div>
      `,
    });

    // 5. Enviar el token temporal de vuelta al frontend
    res.status(200).json({ success: true, verificationToken });

  } catch (error) {
    console.error("Error al enviar código:", error);
    res.status(500).json({ message: 'No se pudo enviar el código de verificación.' });
  }
}