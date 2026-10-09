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

  // SOLUCIÓN AL BLOQUEO DE NAVEGACIÓN: Escucha categorías, marcas y búsquedas en tiempo real
  // SOLUCIÓN AL BLOQUEO DE NAVEGACIÓN: Mapeo inteligente para base de datos relacional
  useEffect(() => {
    const cargarYFiltrarProductos = async () => {
      setCargando(true);
      try {
        // 1. Consumimos el inventario real desde PostgreSQL
        const respuesta = await api.get('/produtos');
        let listaFiltrada = respuesta.data || [];

        // 2. Extraemos los parámetros de búsqueda de la URL
        const queryParams = new URLSearchParams(location.search);
        const terminoBuscar = queryParams.get('buscar')?.toLowerCase().trim() || '';
        const terminoCategoria = queryParams.get('categoria')?.toLowerCase().trim() || '';
        const terminoMarca = queryParams.get('marca')?.toLowerCase().trim() || '';

        // 3. FILTRADO INTELIGENTE POR CATEGORIA_ID (Mapeo relacional de Voke)
        if (terminoCategoria) {
          listaFiltrada = listaFiltrada.filter(prod => {
            const idCat = parseInt(prod.categoria_id);
            
            // Asignación de ID según el ítem seleccionado en el DrawerMenu
            if (terminoCategoria === 'cuadernos') return idCat === 1;
            if (terminoCategoria === 'computadoras') return idCat === 2;
            if (terminoCategoria === 'smartphones') return idCat === 3;
            if (terminoCategoria === 'tabletas') return idCat === 4;
            if (terminoCategoria === 'monitores') return idCat === 5;
            if (terminoCategoria === 'accesorios') return idCat === 6;
            if (terminoCategoria === 'apple') return idCat === 7;
            if (terminoCategoria === 'chromebook') return idCat === 8;
            
            return true;
          });
        }

        // 4. FILTRADO INTELIGENTE POR MARCA (Busca la palabra adentro del campo nombre)
        if (terminoMarca) {
          listaFiltrada = listaFiltrada.filter(prod => {
            const nombreProd = (prod.nombre || '').toLowerCase();
            const marcaABuscar = terminoMarca === 'manzana' ? 'apple' : terminoMarca; // Traduce Manzana a Apple si es necesario
            return nombreProd.includes(marcaABuscar);
          });
        }

        // 5. FILTRADO POR BARRA DE BÚSQUEDA TRADICIONAL
        if (terminoBuscar) {
          listaFiltrada = listaFiltrada.filter(prod => {
            const nombre = (prod.nombre || '').toLowerCase();
            const descripcion = (prod.descripcion || '').toLowerCase();
            return nombre.includes(terminoBuscar) || descripcion.includes(terminoBuscar);
          });
        }

        // Cargamos la lista final limpia en la vitrina de React
        setProductos(listaFiltrada);

      } catch (error) {
        console.error("Erro ao consumir a API de produtos de Voke:", error);
      }
      setCargando(false);
    };

    cargarYFiltrarProductos();
  }, [location.search]);

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
          
          {/* ENCABEZADO DE OFERTAS DINÁMICO */}
          <div className="voke-catalogo-header-row">
            <span className="voke-catalogo-rayo">⚡</span>
            <h2 className="voke-catalogo-titulo-principal">
              {(() => {
                const queryParams = new URLSearchParams(location.search);
                const cat = queryParams.get('categoria');
                const marc = queryParams.get('marca');
                if (cat && marc) return `Ofertas em ${cat} - ${marc}`;
                if (cat) return `Ofertas em ${cat}`;
                if (marc) return `Ofertas de ${marc}`;
                return "As melhores ofertas";
              })()}
            </h2>
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
                  const precioBase = parseFloat(prod.precio || 0);
                  const precioPix = precioBase * 0.95;
                  const valorCuota = precioBase / 10;

                  let urlImagen = 'https://placeholder.com';
                  if (prod.imagenes) {
                    if (Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
                      urlImagen = prod.imagenes[0];
                    } else if (typeof prod.imagenes === 'string' && prod.imagenes.trim() !== '') {
                      urlImagen = prod.imagenes;
                    }
                  }

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
                          src={urlImagen} 
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
                            Ou 10x de <span className="voke-tarjeta-cuota-destacada">R\$ {valorCuota.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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