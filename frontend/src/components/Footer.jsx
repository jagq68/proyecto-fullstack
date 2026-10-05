import React from 'react';

const Footer = () => {
  return (
    <footer className="voke-footer-blue-box">
      <div className="voke-footer-grid-container">
        
        <div style={{ flex: '1', minWidth: '240px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Voke Brasil</h4>
          <p style={{ color: '#F2F4F7', margin: 0, lineHeight: '1.5' }}>
            Simulação institucional em CSS Puro para a avaliação final de desenvolvimento. Portfólio Turma 58 Toti.
          </p>
        </div>

        <div style={{ flex: '1', minWidth: '200px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Departamentos</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#F2F4F7' }}>
            <li>Laptops & Notebooks</li>
            <li>Smartphones & Celulares</li>
            <li>Monitores & Telas</li>
          </ul>
        </div>

        <div style={{ flex: '1', minWidth: '240px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>Atendimento</h4>
          <p style={{ color: '#F2F4F7', margin: '0 0 8px 0' }}>Suporte digital através do assistente de inteligência virtual.</p>
          <span style={{ color: '#fe97c5', fontWeight: 'bold' }}>🤖 Chatbot de Ajuda</span>
        </div>

      </div>
      
      <div style={{ maxWidth: '1200px', margin: '32px auto 0 auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '11px', color: '#DEE2E6' }}>
        &copy; 2026 Voke Simulação - Desenvolvido por Alberto Guatume para Turma58Toti-Diversidade.
      </div>
    </footer>
  );
};

export default Footer;