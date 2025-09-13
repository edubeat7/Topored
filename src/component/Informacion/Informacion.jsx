import React, { useState, useEffect } from 'react';
import './Informacion.css'; // Estilos específicos para esta página

function InformacionPage() {
  const [informacion, setInformacion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInformacion = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // La URL ahora apunta a nuestro propio backend seguro
        const response = await fetch('/api/getInformacion');

        if (!response.ok) {
          throw new Error('Hubo un problema al conectar con la base de datos.');
        }

        const data = await response.json();
        // El backend ya nos da los datos en el formato que necesitamos
        setInformacion(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInformacion();
  }, []); // El array vacío asegura que la llamada se haga solo una vez

  if (isLoading) {
    return (
      <main className="page-container text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando información de interés...</p>
      </main>
    );
  }

  if (error) {
    return (
        <main className="page-container">
            <div className="alert alert-danger text-center">
                <strong>Error:</strong> {error}
            </div>
        </main>
    );
  }

  return (
    <main className="page-container">
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
    </main>
  );
}

export default InformacionPage;