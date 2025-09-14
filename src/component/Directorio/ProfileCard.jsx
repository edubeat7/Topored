import React from 'react';

function ProfileCard({ registro }) {
  const disponibilidad = registro['Disponibilidad'] || 'No disponible';
  const badgeClass = 'bg-secondary'; // Mantenemos la insignia neutral

  // --- LÓGICA PARA EL ENLACE DE WHATSAPP ---
  let whatsappLink = null;
  if (registro.Telefono) {
    // Limpiamos el número de teléfono: quitamos espacios, guiones, paréntesis y el '+'
    const cleanedPhoneNumber = registro.Telefono.replace(/[\s-()]/g, '').replace(/^\+/, '');
    whatsappLink = `https://wa.me/${cleanedPhoneNumber}`;
  }

  return (
    <div className="col-lg-4 col-md-6 d-flex align-items-stretch">
      <div className="card profile-card h-100 w-100">
        <div className="card-body">
          <div className="text-center">
            <h5 className="card-title mt-3">{registro.Nombre || ''} {registro.Apellido || ''}</h5>
            <h6 className="card-subtitle mb-2">{registro['Profesion o Estudiante'] || 'N/D'}</h6>
            
            <span className={`badge ${badgeClass} mb-2`}>{disponibilidad}</span>

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
            {/* --- CORREO CLICKEABLE --- */}
            <p className="mb-1">
              <strong>Correo:</strong> 
              {registro.Correo ? (
                <a href={`mailto:${registro.Correo}`} className="ms-1">{registro.Correo}</a>
              ) : (
                <span className="ms-1">N/D</span>
              )}
            </p>

            {/* --- NÚMERO DE WHATSAPP CLICKEABLE --- */}
            {registro['Mostrar Telefono'] ? (
              <p className="mb-1">
                <strong>Teléfono:</strong>
                {whatsappLink ? (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ms-1">
                    {registro.Telefono}
                  </a>
                ) : (
                  <span className="ms-1">N/D</span>
                )}
              </p>
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