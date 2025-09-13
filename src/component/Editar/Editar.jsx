import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import './Editar.css';

function EditarPerfil() {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    profesion: '',
    cargo: '',
    empresa: '',
    descripcion: '',
    telefono: '',
    correo: '',
    disponibilidad: 'Ofreciendo servicios',
    mostrar_telefono: false
  });
  
  const [profesiones, setProfesiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/login');
      return;
    }

    // Función para obtener los datos del perfil del usuario logueado
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/getProfile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) history.push('/login');
          throw new Error('No se pudieron cargar los datos del perfil.');
        }

        const data = await response.json();
        setUserData({
          nombre: data.fields.Nombre || '',
          apellido: data.fields.Apellido || '',
          profesion: data.fields['Profesion o Estudiante'] || '',
          cargo: data.fields.Cargo || '',
          empresa: data.fields.Empresa || '',
          descripcion: data.fields['Descripcion de actividad'] || '',
          telefono: data.fields.Telefono || '',
          correo: data.fields.Correo || '',
          disponibilidad: data.fields.Disponibilidad || 'Ofreciendo servicios',
          mostrar_telefono: data.fields['Mostrar Telefono'] || false
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Función para obtener la lista de profesiones
    const fetchProfesiones = async () => {
        try {
            const response = await fetch('/api/getDirectory');
            if (!response.ok) return;
            const data = await response.json();
            const uniqueProfesiones = [...new Set(data.map(r => r.fields['Profesion o Estudiante']).filter(Boolean))];
            setProfesiones(uniqueProfesiones.sort());
        } catch (err) {
            console.error("No se pudieron cargar las profesiones.");
        }
    };

    fetchUserData();
    fetchProfesiones();
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // **Validación de formato del teléfono en el frontend**
    // Asumimos Venezuela ('VE'). Cámbialo si es necesario.
    if (!isValidPhoneNumber(userData.telefono || '', 'VE')) {
      setError('Por favor, introduce un número de teléfono válido (ej: +584141234567).');
      setIsLoading(false);
      return; // Detenemos el envío si no es válido
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
      setIsLoading(false);
      return;
    }
    
    const { correo, ...fieldsToUpdate } = userData;

    try {
      const response = await fetch('/api/editProfile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fieldsToUpdate)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil.');

      setSuccess('Perfil actualizado correctamente.');
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.nombre !== userData.nombre) {
          user.nombre = userData.nombre;
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('storage'));
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar la cuenta.');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      history.push('/');
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading && !userData.nombre) {
    return (
      <main className="page-container text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="edit-card">
        <h2 className="text-center fw-bold mb-4">Editar mi Perfil</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input type="text" className="form-control" id="nombre" name="nombre" value={userData.nombre} onChange={handleInputChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="apellido" className="form-label">Apellido</label>
                <input type="text" className="form-control" id="apellido" name="apellido" value={userData.apellido} onChange={handleInputChange} required />
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="profesion" className="form-label">Profesión o Estudiante</label>
              <select className="form-select" id="profesion" name="profesion" value={userData.profesion} onChange={handleInputChange} required >
                <option value="">Selecciona una opción</option>
                {profesiones.map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="cargo" className="form-label">Cargo Actual (Opcional)</label>
              <input type="text" className="form-control" id="cargo" name="cargo" value={userData.cargo} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label htmlFor="empresa" className="form-label">Empresa o Lugar de Estudio (Opcional)</label>
              <input type="text" className="form-control" id="empresa" name="empresa" value={userData.empresa} onChange={handleInputChange} />
            </div>
            
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción de Actividad</label>
              <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={userData.descripcion} onChange={handleInputChange} ></textarea>
            </div>
            
            <div className="mb-3">
              <label htmlFor="disponibilidad" className="form-label">Estado Profesional</label>
              <select className="form-select" id="disponibilidad" name="disponibilidad" value={userData.disponibilidad} onChange={handleInputChange} required>
                  <option value="Ofreciendo servicios">Ofreciendo servicios</option>
                  <option value="Busca trabajo">Busca trabajo</option>
                  <option value="No disponible">No disponible</option>
                  <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input type="tel" className="form-control" id="telefono" name="telefono" value={userData.telefono} onChange={handleInputChange} required placeholder="+584141234567" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo Electrónico (No se puede cambiar)</label>
              <input type="email" className="form-control" id="correo" name="correo" value={userData.correo} readOnly disabled/>
            </div>

            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" name="mostrar_telefono" id="mostrar_telefono" checked={userData.mostrar_telefono} onChange={handleInputChange} />
              <label className="form-check-label" htmlFor="mostrar_telefono">
                Hacer mi número de teléfono visible públicamente.
              </label>
            </div>
            
            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
        </form>
        
        <hr className="my-4" />
          
        <div className="text-center">
          <h4 className="text-danger">Zona de Peligro</h4>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
          <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)} >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación de Cuenta</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar tu cuenta permanentemente? Esta acción es irreversible.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={isLoading}>
                  {isLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default EditarPerfil;