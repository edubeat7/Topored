import React, { useState, useEffect } from 'react';
import './Informacion.css'; // Estilos específicos para esta página

// Carga las credenciales desde tu archivo .env
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'TablaInformacion'; // Asegúrate que este es el nombre de tu tabla

function InformacionPage() {
  const [informacion, setInformacion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInformacion = async () => {
      setIsLoading(true);
      setError(null); // Limpia errores previos
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        });

        if (!response.ok) {
          throw new Error('Hubo un problema al conectar con la base de datos.');
        }

        const data = await response.json();
        setInformacion(data.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInformacion();
  }, []); // El array vacío asegura que la llamada a la API se haga solo una vez

  // --- Renderizado mientras carga la información ---
  if (isLoading) {
    return (
      <div className="container page-container text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando información de interés...</p>
      </div>
    );
  }

  // --- Renderizado en caso de error ---
  if (error) {
    return (
        <div className="container page-container">
            <div className="alert alert-danger text-center">
                <strong>Error:</strong> {error}
            </div>
        </div>
    );
  }

  // --- Renderizado principal ---
  return (
    <div className="container page-container">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Información de Interés</h1>
        <p className="lead text-muted">Recursos y enlaces útiles para nuestra comunidad profesional.</p>
      </div>

      {informacion.length > 0 ? (
        informacion.map(item => (
          <div key={item.id} className="card info-card">
            <div className="card-header">
              {item.fields.Titulo || 'Sin Título'}
            </div>
            <div className="card-body">
              <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                {item.fields.Informacion || 'No hay información disponible.'}
              </p>
            </div>
            {item.fields.Enlaces && (
              <div className="card-footer text-muted">
                <strong>Enlace de interés:</strong> 
                <a href={item.fields.Enlaces} target="_blank" rel="noopener noreferrer">
                  {item.fields.Enlaces}
                </a>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="alert alert-info text-center">
          Actualmente no hay información para mostrar.
        </div>
      )}
    </div>
  );
}

export default InformacionPage;