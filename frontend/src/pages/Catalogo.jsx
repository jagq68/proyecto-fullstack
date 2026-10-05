import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api';

const Catalogo = () => {
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState('');
  const [actualizarContador, setActualizarContador] = useState(0);
  const [favoritos, setFavoritos] = useState({});

  // SOLUCIÓN AL BLOQUEO: Escucha la barra de direcciones en tiempo real
  useEffect(() => {
    const cargarYFiltrarProductos = async () => {
      setCargando(true);
      try {
        // 1. Consumimos los datos reales desde PostgreSQL mediante Axios
        const respuesta = await api.get('/produtos');
        const listaCompleta = respuesta.data || [];

        // 2. Extraemos el parámetro ?buscar de la URL usando la herramienta nativa
        const queryParams = new URLSearchParams(location.search);
        const termino = queryParams.get('buscar')?.toLowerCase().trim() || '';

        // 3. REGLA DE BÚSQUEDA UNIVERSAL: Filtra por nombre, marca o descripción
        if (termino) {
          const filtrados = listaCompleta.filter(prod => {
            const nombre = (prod.nombre || '').toLowerCase();
            const descripcion = (prod.descripcion || '').toLowerCase();
            const marca = (prod.marca || '').toLowerCase();
            
            return nombre.includes(termino) || 
                   descripcion.includes(termino) || 
                   marca.includes(termino);
          });
          setProductos(filtrados);
        } else {
          // Si no hay búsqueda, muestra todo el inventario de la tienda
          setProductos(listaCompleta);
        }
      } catch (error) {
        console.error("Erro ao consumir a API de produtos de Voke:", error);
      }
      setCargando(false);
    };

    cargarYFiltrarProductos();
  }, [location.search]); // REGLA DE ORO: Cada vez que la URL cambie, React refrescará la vitrina

  const manejarAgregarAlCarrito = async (idDelProducto, nombreProducto) => {
    try {
      setNotificacion('');
      const token = localStorage.getItem('voke_token');
      if (!token) {
        setNotificacion('⚠️ Por favor, faça login para adicionar itens ao carrinho.');
        return;
      }
      await api.post('/carrinhos', { productoId: parseInt(idDelProducto), cantidad: 1 });
      setNotificacion(`📥 "${nombreProducto}" adicionado ao carrinho!`);
      setActualizarContador(prev => prev + 1);
      window.dispatchEvent(new Event('carrito_actualizado'));
      setTimeout(() => setNotificacion(''), 3000);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  };
return (
    <div className="voke-layout-wrapper">
      <div>
        <Navbar key={actualizarContador} />

        {notificacion && (
          <div className="voke-toast-notificacion">
            {notificacion}
          </div>
        )}

        {/* CONTENEDOR CENTRAL MAESTRO LIMPIO DE ESTILOS INLINE */}
        <div className="voke-catalogo-container">
          
          {/* ENCABEZADO DE OFERTAS LIMPIO */}
          <div className="voke-catalogo-header-row">
            <span className="voke-catalogo-rayo">⚡</span>
            <h2 className="voke-catalogo-titulo-principal">As melhores ofertas</h2>
          </div>

          {cargando ? (
            <div className="voke-catalogo-cargando-box">
              <p>Buscando estoque local...</p>
            </div>
          ) : (
            /* VITRINA DE TARJETAS HORIZONTALES CONECTADAS A TU INDEX.CSS */
            <div className="voke-vitrina-grid">
              {productos.length === 0 ? (
                <div className="voke-alerta-box">
                  Nenhum produto encontrado para esta busca na Voke.
                </div>
              ) : (
                productos.map((prod) => {
                  const precioBase = parseFloat(prod.precio);
                  const precioPix = precioBase * 0.95;
                  const valorCuota = precioBase / 10;

                  return (
                    <div key={prod.id} className="voke-tarjeta-producto">
                      
                      {/* HEADER INTERNO */}
                      <div className="voke-tarjeta-header">
                        <span className="voke-tarjeta-stock">
                          {prod.stock > 0 ? `Queda ${prod.stock}` : 'Esgotado'}
                        </span>

                        <div className="voke-tarjeta-acciones">
                          <button 
                            type="button" 
                            onClick={() => setFavoritos(prev => ({ ...prev, [prod.id]: !prev[prod.id] }))} 
                            className="voke-tarjeta-btn-icon"
                          >
                            {favoritos[prod.id] ? '❤️' : '🖤'}
                          </button>
                          <button 
                            type="button" 
                            disabled={prod.stock <= 0} 
                            onClick={() => manejarAgregarAlCarrito(prod.id, prod.nombre)} 
                            className="voke-tarjeta-btn-icon"
                          >
                            🛒
                          </button>
                        </div>
                      </div>

                      {/* CAJA DE IMAGEN */}
                      <div className="voke-tarjeta-imagen-box">
                        <img 
                          src={prod.imagenes && prod.imagenes.length > 0 ? (Array.isArray(prod.imagenes) ? prod.imagenes[0] : prod.imagenes) : 'https://placeholder.com'} 
                          alt={prod.nombre} 
                          className="voke-tarjeta-img" 
                        />
                      </div>

                      {/* INFORMACIÓN DE PRECIOS */}
                      <div className="voke-tarjeta-detalles">
                        <h3 className="voke-tarjeta-titulo">{prod.nombre}</h3>
                        <div className="voke-tarjeta-condicion">💖 Muito bom</div>

                        <div className="voke-tarjeta-precios-box">
                          <div className="voke-tarjeta-precio-pix">
                            R\$ {precioPix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="voke-form-subtitle-text"> vía PIX</span>
                          </div>
                          <div className="voke-tarjeta-precio-cuotas">
                            Ou 10x de <span style={{ fontWeight: 'bold' }}>R\$ {valorCuota.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="voke-tarjeta-envio">🚚 Frete grátis</div>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalogo;