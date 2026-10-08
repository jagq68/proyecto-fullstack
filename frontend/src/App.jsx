import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import DashboardAdmin from './pages/DashboardAdmin';
import SeguimientoEnvio from './pages/SeguimientoEnvio';

// 🛡️ COMPONENTE GUARDIÁN DE SEGURIDAD (MIDDLEWARE DE FRONTEND)
const ProtegerRutaAdmin = ({ children }) => {
  const token = localStorage.getItem('voke_token');
  const usuarioGuardado = localStorage.getItem('voke_usuario');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // REGLA DE ACCESO ESTRICTA: Debe tener token activo y perfil de administrador
  if (!token || !user || user.perfil !== 'admin') {
    // Si no cumple, lo expulsa inmediatamente a la pantalla de acceso tradicional
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // 🚀 DETECTOR INTELIGENTE: Si estás en tu PC usa la raíz "/", si estás en GitHub usa "/proyecto-fullstack"
  const isLocal = window.location.hostname === 'localhost';

  return (
    <Router basename={isLocal ? "/" : "/proyecto-fullstack"}>
      <div className="voke-layout-wrapper">
        <Routes>
          {/* Rutas Públicas de la Tienda Comercial */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/carrinho" element={<Carrito />} />
          <Route path="/seguimiento" element={<SeguimientoEnvio />} />
          <Route path="/seguimiento/:id" element={<SeguimientoEnvio />} />
          
          {/* 🔒 RUTA ADMINISTRATIVA TOTALMENTE PROTEGIDA Y ENCAPSULADA */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtegerRutaAdmin>
                <DashboardAdmin />
              </ProtegerRutaAdmin>
            } 
          />

          {/* Redirección Universal por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

//1
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Catalogo from './pages/Catalogo';
// import Carrito from './pages/Carrito';
// import DashboardAdmin from './pages/DashboardAdmin';
// import SeguimientoEnvio from './pages/SeguimientoEnvio';


// // 🛡️ COMPONENTE GUARDIÁN DE SEGURIDAD (MIDDLEWARE DE FRONTEND)
// const ProtegerRutaAdmin = ({ children }) => {
//   const token = localStorage.getItem('voke_token');
//   const usuarioGuardado = localStorage.getItem('voke_usuario');
//   const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

//   // REGLA DE ACCESO ESTRICTA: Debe tener token activo y perfil de administrador
//   if (!token || !user || user.perfil !== 'admin') {
//     // Si no cumple, lo expulsa inmediatamente a la pantalla de acceso tradicional
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <Router>
//       <div className="voke-layout-wrapper">
//         <Routes>
//           {/* Rutas Públicas de la Tienda Comercial */}
//           <Route path="/" element={<Catalogo />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/carrinho" element={<Carrito />} />
//           <Route path="/seguimiento" element={<SeguimientoEnvio />} />
//           <Route path="/seguimiento/:id" element={<SeguimientoEnvio />} />
//           {/* 🔒 RUTA ADMINISTRATIVA TOTALMENTE PROTEGIDA Y ENCAPSULADA */}
//           <Route 
//             path="/admin/dashboard" 
//             element={
//               <ProtegerRutaAdmin>
//                 <DashboardAdmin />
//               </ProtegerRutaAdmin>
//             } 
//           />

//           {/* Redirección Universal por defecto */}
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

//2
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Catalogo from './pages/Catalogo';
// import Carrito from './pages/Carrito';
// import DashboardAdmin from './pages/DashboardAdmin';


// function App() {
//   return (
//     <Router>
//       {/* Caja contenedora maestra de CSS Puro que empuja el Footer al fondo */}
//       <div className="voke-layout-wrapper">
//         <Routes>
//           <Route path="/" element={<Catalogo />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/carrinho" element={<Carrito />} />
//           <Route path="/admin/dashboard" element={<DashboardAdmin />} />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;