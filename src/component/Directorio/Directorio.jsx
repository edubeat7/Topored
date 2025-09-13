import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard'; // Importamos el componente de la tarjeta
import './Directorio.css'; // Importamos los estilos



// Carga las credenciales desde el archivo .env
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

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
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
        });
        if (!response.ok) throw new Error('Error al cargar los datos.');

        const data = await response.json();
        const records = data.records || [];
        setAllRecords(records);
        setDisplayedRecords(records);

        // Extraer y ordenar las profesiones únicas para el filtro
        const uniqueProfesiones = [...new Set(records.map(r => r.fields['Profesion o Estudiante']))];
        setProfesiones(uniqueProfesiones.sort());

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

  const handleFilter = (e) => {
    e.preventDefault();
    if (!selectedProfesion) {
      setDisplayedRecords(allRecords);
    } else {
      const filtered = allRecords.filter(r => r.fields['Profesion o Estudiante'] === selectedProfesion);
      setDisplayedRecords(filtered);
    }
  };
  
  const clearFilter = () => {
      setSelectedProfesion('');
      setDisplayedRecords(allRecords);
  };

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="text-center mb-5">
      
        <h1 className="display-5 fw-bold">Nuestro Directorio</h1>
        <p className="lead text-muted">Encuentra y conecta con profesionales de diversas áreas.</p>
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
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!isLoading && !error && (
        <div className="row g-4">
          {displayedRecords.length > 0 ? (
            displayedRecords.map(registro => (
              <ProfileCard key={registro.id} registro={registro.fields} />
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                No se encontraron registros que coincidan con la búsqueda.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DirectoryPage;