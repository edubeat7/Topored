import React, { useState } from 'react';
import './resetearcontrasena.css';

// Carga las credenciales desde el archivo .env
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

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
      // --- Paso 1: Buscar al usuario por correo ---
      const findUserFormula = `LOWER({Correo}) = '${formData.correo.toLowerCase()}'`;
      const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${encodeURIComponent(findUserFormula)}`;

      const findResponse = await fetch(findUrl, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!findResponse.ok) throw new Error('Error al conectar con la base de datos.');

      const findData = await findResponse.json();
      if (findData.records.length === 0) {
        throw new Error('El correo electrónico no fue encontrado.');
      }

      const userRecord = findData.records[0];
      // CORRECCIÓN: Se usa '??' para manejar el caso en que el campo esté vacío.
      const storedKeyword = userRecord.fields.PalabraClave ?? '';

      // --- Paso 2: Verificar la palabra clave ---
      if (storedKeyword.toLowerCase() !== formData.palabra_clave.toLowerCase()) {
        throw new Error('La palabra clave es incorrecta.');
      }

      // --- Paso 3: Actualizar la contraseña ---
      const updateUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${userRecord.id}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            "Clave": formData.nueva_clave // ADVERTENCIA: Contraseña en texto plano
          }
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar la contraseña.');
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
    <div className="reset-container">
      <main>
        <div className="reset-card mx-auto">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Restablecer Contraseña</h2>
            <p className="text-muted">Introduce tu correo, palabra clave y tu nueva contraseña.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control form-control-lg" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="palabra_clave" className="form-label">Palabra Clave</label>
              <input type="text" className="form-control form-control-lg" id="palabra_clave" name="palabra_clave" value={formData.palabra_clave} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label htmlFor="nueva_clave" className="form-label">Nueva Contraseña</label>
              <input type="password" className="form-control form-control-lg" id="nueva_clave" name="nueva_clave" value={formData.nueva_clave} onChange={handleChange} required />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;