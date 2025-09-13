// ... (imports se mantienen igual)
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';


function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // URL ahora apunta a nuestro propio backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // El mensaje de error ahora viene de nuestro backend
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      // Guardamos el token y los datos del usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Llamamos a la función del componente padre para actualizar el estado global
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(data.user);
      }
      
      // Redirigimos al directorio
      window.location.href = "/directorio";

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... (el return con el JSX del formulario se mantiene exactamente igual)
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Bienvenido de Nuevo</h2>
          <p className="text-muted">Inicia sesión para acceder al directorio.</p>
        </div>
        <form onSubmit={handleLogin}>
          {/* ... inputs y botón ... */}
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo Electrónico</label>
            <input type="email" className="form-control form-control-lg" id="correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label htmlFor="clave" className="form-label">Contraseña</label>
            <input type="password" className="form-control form-control-lg" id="clave" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-muted">¿No tienes una cuenta? <a href="/registro">Regístrate</a></p>
          <a href="/resetearcontrasena">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;