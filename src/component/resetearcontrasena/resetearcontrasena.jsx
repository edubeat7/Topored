import React, { useState } from 'react';
import './resetearcontrasena.css';

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    correo: '',
    palabra_clave: '',
    nueva_clave: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // La URL ahora apunta a nuestro propio backend seguro
      const response = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: formData.correo,
          palabra_clave: formData.palabra_clave,
          nueva_clave: formData.nueva_clave,
        })
      });
      
      const data = await response.json();

      if (!response.ok) {
        // Mostramos el mensaje de error que viene directamente del backend
        throw new Error(data.message || 'No se pudo actualizar la contraseña.');
      }
      
      setSuccess('¡Contraseña actualizada con éxito! Serás redirigido al login.');
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
    // Usamos el contenedor global para centrar el contenido en la pantalla
    <div className="full-screen-container">
      <div className="reset-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Restablecer Contraseña</h2>
          <p className="text-muted">Introduce tu correo, palabra clave y tu nueva contraseña.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control form-control-lg" 
              id="correo" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="palabra_clave" className="form-label">Palabra Clave</label>
            <input 
              type="text" 
              className="form-control form-control-lg" 
              id="palabra_clave" 
              name="palabra_clave" 
              value={formData.palabra_clave} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="nueva_clave" className="form-label">Nueva Contraseña</label>
            <input 
              type="password" 
              className="form-control form-control-lg" 
              id="nueva_clave" 
              name="nueva_clave" 
              value={formData.nueva_clave} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;