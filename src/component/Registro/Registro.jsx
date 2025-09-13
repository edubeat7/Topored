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

  // --- NUEVOS ESTADOS PARA EL FLUJO DE VERIFICACIÓN ---
  const [step, setStep] = useState(1); // 1 para el formulario, 2 para la verificación OTP
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // --- PASO 1: LLAMA AL BACKEND PARA ENVIAR EL CÓDIGO ---
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validación de formato del teléfono en el frontend para feedback inmediato
    // Asumimos Venezuela ('VE') como país. Puedes cambiarlo o hacerlo dinámico.
    if (!isValidPhoneNumber(formData.telefono || '', 'VE')) {
      setError('Por favor, introduce un número de teléfono válido (ej: +584141234567).');
      setIsLoading(false);
      return;
    }

    try {
      // Llama al nuevo endpoint para enviar el código
      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al enviar el código.');
      
      // Guardamos el token temporal y avanzamos al siguiente paso
      setVerificationToken(data.verificationToken);
      setStep(2);
      setSuccess('¡Código enviado! Revisa tu correo electrónico.');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PASO 2: VERIFICA EL CÓDIGO Y FINALIZA EL REGISTRO ---
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Llama al endpoint de registro modificado
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationToken, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al verificar la cuenta.');

      setSuccess('¡Cuenta verificada y registrada! Serás redirigido al login.');
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
          <h2 className="fw-bold">{step === 1 ? 'Crear una Cuenta' : 'Verifica tu Correo'}</h2>
          <p>{step === 1 ? 'Únete a nuestra comunidad profesional.' : `Introduce el código de 6 dígitos enviado a ${formData.correo}`}</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {step === 1 ? (
          // --- FORMULARIO INICIAL (PASO 1) ---
          <form onSubmit={handleSendVerificationCode}>
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
            {/* ... (resto de tus campos) ... */}
            <div className="mb-3">
              <label htmlFor="profesion" className="form-label">Profesión o Estudiante</label>
              <select className="form-select" id="profesion" name="profesion" value={formData.profesion} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una opción</option>
                  {PROFESIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input type="tel" className="form-control" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="+584141234567" />
            </div>
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />
            </div>
            {/* ... (resto de tus campos hasta el botón) ... */}

            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Código de Verificación'}
              </button>
            </div>
          </form>
        ) : (
          // --- FORMULARIO DE VERIFICACIÓN (PASO 2) ---
          <form onSubmit={handleVerifyAndRegister}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">Código de Verificación</label>
              <input 
                type="text" 
                className="form-control form-control-lg text-center" 
                id="otp" 
                name="otp" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
            </div>
            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Finalizar Registro'}
              </button>
            </div>
            <div className="text-center mt-3">
                <button type="button" className="btn btn-link" onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
                    Volver y editar datos
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegistrationPage;