import React, { useState } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import './Registro.css';

const PROFESIONES = [
    "Administracion", "Agronomia", "Antropologia", "Arquitectura", "Artes",
    "Bibliotecologia", "Bioanalisis", "Biologia", "Ciencias Actuariales",
    "Computacion", "Contaduria", "Derecho", "Economia", "Educacion",
    "Enfermeria", "Estadistica", "Estudios Internacionales", "Farmacia",
    "Filosofia", "Fisica", "Geografia", "Geologia", "Geoquimica", "Historia",
    "Idiomas Modernos", "Ingenieria Civil", "Ingenieria Electrica",
    "Ingenieria Geologica", "Ingenieria de Minas", "Ingenieria Mecanica",
    "Ingenieria Metalurgica", "Ingenieria de Petroleo", "Ingenieria Quimica",
    "Letras", "Matematica", "Medicina", "Medicina Veterinaria",
    "Nutricion y Dietetica", "Odontologia", "Psicologia", "Quimica",
    "Salud Publica", "Sociologia", "Trabajo Social", "Traduccion",
    "Traduccion e Interpretacion", "Urbanismo", "Estudiante", "Otros"
];

function RegistrationPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    profesion: '',
    cargo: '',
    empresa: '',
    descripcion: '',
    telefono: '',
    correo: '',
    palabra_clave: '',
    clave: '',
    disponibilidad: 'Ofreciendo servicios',
    mostrar_telefono: true,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validación del formato del teléfono en el frontend
    if (!isValidPhoneNumber(formData.telefono || '', 'VE')) {
      setError('Por favor, introduce un número de teléfono válido (ej: +584141234567).');
      setIsLoading(false);
      return;
    }

    try {
      // La URL apunta al backend de registro de un solo paso
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la cuenta.');
      }

      setSuccess('¡Registro exitoso! Serás redirigido al login.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="full-screen-container">
      <div className="registration-card">
        <div className="registration-header">
          <h2 className="fw-bold">Crear una Cuenta</h2>
          <p>Únete a nuestra comunidad profesional.</p>
        </div>
        
        <div className="security-info-box">
          <h4>Tu Seguridad, Nuestra Prioridad</h4>
          <div className="info-item">
            <span className="info-icon">🔐</span>
            <div className="info-text">
              <strong>Contraseñas Cifradas</strong>
              <p>Tu contraseña se transforma en un código ilegible. Nadie, ni siquiera nosotros, tiene acceso a ella.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🛡️</span>
            <div className="info-text">
              <strong>Datos Protegidos</strong>
              <p>Toda tu información se almacena en una infraestructura segura para proteger tu privacidad en todo momento.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🤝</span>
            <div className="info-text">
              <strong>Comunidad Exclusiva</strong>
              <p>Esta es una red privada y de confianza, accesible únicamente para los miembros de nuestra comunidad de egresados.</p>
            </div>
          </div>
          <p className="info-footer">¡Únete con total tranquilidad y empieza a conectar!</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="apellido" className="form-label">Apellido</label>
              <input type="text" className="form-control" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="profesion" className="form-label">Profesión o Estudiante</label>
            <select className="form-select" id="profesion" name="profesion" value={formData.profesion} onChange={handleChange} required>
              <option value="" disabled>Selecciona una opción</option>
              {PROFESIONES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="mb-3">
              <label htmlFor="cargo" className="form-label">Cargo Actual (Opcional)</label>
              <input type="text" className="form-control" id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Desarrollador Frontend"/>
          </div>

          <div className="mb-3">
              <label htmlFor="empresa" className="form-label">Empresa o Lugar de Estudio (Opcional)</label>
              <input type="text" className="form-control" id="empresa" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej: Google, UCV"/>
          </div>
          
          <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción de Actividad</label>
              <textarea className="form-control" id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" placeholder="Describe brevemente tu actividad profesional..."></textarea>
          </div>

          <div className="mb-3">
              <label htmlFor="disponibilidad" className="form-label">Estado Profesional</label>
              <select className="form-select" id="disponibilidad" name="disponibilidad" value={formData.disponibilidad} onChange={handleChange} required>
                  <option value="Ofreciendo servicios">Ofreciendo servicios</option>
                  <option value="Busca trabajo">Busca trabajo</option>
                  <option value="No disponible">No disponible</option>
                  <option value="Otro">Otro</option>
              </select>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input type="tel" className="form-control" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="+584141234567" />
            </div>
             <div className="col-md-6 mb-3">
                <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                <input type="email" className="form-control" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
              <label htmlFor="palabra_clave" className="form-label">Palabra Clave (para recuperar cuenta)</label>
              <input type="text" className="form-control" id="palabra_clave" name="palabra_clave" value={formData.palabra_clave} onChange={handleChange} required />
          </div>
          <div className="mb-3">
              <label htmlFor="clave" className="form-label">Contraseña</label>
              <input type="password" className="form-control" id="clave" name="clave" value={formData.clave} onChange={handleChange} required />
          </div>
          <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" name="mostrar_telefono" id="mostrar_telefono" checked={formData.mostrar_telefono} onChange={handleChange} />
              <label className="form-check-label" htmlFor="mostrar_telefono">
                  Hacer mi número de teléfono visible públicamente.
              </label>
          </div>
          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationPage;