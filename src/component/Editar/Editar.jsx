import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Editar.css';

// ... (constantes de Airtable se mantienen igual)
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;


function EditarPerfil() {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    profesion: '',
    cargo: '',
    // --- NUEVO CAMPO AÑADIDO ---
    empresa: '',
    descripcion: '',
    telefono: '',
    correo: '',
    // --- VALOR INICIAL MODIFICADO ---
    disponibilidad: 'Ofreciendo servicios',
    mostrar_telefono: false
  });
  
  // ... (el resto de los useState se mantienen igual)
  const [profesiones, setProfesiones] = useState([]);
  const [claveActual, setClaveActual] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claveConfirmacion, setClaveConfirmacion] = useState('');
  const history = useHistory();


  useEffect(() => {
    // ... (lógica para obtener el usuario del localStorage se mantiene igual)
    const userString = localStorage.getItem('user');
    if (!userString) {
      history.push('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (!user.id) {
      history.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${user.id}`;
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
        });

        if (!response.ok) throw new Error('Error al cargar los datos del usuario.');

        const data = await response.json();
        setUserData({
          nombre: data.fields.Nombre || '',
          apellido: data.fields.Apellido || '',
          profesion: data.fields['Profesion o Estudiante'] || '',
          cargo: data.fields.Cargo || '',
          // --- OBTENER EL NUEVO CAMPO DE AIRTABLE ---
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
    
    // ... (fetchProfesiones se mantiene igual)
    const fetchProfesiones = async () => {
        try {
          const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
          });
  
          if (!response.ok) throw new Error('Error al cargar las profesiones.');
  
          const data = await response.json();
          const uniqueProfesiones = [...new Set(data.records.map(r => r.fields['Profesion o Estudiante']))];
          setProfesiones(uniqueProfesiones.sort());
        } catch (err) {
          console.error('Error al cargar profesiones:', err);
        }
      };

    fetchUserData();
    fetchProfesiones();
  }, [history]);

  const handleInputChange = (e) => {
    // ... (esta función se mantiene igual)
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (lógica inicial de handleSubmit se mantiene igual)
    setIsLoading(true);
    setError('');
    setSuccess('');


    try {
        if (!claveActual) {
            throw new Error('Debes ingresar tu contraseña actual para confirmar los cambios.');
          }
    
          const userString = localStorage.getItem('user');
          if (!userString) throw new Error('No se encontró información de usuario.');
          
          const user = JSON.parse(userString);
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${user.id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Nombre': userData.nombre,
            'Apellido': userData.apellido,
            'Profesion o Estudiante': userData.profesion,
            'Cargo': userData.cargo,
            // --- ENVIAR EL NUEVO CAMPO A AIRTABLE ---
            'Empresa': userData.empresa,
            'Descripcion de actividad': userData.descripcion,
            'Telefono': userData.telefono,
            'Disponibilidad': userData.disponibilidad,
            'Mostrar Telefono': userData.mostrar_telefono
          }
        })
      });

      if (!response.ok) throw new Error('Error al actualizar los datos.');

      setSuccess('Perfil actualizado correctamente.');
      // ... (resto de la lógica de éxito se mantiene igual)
      setClaveActual('');
      
      const updatedUser = {
        ...user,
        nombre: userData.nombre
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event('storage'));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (handleDeleteAccount y el resto del componente se mantienen igual)
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!claveConfirmacion) {
        throw new Error('Debes ingresar tu contraseña para confirmar la eliminación.');
      }

      const userString = localStorage.getItem('user');
      if (!userString) throw new Error('No se encontró información de usuario.');
      
      const user = JSON.parse(userString);
      
      // Eliminar cuenta en Airtable
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${user.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar la cuenta.');

      // Limpiar localStorage y redirigir al inicio
      localStorage.removeItem('user');
      history.push('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading && !userData.nombre) {
    // ...
  }

  return (
    <main className="page-container">
      <div className="edit-card">
        <h2 className="text-center fw-bold mb-4">Editar mi Perfil</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* ... (campos de Nombre, Apellido, Profesión se mantienen igual) ... */}
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
            <label htmlFor="cargo" className="form-label">Cargo Actual</label>
            <input type="text" className="form-control" id="cargo" name="cargo" value={userData.cargo} onChange={handleInputChange} />
          </div>

          {/* --- NUEVO CAMPO EN EL FORMULARIO --- */}
          <div className="mb-3">
            <label htmlFor="empresa" className="form-label">Empresa o Lugar de Trabajo/Estudio</label>
            <input type="text" className="form-control" id="empresa" name="empresa" value={userData.empresa} onChange={handleInputChange} />
          </div>
          
          {/* ... (campo de Descripción se mantiene igual) ... */}
          <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción de actividad</label>
              <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={userData.descripcion} onChange={handleInputChange} ></textarea>
            </div>

          {/* --- CAMPO DE DISPONIBILIDAD MODIFICADO --- */}
          <div className="mb-3">
            <label htmlFor="disponibilidad" className="form-label">Estado Profesional</label>
            <select className="form-select" id="disponibilidad" name="disponibilidad" value={userData.disponibilidad} onChange={handleInputChange} required>
                <option value="Ofreciendo servicios">Ofreciendo servicios</option>
                <option value="Busca trabajo">Busca trabajo</option>
                <option value="No disponible">No disponible</option>
                <option value="Otro">Otro</option>
            </select>
          </div>

          {/* ... (resto de campos y botones se mantienen igual) ... */}
          <div className="mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input type="tel" className="form-control" id="telefono" name="telefono" value={userData.telefono} onChange={handleInputChange} required  />
            </div>
            
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo Electrónico (No se puede cambiar)</label>
              <input type="email" className="form-control" id="correo" name="correo" value={userData.correo} readOnly />
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" name="mostrar_telefono" id="mostrar_telefono" checked={userData.mostrar_telefono} onChange={handleInputChange} />
              <label className="form-check-label" htmlFor="mostrar_telefono">
                Hacer mi número de teléfono visible públicamente.
              </label>
            </div>
            <hr className="my-4" />
            <div className="mb-3">
              <label htmlFor="clave_actual" className="form-label">Contraseña Actual (para confirmar cambios)</label>
              <input type="password" className="form-control" id="clave_actual" name="clave_actual" value={claveActual} onChange={(e) => setClaveActual(e.target.value)} required />
            </div>
            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
        </form>
        
        {/* ... (zona de peligro se mantiene igual) ... */}
        <hr className="my-4" />
          
          <div className="text-center">
            <h4 className="text-danger">Zona de Peligro</h4>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)} >
              Eliminar mi cuenta
            </button>
          </div>
      </div>
      {/* ... (código del modal se mantiene igual) ... */}
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
                <p>Para confirmar, por favor, introduce tu contraseña:</p>
                <div className="mb-3">
                  <label htmlFor="clave_confirmacion" className="form-label">Contraseña</label>
                  <input type="password" className="form-control" id="clave_confirmacion" name="clave_confirmacion" value={claveConfirmacion} onChange={(e) => setClaveConfirmacion(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} >
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={isLoading} >
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