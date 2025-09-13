import { useState, useEffect } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Inicio from "./component/Inicio/Inicio";
import Login from "./component/Login/Login";
import Registro from "./component/Registro/Registro";
import Resetearcontrasena from "./component/resetearcontrasena/resetearcontrasena";
import Directorio from "./component/Directorio/Directorio";
import Navbar from "./component/Navbar/Navbar";
import ProtectedRoute from './component/ProtectedRoute';
import Editar from './component/Editar/Editar';
import Informacion from './component/Informacion/Informacion';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      if (userData.isLoggedIn) {
        setIsLoggedIn(true);
        setUserName(userData.nombre);
      }
    }
  }, []);

  // Función que maneja el éxito del login
  const handleLoginSuccess = (userData) => {
    // Actualizar estado de la aplicación
    setIsLoggedIn(true);
    setUserName(userData.nombre);
    
    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify({
      isLoggedIn: true,
      nombre: userData.nombre,
      id: userData.id
    }));
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      {/* Pasar las props necesarias al Navbar */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        onLogout={handleLogout} 
      />
      
      <Switch>
        <Route exact path="/">
          <Inicio />
        </Route>
        <Route exact path="/Login">
          {/* Pasar la función handleLoginSuccess como prop */}
          <Login onLoginSuccess={handleLoginSuccess} />
        </Route>
        <Route exact path="/Registro">
          <Registro />
        </Route>
        <Route exact path="/Resetearcontrasena">
          <Resetearcontrasena />
        </Route>
        <ProtectedRoute exact path="/Directorio">
          <Directorio />
        </ProtectedRoute>
        <ProtectedRoute exact path="/Editar">
          <Editar />
        </ProtectedRoute>
        <ProtectedRoute exact path="/Informacion">
          <Informacion />
        </ProtectedRoute>
      </Switch>
    </Router>
  );
}

export default App;