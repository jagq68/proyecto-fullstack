import React, { useState, useEffect } from 'react';
import api from '../config/api';

const DashboardAdmin = () => {
  const [metricas, setMetricas] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // 1. CARGA INICIAL DE ANÁLISIS DEL BACKOFFICE
  const cargarInformacionDashboard = async () => {
    setCargando(true);
    setErrorDashboard('');
    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };

      // Consultas paralelas seguras al backend protegido
      const [resAnalitica, resCategorias] = await Promise.all([
        api.get('/dashboard/analitica', configuracion),
        api.get('/dashboard/categorias', configuracion)
      ]);

  // 🔍 INYECCIÓN DE DIAGNÓSTICO EN EL FRONTEND
      console.log("==================================================");
      console.log("== 📥 RESPUESTA REAL DEL BACKEND EN AXIOS ==");
      console.log("Data completa:", resAnalitica.data);
      console.log("Objeto logística:", resAnalitica.data?.logistica);
      console.log("==================================================");

      setMetricas(resAnalitica.data);
      setCategorias(resCategorias.data);
    } catch (err) {
      console.error(err);
      setErrorDashboard(err.response?.data?.error || 'Erro ao carregar dados do painel analítico.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInformacionDashboard();
  }, []);

  // 2. CONTROL ABM: AGREGAR CATEGORÍA NUEVA (POST)
  const manejarCrearCategoria = async (e) => {
    e.preventDefault();
    setErrorDashboard('');
    setMensajeExito('');
    if (!nuevaCategoria.trim()) return;

    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };

      await api.post('/dashboard/categorias', { nombre: nuevaCategoria }, configuracion);
      setNuevaCategoria('');
      setMensajeExito('¡Categoría agregada con éxito al catálogo invisible!');
      cargarInformacionDashboard(); // Refresca las tablas analíticas
    } catch (err) {
      setErrorDashboard(err.response?.data?.error || 'Erro ao criar categoria.');
    }
  };

  // 3. CONTROL ABM: ELIMINAR CATEGORÍA VALIDAD EN STOCK CERO (DELETE)
  const manejarEliminarCategoria = async (idCategoria) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta categoría de la base de datos?')) return;
    setErrorDashboard('');
    setMensajeExito('');

    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };

      await api.delete(`/dashboard/categorias/${idCategoria}`, configuracion);
      setMensajeExito('¡Categoría removida del catálogo de forma exitosa!');
      cargarInformacionDashboard();
    } catch (err) {
      setErrorDashboard(err.response?.data?.error || 'Erro ao deletar categoria.');
    }
  };

  if (cargando) {
    return <div className="voke-catalogo-cargando-box"><p>Cargando métricas de administración corporativa...</p></div>;
  }

  //const logisticaData = metricas?.logistica[0] || {};
  // SOLUCIÓN DE DESESTRUCTURACIÓN: Extraemos de forma directa el objeto validado por Axios
  const logisticaData = metricas && metricas.logistica ? metricas.logistica : {
    pendientes: 0,
    despachados: 0,
    en_camino: 0,
    entregados: 0,
    devueltos: 0,
    no_entregados: 0
  };

  return (
    <div className="voke-dashboard-wrapper-principal">
      <div className="voke-form-title-block">
        <h2 className="voke-form-title-text">Dashboard de Administración Voke</h2>
        <p className="voke-form-subtitle-text">Panel analítico e inventario de control interno para el Backoffice.</p>
      </div>

      {errorDashboard && <div className="voke-alerta-box voke-alerta-error">{errorDashboard}</div>}
      {mensajeExito && <div className="voke-alerta-box voke-alerta-success">{mensajeExito}</div>}

      {/* ================= RESUMEN DE INDICADORES / FINANZAS ================= */}
      <div className="voke-dashboard-grid-tarjetas">
        <div className="voke-dashboard-card-indicador">
          <span className="voke-dashboard-card-icon">💰</span>
          <div className="voke-dashboard-card-info">
            <h4>Ventas Totales Aprobadas</h4>
            <p className="voke-card-monto-destacado">R\$ {metricas?.totalVentas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* ================= MONITOREO DE DESPACHOS / LOGÍSTICA ================= */}
      <div className="voke-dashboard-seccion-bloque">
        <h3 className="voke-form-title-subsegment">📊 Monitoreo de Envíos y Logística de Despacho</h3>
        <div className="voke-dashboard-grid-logistica">
          <div className="voke-logistica-badge-item status-pendiente">
            <span>Pendientes:</span> <strong>{logisticaData.pendientes || 0}</strong>
          </div>
          <div className="voke-logistica-badge-item status-despachado">
            <span>Despachados:</span> <strong>{logisticaData.despachados || 0}</strong>
          </div>
          <div className="voke-logistica-badge-item status-camino">
            <span>En Camino:</span> <strong>{logisticaData.en_camino || 0}</strong>
          </div>
          <div className="voke-logistica-badge-item status-entregado">
            <span>Completados (Entregados):</span> <strong>{logisticaData.entregados || 0}</strong>
          </div>
          <div className="voke-logistica-badge-item status-devuelto">
            <span>Devueltos:</span> <strong>{logisticaData.devueltos || 0}</strong>
          </div>
          <div className="voke-logistica-badge-item status-no-entregado">
            <span>No Entregados:</span> <strong>{logisticaData.no_entregados || 0}</strong>
          </div>
        </div>
      </div>

      {/* ================= MEDICIÓN DE STOCK E INVENTARIO ================= */}
      <div className="voke-dashboard-seccion-bloque voke-profile-section-form-spaced">
        <h3 className="voke-form-title-subsegment">📦 Medición de Stock y Alertas de Almacén</h3>
        <div className="voke-dashboard-tabla-contenedor">
          <table className="voke-dashboard-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Base</th>
                <th>Existencias en Stock</th>
                <th>Estatus Almacén</th>
              </tr>
            </thead>
            <tbody>
              {metricas?.inventarioStock.map((prod, idx) => (
                <tr key={idx}>
                  <td>{prod.nombre}</td>
                  <td>R\$ {parseFloat(prod.precio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="voke-tarjeta-cuota-destacada">{prod.stock} un.</td>
                  <td>
                    <span className={`voke-stock-alerta-pill ${prod.stock <= 5 ? 'pill-critico' : 'pill-optimo'}`}>
                      {prod.stock === 0 ? 'Agotado Crítico' : (prod.stock <= 5 ? 'Abastecimiento Bajo' : 'Stock Óptimo')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= GESTIÓN EXCLUSIVA ABM DE CATEGORÍAS ================= */}
      <div className="voke-dashboard-seccion-bloque voke-crud-seguridad-box">
        <h3 className="voke-form-title-subsegment">🛡️ Gestión de Categorías (Control Interno Obligatorio)</h3>
        <p className="voke-notif-subtext">Sección invisible para usuarios comunes. Se prohíbe la eliminación de categorías con stock activo mayor a cero.</p>

        {/* Formulario de Alta */}
        <form onSubmit={manejarCrearCategoria} className="voke-dashboard-alta-categoria-form">
          <input 
            type="text" 
            value={nuevaCategoria} 
            onChange={(e) => setNuevaCategoria(e.target.value)} 
            placeholder="Nombre de la nueva categoría (Ej: Impresoras)" 
            className="voke-form-input-text" 
            required 
          />
          <button type="submit" className="voke-submit-btn-black btn-alta-dashboard">Agregar Categoría</button>
        </form>

        {/* Tabla ABM de Consultas y Bajas */}
        <div className="voke-dashboard-tabla-contenedor">
          <table className="voke-dashboard-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Categoría</th>
                <th>Productos Vinculados</th>
                <th>Inventario Combinado</th>
                <th>Acción de Control</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td className="voke-tarjeta-cuota-destacada">{cat.nombre}</td>
                  <td>{cat.total_productos_vinculados} artículos</td>
                  <td>{cat.stock_total} unidades</td>
                  <td>
                    <button 
                      type="button" 
                      onClick={() => manejarEliminarCategoria(cat.id)} 
                      className={`voke-btn-eliminar btn-baja-dashboard ${parseInt(cat.stock_total) > 0 ? 'btn-desactivado' : ''}`}
                      disabled={parseInt(cat.stock_total) > 0}
                      title={parseInt(cat.stock_total) > 0 ? "Bloqueado: Inventario mayor a cero" : "Eliminar de la tienda"}
                    >
                      {parseInt(cat.stock_total) > 0 ? '🔒 Bloqueado' : '🗑️ Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardAdmin;