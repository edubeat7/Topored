import React from 'react';

function ProfileCard({ registro }) {
  // --- VALOR POR DEFECTO MODIFICADO ---
  const disponibilidad = registro['Disponibilidad'] || 'No disponible';
  
  // --- CLASE DE LA INSIGNIA MODIFICADA PARA SER NEUTRAL ---
  // Ahora siempre será gris, sin importar el estado.
  const badgeClass = 'bg-secondary';

  return (
    <div className="col-lg-4 col-md-6 d-flex align-items-stretch">
      <div className="card profile-card h-100 w-100">
        <div className="card-body">
          <div className="text-center">
            <h5 className="card-title mt-3">{registro.Nombre || ''} {registro.Apellido || ''}</h5>
            <h6 className="card-subtitle mb-2">{registro['Profesion o Estudiante'] || 'N/D'}</h6>
            
            {/* La insignia ahora muestra el texto completo del estado profesional */}
            <span className={`badge ${badgeClass} mb-2`}>{disponibilidad}</span>

            {/* --- MOSTRAR EL NUEVO CAMPO "EMPRESA" SI EXISTE --- */}
            {registro.Empresa && (
              <p className="card-text text-muted">{registro.Empresa}</p>
            )}

            <p className="card-text text-muted">{registro.Cargo || 'Sin cargo especificado'}</p>
          </div>
          
          <p className="card-description">
            {registro['Descripcion de actividad'] || 'Sin descripción.'}
          </p>
          <hr />
          <div className="contact-info">
            <p className="mb-1"><strong>Correo:</strong> {registro.Correo || 'N/D'}</p>
            {registro['Mostrar Telefono'] ? (
              <p className="mb-1"><strong>Teléfono:</strong> {registro.Telefono || 'N/D'}</p>
            ) : (
              <p className="mb-1 text-muted"><strong>Teléfono:</strong> Privado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;