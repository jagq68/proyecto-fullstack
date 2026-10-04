import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-voke-dark text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-sm">Voke Brasil</h4>
          <p className="leading-relaxed text-slate-500">
            Simulación institucional de la plataforma de e-commerce líder en tecnología re-acondicionada de alta gama corporativa.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-sm">Departamentos</h4>
          <ul className="space-y-2">
            <li className="hover:text-voke-cyan cursor-pointer transition-colors">Laptops & Notebooks</li>
            <li className="hover:text-voke-cyan cursor-pointer transition-colors">Smartphones & Celulares</li>
            <li className="hover:text-voke-cyan cursor-pointer transition-colors">Monitores & Pantallas</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-sm">Atención al Cliente</h4>
          <p className="leading-relaxed mb-2 text-slate-500">Soporte digital simulado disponible a través de nuestro asistente inteligente.</p>
          <span className="text-voke-cyan font-semibold cursor-pointer hover:underline flex items-center space-x-1">
            <span>🤖</span> <span>Hablar con el Chatbot de ayuda</span>
          </span>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-slate-800 text-center text-slate-600">
        &copy; 2026 Voke Simulación - Desarrollado por Alberto Guatume para Turma58Toti-Diversidade. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;