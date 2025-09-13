import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  // Dentro de tu componente Login en Login.jsx

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // PASO 1: Buscar al usuario por su correo electrónico.
      const formula = `LOWER({Correo}) = '${email.toLowerCase()}'`;
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${encodeURIComponent(formula)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos.');
      }

      const data = await response.json();

      // Si no se encuentra ningún registro, el correo no existe.
      if (data.records.length === 0) {
        // Usamos un mensaje de error genérico por seguridad.
        throw new Error('El correo o la contraseña son incorrectos.');
      }
      
      const userRecord = data.records[0];
      const storedPassword = userRecord.fields.Clave; // Asumiendo que tu campo se llama 'Clave'.

      // PASO 2: Si encontramos al usuario, comparar la contraseña.
      if (password === storedPassword) {
        // ¡Éxito! Las contraseñas coinciden.
        if (typeof onLoginSuccess === 'function') {
          const userData = {
            id: userRecord.id,
            nombre: userRecord.fields.Nombre,
          };
          onLoginSuccess(userData);
          window.location.href = "/directorio";
        } else {
          throw new Error('Error de configuración del sistema.');
        }
      } else {
        // Las contraseñas NO coinciden.
        throw new Error('El correo o la contraseña son incorrectos.');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <main>
        <div className="login-card mx-auto">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Bienvenido de Nuevo</h2>
            <p className="text-muted">Inicia sesión para acceder al directorio.</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="clave" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="clave"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
      </main>
    </div>
  );
}

export default Login;