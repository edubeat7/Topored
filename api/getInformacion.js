import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
// Asumimos que la tabla se llama 'TablaInformacion' como en tu JSX original.
// Si tiene otro nombre, ajústalo en tus variables de entorno.
const tableName = process.env.AIRTABLE_INFO_TABLE_NAME || 'TablaInformacion';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const records = await base(tableName).select({
      // Opcional: puedes ordenar la información, por ejemplo, por fecha de creación
      // sort: [{ field: 'Created', direction: 'desc' }]
    }).all();

    // Limpiamos los datos para enviar solo lo necesario al frontend
    const infoData = records.map(record => ({
      id: record.id,
      fields: {
        'Titulo': record.get('Titulo'),
        'Informacion': record.get('Informacion'),
        'Enlaces': record.get('Enlaces'),
      }
    }));

    res.status(200).json(infoData);

  } catch (error) {
    console.error("Error en /api/getInformacion:", error);
    res.status(500).json({ message: 'Error al obtener la información.' });
  }
}