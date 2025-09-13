import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard'; // Componente para la tarjeta de perfil
import './Directorio.css'; // Estilos específicos del directorio

function DirectoryPage() {
  const [allRecords, setAllRecords] = useState([]);
  const [displayedRecords, setDisplayedRecords] = useState([]);
  const [profesiones, setProfesiones] = useState([]);
  const [selectedProfesion, setSelectedProfesion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError('');

      try {
        // La URL ahora apunta a nuestro propio backend seguro
        const response = await fetch('/api/getDirectory');
        
        if (!response.ok) {
          throw new Error('No se pudo cargar el directorio. Inténtalo de nuevo más tarde.');
        }

        const data = await response.json(); // El backend devuelve un array de registros
        
        setAllRecords(data);
        setDisplayedRecords(data);

        // Extraer y ordenar las profesiones únicas para el menú de filtro
        const uniqueProfesiones = [...new Set(
          data.map(record => record.fields['Profesion o Estudiante']).filter(Boolean) // .filter(Boolean) evita valores nulos o vacíos
        )];
        setProfesiones(uniqueProfesiones.sort());

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  // Filtra los registros localmente sin necesidad de llamar a la API de nuevo
  const handleFilter = (e) => {
    e.preventDefault();
    if (!selectedProfesion) {
      setDisplayedRecords(allRecords);
    } else {
      const filtered = allRecords.filter(record => record.fields['Profesion o Estudiante'] === selectedProfesion);
      setDisplayedRecords(filtered);
    }
  };
  
  // Limpia el filtro y muestra todos los registros de nuevo
  const clearFilter = () => {
      setSelectedProfesion('');
      setDisplayedRecords(allRecords);
  };

  return (
    // Usamos el contenedor principal definido en el App.css global
    <main className="page-container">
      <div className="directory-header text-center mb-5">
        <h1 className="display-5 fw-bold">Nuestro Directorio</h1>
        <p className="lead text-muted">Encuentra y conecta con profesionales de nuestra comunidad.</p>
      </div>

      <div className="filter-section">
        <form onSubmit={handleFilter}>
          <div className="row align-items-end">
            <div className="col-md-5">
              <label htmlFor="profesion" className="form-label fw-bold">Filtrar por Profesión</label>
              <select 
                name="profesion" 
                id="profesion" 
                className="form-select"
                value={selectedProfesion}
                onChange={e => setSelectedProfesion(e.target.value)}
              >
                <option value="">Todas las profesiones</option>
                {profesiones.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-primary w-100">Filtrar</button>
            </div>
            <div className="col-md-3">
              <button type="button" onClick={clearFilter} className="btn btn-outline-secondary w-100">Limpiar Filtro</button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && <p className="text-center">Cargando directorio...</p>}
      {error && <div className="alert alert-danger text-center">{error}</div>}
      
      {!isLoading && !error && (
        <div className="row g-4">
          {displayedRecords.length > 0 ? (
            displayedRecords.map(registro => (
              // Pasamos los campos del registro a cada tarjeta
              <ProfileCard key={registro.id} registro={registro.fields} />
            ))
          ) : (
            <div className="col-12">
              <div className="no-results-alert">
                No se encontraron registros que coincidan con la búsqueda.
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default DirectoryPage;