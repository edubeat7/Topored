import { Link, useHistory } from 'react-router-dom'; // Se importa Link para la versión recomendada

// Este componente Navbar recibe props para saber si el usuario está logueado,
// su nombre y una función para cerrar la sesión.
function Navbar({ isLoggedIn, userName, onLogout }) {
  // hook de react-router-dom para poder redirigir al usuario
  const history = useHistory();

  const handleLogout = () => {
    // Llama a la función onLogout que viene de App.js
    if (onLogout) {
      onLogout();
    }
    // Redirige al usuario a la página de inicio
    //history.push('/');
    window.location.href="/"
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
      <div className="container-fluid">
        {/* Brand/Logo que lleva al inicio */}
        <a className="navbar-brand fw-bold" href="/">MiDirectorio</a>
        
        {/* Botón Hamburguesa para móvil */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenedor de los links de navegación */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="/">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/directorio">Ver Directorio</a>
            </li>

            {/* === RENDERIZADO CONDICIONAL === */}

            {/* Si el usuario ESTÁ logueado, muestra esto: */}
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/editar">Editar Perfil</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/informacion">Informacion</a>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    Hola, {userName}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      {/* Usamos un botón para el logout, ya que es una acción */}
                      <button className="dropdown-item" onClick={handleLogout}>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              /* Si el usuario NO ESTÁ logueado, muestra esto: */
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/login">Iniciar Sesión</a>
                </li>
                <li className="nav-item">
                  <a className="btn btn-primary ms-lg-2" href="/registro" role="button">
                    Registrarse
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;