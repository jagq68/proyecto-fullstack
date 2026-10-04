import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api'; // Tu cliente unificado de Axios

const Catalogo = () => {
  // Estado para almacenar los productos reales de PostgreSQL
  const [productos, setProductos] = useState([]);
  // Estado para manejar el indicador de carga visual
  const [cargando, setCargando] = useState(true);

  // Hook useEffect para disparar la petición HTTP al montar la interfaz
  useEffect(() => {
    const cargarProductosDesdeBD = async () => {
      try {
        // Hacemos el llamado a tu endpoint público de productos
        const respuesta = await api.get('/produtos');
        setProductos(respuesta.data);
      } catch (error) {
        console.error("Erro ao consumir a API de produtos de Voke:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductosDesdeBD();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* BARRA SUPERIOR DE CATEGORÍAS */}
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

        {/* SECCIÓN PRINCIPAL DE LA VITRINA */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-purple-600 text-2xl">⚡</span>
            <h2 className="text-2xl font-bold text-voke-dark tracking-tight">Las mejores ofertas</h2>
          </div>

          {/* INDICADOR DE CARGA VISUAL */}
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-voke-cyan"></div>
              <p className="text-sm text-slate-500 font-medium">Buscando notebooks no banco de dados da Voke...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              Nenhum produto cadastrado na base de dados atualmente.
            </div>
          ) : (
            /* CUADRÍCULA CONECTADA A TU BASE DE DATOS REAL */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productos.map((prod) => (
                <div key={prod.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 relative flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  {/* BADGE DINÁMICO ALIMENTADO POR TU COLUMNA 'STOCK' */}
                  <div className={`absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded ${prod.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {prod.stock > 0 ? `Apenas ${prod.stock} em estoque` : 'Esgotado'}
                  </div>

                  {/* ICONOS FLOTANTES */}
                  <div className="absolute top-4 right-4 flex space-x-2 text-slate-400">
                    <span className="hover:text-red-500 cursor-pointer text-lg">♡</span>
                    <span className="hover:text-voke-cyan cursor-pointer text-lg">📥</span>
                  </div>

                  {/* IMAGEN DEL ARTÍCULO (Usa el mapeo del array de imágenes de tu JOIN) */}
                  <div className="h-48 flex items-center justify-center my-6">
                    <img 
                      src={prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0] : 'https://placeholder.com'} 
                      alt={prod.nombre} 
                      className="max-h-full object-contain" 
                    />
                  </div>

                  {/* DESGLOSE DE DATOS DE LA BD */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 h-10">
                      {prod.nombre}
                    </h3>
                    
                    <div className="flex items-center space-x-1 mb-4">
                      <span className="text-rose-500 text-xs">💖</span>
                      <span className="text-xs text-slate-500 font-medium">Muito bom</span>
                    </div>

                    <div className="text-lg font-bold text-voke-dark">
                      R\$ {parseFloat(prod.precio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Catalogo;