import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  const manejarSuscripcion = (e) => {
    e.preventDefault();
    if (nombre.trim() && email.trim()) {
      alert(`¡Gracias por suscribirte, ${nombre}! Te enviaremos actualizaciones pronto.`);
      setNombre('');
      setEmail('');
    }
  };

  return (
    <footer className="voke-footer-maestro">
      
      {/* 1. BLOQUE DE SUSCRIPCIÓN AL BOLETÍN */}
      <div className="voke-footer-boletin-bg">
        <div className="voke-footer-boletin-container">
          <div className="voke-boletin-info">
            <h3 className="voke-boletin-titulo">Suscríbete a nuestro boletín</h3>
            <p className="voke-boletin-sub">Te enviaremos actualizaciones e historias. Sin spam.</p>
          </div>
          <form onSubmit={manejarSuscripcion} className="voke-boletin-form">
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Tu nombre" 
              className="voke-boletin-input" 
              required 
            />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Tu correo electrónico" 
              className="voke-boletin-input" 
              required 
            />
            <button type="submit" className="voke-boletin-btn">Suscribirme</button>
          </form>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL DEL FOOTER */}
      <div className="voke-footer-contenido-container">
        
        {/* Columna Marca */}
        <div className="voke-footer-col-marca">
          <h2 className="voke-footer-logo">voke</h2>
          <p className="voke-footer-descripcion">
            La mayor tienda de electrónicos seminuevos con garantía y procedencia. 
            Equipos ideales para personas y empresas.
          </p>
        </div>

        {/* Columna Institucional */}
        <div className="voke-footer-col">
          <h4 className="voke-footer-col-titulo">Institucional</h4>
          <ul className="voke-footer-enlaces">
            <li><Link to="/sobre-voke">Sobre Voke</Link></li>
            <li><Link to="/soluciones-b2b">Soluciones B2B</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* Columna Políticas y Ayuda */}
        <div className="voke-footer-col">
          <h4 className="voke-footer-col-titulo">Políticas y Ayuda</h4>
          <ul className="voke-footer-enlaces">
            <li><Link to="/garantia">Garantía de 3 Meses</Link></li>
            <li><Link to="/envios">Envíos y Entregas</Link></li>
            <li><Link to="/terminos">Términos de Uso</Link></li>
            <li><Link to="/privacidad">Privacidad</Link></li>
          </ul>
        </div>

        {/* Columna Atención al Cliente */}
        <div className="voke-footer-col">
          <h4 className="voke-footer-col-titulo">Atención al Cliente</h4>
          <p className="voke-footer-telefono">(31) 97222-5503</p>
          <p className="voke-footer-cnpj">CNPJ 18.638.476/0001-18</p>
        </div>

      </div>

      {/* 3. FRANJA DE DERECHOS DE AUTOR */}
      <div className="voke-footer-derechos-bg">
        <div className="voke-footer-derechos-container">
          AGASUS SEMINOVOS | © 2025-2026 Voke. Todos los derechos reservados.
          &copy; 2026 Voke Simulação - Desenvolvido por Alberto Guatume para Turma58Toti-Diversidade.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// import React from 'react';

// const Footer = () => {
//   return (
//     <footer className="voke-footer-blue-box">
//       <div className="voke-footer-grid-container">
        
//         <div style={{ flex: '1', minWidth: '240px' }}>
//           <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Voke Brasil</h4>
//           <p style={{ color: '#F2F4F7', margin: 0, lineHeight: '1.5' }}>
//             Simulação institucional em CSS Puro para a avaliação final de desenvolvimento. Portfólio Turma 58 Toti.
//           </p>
//         </div>

//         <div style={{ flex: '1', minWidth: '200px' }}>
//           <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Departamentos</h4>
//           <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#F2F4F7' }}>
//             <li>Laptops & Notebooks</li>
//             <li>Smartphones & Celulares</li>
//             <li>Monitores & Telas</li>
//           </ul>
//         </div>

//         <div style={{ flex: '1', minWidth: '240px' }}>
//           <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Atendimento</h4>
//           <p style={{ color: '#F2F4F7', margin: '0 0 8px 0' }}>Suporte digital através do assistente de inteligência virtual.</p>
//           <span style={{ color: '#fe97c5', fontWeight: 'bold' }}>🤖 Chatbot de Ajuda</span>
//         </div>

//       </div>
      
//       <div style={{ maxWidth: '1200px', margin: '32px auto 0 auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '11px', color: '#DEE2E6' }}>
//         &copy; 2026 Voke Simulação - Desenvolvido por Alberto Guatume para Turma58Toti-Diversidade.
//       </div>
//     </footer>
//   );
// };

// export default Footer;