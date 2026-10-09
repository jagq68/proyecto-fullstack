import React, { useState, useEffect } from 'react';
import api from '../config/api';

const DashboardAdmin = () => {
  // CONFIGURACIÓN DE ESTADOS REALES UNIFICADOS
  const [metricas, setMetricas] = useState(null);               
  const [categorias, setCategorias] = useState([]);             
  const [usuarios, setUsuarios] = useState([]);                 
  const [pedidos, setPedidos] = useState([]); 
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // 1. CARGA INICIAL COMPLETA (Promise.all con 4 consultas en paralelo)
  const cargarInformacionDashboard = async () => {
    setCargando(true);
    setErrorDashboard('');
    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };

      const [resAnalitica, resCategorias, resUsuarios, resPedidos] = await Promise.all([
        api.get('/dashboard/analitica', configuracion),
        api.get('/dashboard/categorias', configuracion),
        api.get('/dashboard/usuarios', configuracion),
        api.get('/logistica/pedidos-todos', configuracion)
      ]);

      setMetricas(resAnalitica.data);
      setCategorias(resCategorias.data);
      setUsuarios(resUsuarios.data);
      setPedidos(resPedidos.data);
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
  // 2. FUNCIÓN PARA ALTERAR EL ESTADO LOGÍSTICO CON UN CLIC (PUT)
  const manejarCambioEstadoPedido = async (idPedido, nuevoEstado) => {
    setErrorDashboard('');
    setMensajeExito('');
    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const cuerpo = { 
        nuevoEstado, 
        detallesHistorial: `O pedido foi movido para o status [${nuevoEstado}] pelo administrador.` 
      };

      const respuesta = await api.put(`/logistica/actualizar-estado/${idPedido}`, cuerpo, configuracion);
      setMensajeExito(respuesta.data.mensaje || '¡Estado actualizado con éxito!');
      cargarInformacionDashboard(); // Refresca las barras de colores en vivo al instante
    } catch (err) {
      setErrorDashboard(err.response?.data?.error || 'Erro ao atualizar estado logístico.');
    }
  };

  // 3. CONTROL DE ROLES: ASIGNACIÓN EN CALIENTE (PUT)
  const manejarCambioDeRol = async (idUsuario, rolActual) => {
    const nuevoPerfil = rolActual === 'admin' ? 'cliente' : 'admin';
    const mensajeConfirmacion = nuevoPerfil === 'admin' 
      ? '¿Está seguro de ascender a este usuario a rango de Administrador Supremo Voke?' 
      : '¿Está seguro de remover los permisos de administrador y degradarlo a cliente común?';
      
    if (!window.confirm(mensajeConfirmacion)) return;
    setErrorDashboard('');
    setMensajeExito('');

    try {
      const token = localStorage.getItem('voke_token');
      const configuracion = { headers: { 'Authorization': `Bearer ${token}` } };

      const respuesta = await api.put(`/dashboard/usuarios/rol/${idUsuario}`, { nuevoPerfil }, configuracion);
      setMensajeExito(respuesta.data.mensaje || '¡Rol actualizado con éxito en PostgreSQL!');
      cargarInformacionDashboard(); 
    } catch (err) {
      setErrorDashboard(err.response?.data?.error || 'Erro al intentar modificar el rol de seguridad.');
    }
  };

  // 4. CONTROL ABM: AGREGAR CATEGORÍA NUEVA (POST)
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
      cargarInformacionDashboard(); 
    } catch (err) {
      setErrorDashboard(err.response?.data?.error || 'Erro ao criar categoria.');
    }
  };

  // 5. CONTROL ABM: ELIMINAR CATEGORÍA VALIDADA EN STOCK CERO (DELETE)
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

  // Saneamiento seguro de datos analíticos para la desestructuración de Axios
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

      {/* ================= SECCIÓN 1: INDICADORES FINANCIEROS ================= */}
      <div className="voke-dashboard-grid-tarjetas">
        <div className="voke-dashboard-card-indicador">
          <span className="voke-dashboard-card-icon">💰</span>
          <div className="voke-dashboard-card-info">
            <h4>Ventas Totales Aprobadas</h4>
            <p className="voke-card-monto-destacado">
              R\$ {metricas?.totalVentas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN 2: MONITOREO LOGÍSTICO ================= */}
      <div className="voke-dashboard-seccion-bloque">
        <h3 className="voke-form-title-subsegment">📊 Monitoreo de Envíos y Logística de Despacho</h3>
        <div className="voke-dashboard-grid-logistica">
          <div className="voke-logistica-badge-item status-pendiente">
            <span>Pendientes:</span> <strong>{logisticaData.pendientes}</strong>
          </div>
          <div className="voke-logistica-badge-item status-despachado">
            <span>Despachados:</span> <strong>{logisticaData.despachados}</strong>
          </div>
          <div className="voke-logistica-badge-item status-camino">
            <span>En Camino:</span> <strong>{logisticaData.en_camino}</strong>
          </div>
          <div className="voke-logistica-badge-item status-entregado">
            <span>Completados (Entregados):</span> <strong>{logisticaData.entregados}</strong>
          </div>
          <div className="voke-logistica-badge-item status-devuelto">
            <span>Devueltos:</span> <strong>{logisticaData.devueltos}</strong>
          </div>
          <div className="voke-logistica-badge-item status-no-entregado">
            <span>No Entregados:</span> <strong>{logisticaData.no_entregados}</strong>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN INTERACTIVA: GESTIÓN DE ÓRDENES ================= */}
      <div className="voke-dashboard-seccion-bloque voke-profile-section-form-spaced">
        <h3 className="voke-form-title-subsegment">📦 Gestión de Órdenes y Control de Despachos en un Clic</h3>
        <p className="voke-notif-subtext">Modifique el estado logístico de los pedidos para disparar las actualizaciones en las barras y notificar al cliente.</p>
        
        <div className="voke-dashboard-tabla-contenedor">
          <table className="voke-dashboard-tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Total</th>
                <th>Estado Pago</th>
                <th>Estatus Envío Actual</th>
                <th>Acción Operativa</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((ped) => (
                <tr key={ped.id}>
                  <td><strong>#{ped.id}</strong></td>
                  <td>{ped.nome_completo}</td>
                  <td>{ped.ciudad}</td>
                  <td className="voke-tarjeta-cuota-destacada">R\$ {parseFloat(ped.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`voke-stock-alerta-pill ${ped.estado_pago === 'Pago Aprovado' ? 'pill-optimo' : 'pill-critico'}`}>
                      {ped.estado_pago}
                    </span>
                  </td>
                  <td>
                    <span className="voke-rol-pill role-admin">
                      {ped.status_envio}
                    </span>
                  </td>
                  <td>
                    <select
                      value={ped.status_envio}
                      onChange={(e) => manejarCambioEstadoPedido(ped.id, e.target.value)}
                      className="voke-form-input-text voke-select-logistica-dashboard"
                    >
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="Despachado">📦 Despachado</option>
                      <option value="En camino">🚚 En camino</option>
                      <option value="Entregado">✅ Entregado</option>
                      <option value="Devuelto">↩️ Devuelto</option>
                      <option value="No entregado">❌ No entregado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ================= SECCIÓN 3: MEDICIÓN DE STOCK E INVENTARIO ================= */}
      <div className="voke-dashboard-seccion-bloque voke-profile-section-form-spaced">
        <h3 className="voke-form-title-subsegment">📊 Inventario y Alertas de Almacén</h3>
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
              {metricas?.inventarioStock?.map((prod, idx) => (
                <tr key={idx}>
                  <td>{prod.nombre}</td>
                  <td>R\$ {parseFloat(prod.precio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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

      {/* ================= SECCIÓN 4: GESTIÓN DE CATEGORÍAS (ABM) ================= */}
      <div className="voke-dashboard-seccion-bloque">
        <h3 className="voke-form-title-subsegment">Catálogo de Categorías</h3>
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

      {/* ================= SECCIÓN 5: GESTIÓN DE ROLES Y PERSONAL ================= */}
      <div className="voke-dashboard-seccion-bloque voke-profile-section-form-spaced">
        <h3 className="voke-form-title-subsegment">👥 Control de Personal y Asignación de Roles</h3>
        <p className="voke-notif-subtext">Lista completa de cuentas registradas en PostgreSQL. Permite ascender a clientes comunes a administradores con acceso total al Backoffice.</p>
        <div className="voke-dashboard-tabla-contenedor">
          <table className="voke-dashboard-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol Actual</th>
                <th>Acción de Seguridad</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td className="voke-tarjeta-cuota-destacada">{user.nome_completo || 'Administrador Semilla'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`voke-rol-pill ${user.perfil === 'admin' ? 'role-admin' : 'role-cliente'}`}>
                      {user.perfil === 'admin' ? '🛡️ Administrador' : '👤 Cliente'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => manejarCambioDeRol(user.id, user.perfil)}
                      className={`voke-btn-rol-toggle ${user.perfil === 'admin' ? 'btn-degrade' : 'btn-ascend'}`}
                      disabled={parseInt(user.id) === JSON.parse(localStorage.getItem('voke_usuario') || '{}').id}
                      title={parseInt(user.id) === JSON.parse(localStorage.getItem('voke_usuario') || '{}').id ? "Cuenta maestra protegida" : "Cambiar permisos"}
                    >
                      {parseInt(user.id) === JSON.parse(localStorage.getItem('voke_usuario') || '{}').id ? '🔒 Protegido' : (user.perfil === 'admin' ? '⬇️ Degradar' : '⬆️ Ascender')}
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