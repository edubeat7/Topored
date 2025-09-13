import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'; // Importa CSS de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa CSS de Bootstrap Icons


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
