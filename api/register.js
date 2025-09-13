const Airtable = require('airtable');
const bcrypt = require('bcryptjs');

// Configuración de Airtable usando variables de entorno del servidor
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export default async function handler(req, res) {
  // Asegurarnos de que solo se acepten peticiones POST
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

  // Validación básica de campos requeridos
  if (!nombre || !apellido || !correo || !clave || !palabra_clave) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }

  try {
    // --- PASO 1: VERIFICAR SI EL CORREO YA EXISTE EN AIRTABLE ---
    const existingRecords = await base(tableName).select({
      maxRecords: 1,
      filterByFormula: `LOWER({Correo}) = '${correo.toLowerCase()}'`
    }).firstPage();

    if (existingRecords.length > 0) {
      // Usamos el código de estado 409 (Conflict) para indicar un duplicado
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    // --- PASO 2: HASHEAR LA CONTRASEÑA ANTES DE GUARDARLA ---
    // El "10" es el "costo" o número de rondas de hashing. Es un valor estándar y seguro.
    const hashedPassword = await bcrypt.hash(clave, 10);

    // --- PASO 3: CREAR EL NUEVO REGISTRO EN AIRTABLE ---
    const createdRecord = await base(tableName).create([
      {
        fields: {
          "Nombre": nombre,
          "Apellido": apellido,
          "Profesion o Estudiante": profesion,
          "Cargo": cargo,
          "Empresa": empresa,
          "Descripcion de actividad": descripcion,
          "Telefono": telefono,
          "Correo": correo,
          "PalabraClave": palabra_clave,
          // ¡IMPORTANTE! Guardamos la contraseña hasheada, no la original.
          "Clave": hashedPassword,
          "Disponibilidad": disponibilidad,
          "Mostrar Telefono": mostrar_telefono,
        }
      }
    ]);

    // --- PASO 4: ENVIAR RESPUESTA DE ÉXITO ---
    // Usamos el código 201 (Created) para indicar que se creó un nuevo recurso.
    res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}