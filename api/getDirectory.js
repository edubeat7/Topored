import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const records = await base(tableName).select({
      sort: [{ field: 'Nombre', direction: 'asc' }]
    }).all();

    const safeRecords = records.map(record => ({
      id: record.id,
      fields: {
        'Nombre': record.get('Nombre'),
        'Apellido': record.get('Apellido'),
        'Profesion o Estudiante': record.get('Profesion o Estudiante'),
        'Cargo': record.get('Cargo'),
        'Empresa': record.get('Empresa'),
        'Descripcion de actividad': record.get('Descripcion de actividad'),
        'Telefono': record.get('Telefono'),
        'Correo': record.get('Correo'),
        'Disponibilidad': record.get('Disponibilidad'),
        'Mostrar Telefono': record.get('Mostrar Telefono'),
      }
    }));

    res.status(200).json(safeRecords);

  } catch (error) {
    console.error("Error en /api/getDirectory:", error);
    res.status(500).json({ message: 'Error al obtener el directorio.' });
  }
}