import React from 'react';
import {HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import DashboardAdmin from './pages/DashboardAdmin';
import SeguimientoEnvio from './pages/SeguimientoEnvio';

// 🛡️ COMPONENTE GUARDIÁN DE SEGURIDAD (MIDDLEWARE DE FRONTEND)
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

// 🛡️ COMPONENTE GUARDIÁN DE SEGURIDAD RECALIBRADO PARA PRODUCCIÓN
const ProtegerRutaAdmin = ({ children }) => {
  const token = localStorage.getItem('voke_token');
  const usuarioGuardado = localStorage.getItem('voke_usuario');

   
  // 1. Si no hay absolutamente nada en la memoria, se expulsa directo al login
  if (!token || !usuarioGuardado) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(usuarioGuardado);
 // 🕵️‍♂️ RASTREADOR EN CONSOLA: Veremos en la pantalla exactamente qué datos guardó el navegador
    console.log("=== AUDITORÍA DE CREDENCIALES EN INTERNET ===");
    console.log("Objeto usuario completo de la memoria:", user);

    const perfilReal = user?.perfil || user?.usuario?.perfil || user?.user?.perfil || '';
    console.log("Valor real detectado para el perfil:", perfilReal);

    // 2. ⚡ TOLERANCIA ASÍNCRONA: Si el objeto existe pero el navegador en internet 
    // está terminando de procesar el JSON, evitamos la expulsión con una espera limpia
    // if (!user || !user.perfil) {
    //    console.log("⚠️ ACCESO RECHAZADO uno: El perfil no es admin. Expulsando al catálogo...");
    //   return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Verificando credenciais corporativas...</div>;
    // }

    // 🕵️‍♂️ RASTREADOR EN CONSOLA: Veremos en la pantalla exactamente qué datos guardó el navegador
    console.log("=== AUDITORÍA DE CREDENCIALES EN INTERNET ===");
    console.log("Objeto usuario completo de la memoria:", user);
    console.log("Valor exacto de la variable perfil:", user.perfil);
    console.log("¿perfil es igual a admin?:", user.perfil.toLowerCase() === 'admin' ? "SÍ" : "NO");

    // 3. REGLA DE ACCESO RELACIONAL EXACTA
    // 🚀 AJUSTE ADAPTATIVO: Usamos .toLowerCase() para que acepte 'admin' pase lo que pase

      // COMPROBACIÓN DE ROL CON TOLERANCIA
    if (!perfilReal || perfilReal.toLowerCase() !== 'admin') {
      console.warn("⚠️ ACCESO RECHAZADO: El perfil no coincide con admin. Redirigiendo...");
      return <Navigate to="/" replace />; 
    }

    console.log("✅ ACCESO TOTALMENTE AUTORIZADO. Cargando DashboardAdmin...");
    // if (user.perfil.toLowerCase() !== 'admin') {
    //       console.warn("⚠️ ACCESO RECHAZADO: El perfil no es admin. Expulsando al catálogo...");
    //   return <Navigate to="/" replace />; // Si es un cliente común, lo manda a la tienda
    // }

    // if (user.perfil !== 'admin') {
    //   return <Navigate to="/" replace />; // Si es un cliente común, lo manda a la tienda
    // }

    // ✅ Si cumple todas las credenciales de PostgreSQL, abre el Dashboard de inmediato
    return children;

  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

function App() {
  // 🚀 DETECTOR INTELIGENTE: Si estás en tu PC usa la raíz "/", si estás en GitHub usa "/proyecto-fullstack"
  const isLocal = window.location.hostname === 'localhost';

  return (
   <Router >
    <navbar />
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