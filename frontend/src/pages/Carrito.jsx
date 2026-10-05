import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api';

const Carrito = () => {
  const navigate = useNavigate();
  const [elementos, setElementos] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState('');

  // 1. Cargar el contenido real del carrito calculando totales desde el Backend
  const obtenerCarritoDeBD = async () => {
    try {
      const token = localStorage.getItem('voke_token');
      if (!token) return setCargando(false);

      const respuesta = await api.get('/carrinhos');
      setElementos(respuesta.data.items || []);
      setTotalGeneral(respuesta.data.total || 0);
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCarritoDeBD();
  }, []);

  // 2. Acción para remover un producto por completo utilizando Axios
  const manejarEliminarProducto = async (productoId) => {
    try {
      await api.delete(`/carrinhos/${productoId}`);
      setNotificacion('❌ Produto removido do carrinho.');
      obtenerCarritoDeBD(); // Recargamos el estado en vivo
      setTimeout(() => setNotificacion(''), 3000);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };
  // 3. Simular el proceso de Checkout enviando el pago por Pix
  const manejarCheckoutFluido = async () => {
    try {
      setNotificacion('⏳ Processando seu pedido na Voke...');
      
      // Lanzamos la orden al checkout transaccional del backend
      const resPedido = await api.post('/pedidos/checkout', { metodoPago: 'Pix' });
      const { id, total } = resPedido.data.pedido;

      // Disparamos la pasarela automatizada con el ID de la factura generada
      await api.post('/pagos/procesar', { pedidoId: id, metodoPago: 'Pix' });

      setNotificacion('🎉 Pedido Pago e Aprovado com sucesso!');
      setElementos([]);
      setTotalGeneral(0);
    } catch (error) {
      console.error("Erro no checkout simulado:", error);
      setNotificacion('❌ Falha ao processar checkout.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative">
      <div>
        <Navbar />
        {notificacion && (
          <div className="fixed top-20 right-4 z-50 bg-voke-dark text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg border border-slate-700">
            {notificacion}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-voke-dark mb-6 tracking-tight">Seu Carrinho de Compras</h2>

          {cargando ? (
            <div className="text-center py-10 text-sm text-slate-500">Carregando itens...</div>
          ) : elementos.length === 0 ? (
            <div className="bg-white rounded-lg p-8 border border-slate-200 text-center shadow-sm">
              <p className="text-slate-500 text-sm mb-4">Seu carrinho da Voke está vazio atualmente.</p>
              <Link to="/" className="inline-block bg-voke-dark text-white text-xs font-medium px-6 py-2 rounded-full hover:bg-slate-800">Voltar às compras</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LISTADO DE ITEMS DEL CARRITO */}
              <div className="md:col-span-2 space-y-4">
                {elementos.map((item) => (
                  <div key={item.producto_id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <img src={item.imagen_url || 'https://placeholder.com'} alt={item.nombre} className="h-16 w-16 object-contain border border-slate-100 p-1 rounded" />
                    <div className="flex-1 mx-4">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.nombre}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Quantidade: {item.cantidad}</p>
                      <p className="text-xs font-semibold text-voke-dark mt-1">R\$ {parseFloat(item.precio).toFixed(2)}</p>
                    </div>
                    <button type="button" onClick={() => manejarEliminarProducto(item.producto_id)} className="text-slate-400 hover:text-red-500 text-sm font-medium px-2">✕</button>
                  </div>
                ))}
              </div>

              {/* RESUMEN FINANCIERO Y CHECKOUT (Diseño Voke) */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-bold text-voke-dark border-b border-slate-100 pb-2">Resumo do Pedido</h3>
                <div className="flex justify-between text-xs text-slate-600"><span>Subtotal:</span><span>R\$ {totalGeneral.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-slate-600"><span>Frete (Simulado):</span><span className="text-emerald-600 font-semibold">Grátis</span></div>
                <div className="flex justify-between text-sm font-bold text-voke-dark border-t border-slate-100 pt-2"><span>Total:</span><span>R\$ {totalGeneral.toFixed(2)}</span></div>
                <button type="button" onClick={manejarCheckoutFluido} className="w-full bg-voke-dark hover:bg-slate-800 text-white text-xs font-medium py-2.5 rounded-full transition-colors">Finalizar Compra (Pix)</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carrito;