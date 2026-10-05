import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';

function App() {
  return (
    <Router>
      {/* Caja contenedora maestra de CSS Puro que empuja el Footer al fondo */}
      <div className="voke-layout-wrapper">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/carrinho" element={<Carrito />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;