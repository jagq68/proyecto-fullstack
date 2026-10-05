import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api'; // Tu cliente unificado de Axios

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para mostrar notificaciones flotantes cuando añades un producto
  const [notificacion, setNotificacion] = useState('');

  // Cargar los productos desde PostgreSQL al montar la pantalla
  useEffect(() => {
    const cargarProductosDesdeBD = async () => {
      try {
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

  // FUNCIÓN CLAVE: Envía el producto seleccionado al carrito en PostgreSQL
  const manejarAgregarAlCarrito = async (productoId, nombreProducto) => {
    try {
      setNotificacion('');
      
      // Validamos si el usuario está logueado revisando si existe un token en la laptop
      const token = localStorage.getItem('voke_token');
      if (!token) {
        setNotificacion('⚠️ Por favor, faça login para adicionar itens ao carrinho.');
        return;
      }

      // Disparamos la petición POST hacia tu endpoint del backend
      await api.post('/carrinhos', {
        productoId: productoId,
        cantidad: 1 // Agregamos de 1 en 1 por cada clic
      });

      // Mostramos mensaje de éxito dinámico con el nombre del artículo
      setNotificacion(`📥 "${nombreProducto}" adicionado ao carrinho!`);
      
      // Limpiamos la notificación automáticamente después de 3 segundos
      setTimeout(() => setNotificacion(''), 3000);

    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      setNotificacion('❌ Erro ao adicionar o produto. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative">
      <div>
        <Navbar />

        {/* CINTILLO DE OFERTAS */}
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

        {/* NOTIFICACIÓN FLOTANTE INTELIGENTE */}
        {notificacion && (
          <div className="fixed top-20 right-4 z-50 bg-voke-dark text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg border border-slate-700 animate-bounce">
            {notificacion}
          </div>
        )}

        {/* SECCIÓN PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-purple-600 text-2xl">⚡</span>
            <h2 className="text-2xl font-bold text-voke-dark tracking-tight">Las mejores ofertas</h2>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productos.map((prod) => (
                <div key={prod.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 relative flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  {/* BADGE DE INVENTARIO EN VIVO */}
                  <div className={`absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded ${prod.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {prod.stock > 0 ? `Apenas ${prod.stock} em estoque` : 'Esgotado'}
                  </div>

                  {/* ICONOS FLOTANTES CON ACCIÓN CONECTADA */}
                  <div className="absolute top-4 right-4 flex space-x-2 text-slate-400">
                    <span className="hover:text-red-500 cursor-pointer text-lg">♡</span>
                    
                    {/* ASIGNAMOS EL MANEJADOR DEL CLIC AL ICONO DEL CARRITO */}
                    <button 
                      type="button"
                      disabled={prod.stock <= 0}
                      onClick={() => manejarAgregarAlCarrito(prod.id, prod.nombre)}
                      className={`text-lg transition-transform active:scale-95 ${prod.stock > 0 ? 'hover:text-voke-cyan cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                    >
                      📥
                    </button>
                  </div>

                  {/* IMAGEN DEL PRODUCTO */}
                  <div className="h-48 flex items-center justify-center my-6">
                    <img 
                      src={prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0] : 'https://placeholder.com'}
                      //src={prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes : 'https://placeholder.com'} 
                      alt={prod.nombre} 
                      className="max-h-full object-contain" 
                    />
                  </div>

                  {/* CUERPO DE DATOS */}
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