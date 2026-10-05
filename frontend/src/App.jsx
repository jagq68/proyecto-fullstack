import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Muestra la vitrina de ofertas de Voke Brasil */}
        <Route path="/" element={<Catalogo />} />
        {/* Ruta de acceso: Formulario corporativo con selector CPF/CNPJ */}
        <Route path="/login" element={<Login />} />
        {/* 1. CAMBIO: Subimos la ruta del carrito arriba del comodín */}
        <Route path="/carrinho" element={<Carrito />} />
        {/* Redirección automática si escriben cualquier otra ruta inválida */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
export default App;

//--------------
// import React from 'react';
// import Catalogo from './pages/Catalogo';
// import Login from './pages/Login'; // <-- Importamos la pantalla de login


// function App() {
//   return (
//     <>
//       <Catalogo />
//     </>
//   );
// }

// export default App;