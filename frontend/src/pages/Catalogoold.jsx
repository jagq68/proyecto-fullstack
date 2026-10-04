import React from 'react';
import Navbar from '../components/Navbar'; // <-- Importación del Menú
import Footer from '../components/Footer'; // <-- Importación del Footer

const Catalogo = () => {
  // Datos simulados idénticos a las imágenes y a tu backend
  const productosSimulados = [
    {
      id: 1,
      nombre: "MacBook Air 13\" Apple M1 8GB SSD 256GB - Prata",
      precio: "R$ 5.598,00",
      stock: 5,
      imagen: "https://static.pub"
    },
    {
      id: 2,
      nombre: "MacBook Pro 14\" Apple M2 Pro 16GB SSD 512GB - Cinza Espacial",
      precio: "R$ 12.499,00",
      stock: 4,
      imagen: "https://static.pub"
    },
    {
      id: 3,
      nombre: "MacBook Air 15\" Apple M3 8GB SSD 256GB - Estelar",
      precio: "R$ 9.899,00",
      stock: 1,
      imagen: "https://static.pub"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* BARRA DE MENÚ SUPERIOR DE OFERTAS (Color fucsia/rosa corporativo de tu imagen) */}
      <div className="bg-[#D946EF] text-white text-xs md:text-sm py-2 px-4 flex justify-center space-x-4 md:space-x-8 font-medium">
        <span className="hover:underline cursor-pointer">Ofertas de primavera</span>
        <span>|</span>
        <span className="hover:underline cursor-pointer">Tienda Apple</span>
        <span>|</span>
        <span className="hover:underline cursor-pointer">Tienda Samsung</span>
        <span>|</span>
        <span className="hover:underline cursor-pointer">Tienda Lenovo</span>
        <span>|</span>
        <span className="hover:underline cursor-pointer">Tienda Dell</span>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ENCABEZADO CON ICONO DE RAYO */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-purple-600 text-2xl">⚡</span>
          <h2 className="text-2xl font-bold text-voke-dark tracking-tight">Las mejores ofertas</h2>
        </div>

        {/* CUADRÍCULA DE TARJETAS (GRIDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productosSimulados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 relative flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* BADGE DE STOCK ALTA URGENCIA (Fondo naranja/amarillo de tu foto) */}
              <div className="absolute top-4 left-4 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded">
                Quedan {prod.stock}
              </div>

              {/* ICONO DE FAVORITOS (CORAZÓN Y CARRITO SIMULADO) */}
              <div className="absolute top-4 right-4 flex space-x-2 text-slate-400">
                <span className="hover:text-red-500 cursor-pointer text-lg">♡</span>
                <span className="hover:text-voke-cyan cursor-pointer text-lg">📥</span>
              </div>

              {/* IMAGEN CENTRAL */}
              <div className="h-48 flex items-center justify-center my-6">
                <img src={prod.imagen} alt={prod.nombre} className="max-h-full object-contain" />
              </div>

              {/* CUERPO DE DATOS */}
              <div>
                <h3 className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 h-10">
                  {prod.nombre}
                </h3>
                
                {/* IDENTIFICADOR INFERIOR DE CALIDAD */}
                <div className="flex items-center space-x-1 mb-4">
                  <span className="text-rose-500 text-xs">💖</span>
                  <span className="text-xs text-slate-500 font-medium">Muy bien</span>
                </div>

                {/* PRECIO EN REALES BRASILEÑOS */}
                <div className="text-lg font-bold text-voke-dark">
                  {prod.precio}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalogo;