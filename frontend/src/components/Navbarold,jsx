import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-voke-dark text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGOTIPO DE VOKE */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <span className="text-xl font-black tracking-wider text-voke-cyan">voke</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest scale-90">Corp</span>
        </div>

        {/* BARRA DE BÚSQUEDA MINIMALISTA (Inspirada en tu imagen) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <input 
            type="text" 
            placeholder="Encuentra lo que necesitas..." 
            className="w-full bg-slate-800 text-slate-200 text-sm pl-4 pr-10 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-voke-cyan placeholder-slate-500"
          />
          <span className="absolute right-3 top-2.5 text-slate-500 cursor-pointer">🔍</span>
        </div>

        {/* ICONOS DE CONTROL */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          <div className="flex items-center space-x-1 hover:text-voke-cyan cursor-pointer transition-colors">
            <span>👤</span>
            <span className="hidden sm:inline">Mi Cuenta</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-voke-cyan cursor-pointer transition-colors relative">
            <span>🛒</span>
            <span className="hidden sm:inline">Carrito</span>
            {/* Badge indicador del carrito */}
            <span className="absolute -top-2 -right-2 bg-voke-cyan text-voke-dark text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">0</span>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;