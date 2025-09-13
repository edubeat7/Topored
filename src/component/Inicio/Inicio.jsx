import React from 'react';
import './Inicio.css'; 

function WelcomePage() {
  return (
    // 👇 Este contenedor es necesario para el espaciado con la Navbar
    <div className="page-container">
      <section className="hero-section">
        <div className="container">
          <h1>Conecta con Profesionales</h1>
          <p>
            Una comunidad exclusiva para descubrir, conectar y colaborar con expertos de todas las áreas. Inicia sesión para acceder al directorio o regístrate para formar parte de él.
          </p>
          <div className="hero-buttons">
            <a href="/login" className="button button-light">
              Iniciar Sesión
            </a>
            <a href="/registro" className="button button-outline-light">
              Registrarse
            </a>
          </div>
        </div>
      </section>

      <section className="features-section">
        
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-search"></i>
              </div>
              <h3>Descubre</h3>
              <p>
                Filtra y encuentra exactamente al profesional que necesitas para tu próximo proyecto.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3>Conecta</h3>
              <p>
                Accede a la información de contacto y establece relaciones profesionales valiosas.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <h3>Crece</h3>
              <p>
                Forma parte de una red en crecimiento y aumenta la visibilidad de tu perfil profesional.
              </p>
            </div>
          </div>
       
      </section>
    </div> // 👈 Cierre del div contenedor
  );
}

export default WelcomePage;