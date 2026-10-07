import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DrawerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Estado para controlar qué menú o departamento principal está expandido
  const [submenuAbierto, setSubmenuAbierto] = useState(null);

  // Sincronizar el usuario del LocalStorage en tiempo real al abrir el menú
  useEffect(() => {
    if (isOpen) {
      const guardado = localStorage.getItem('voke_usuario');
      if (guardado) {
        setUser(JSON.parse(guardado));
      } else {
        setUser(null);
      }
    }
  }, [isOpen]);

  // Función auxiliar para redirigir al catálogo aplicando filtros de búsqueda en la URL
  const buscarProducto = (categoria, marca = '') => {
    const url = marca 
      ? `/?categoria=${encodeURIComponent(categoria)}&marca=${encodeURIComponent(marca)}`
      : `/?categoria=${encodeURIComponent(categoria)}`;
    navigate(url);
    onClose(); // Cierra el menú lateral al hacer clic
  };

  // Alternar la apertura de los submenús de departamentos
  const toggleSubmenu = (menu) => {
    setSubmenuAbierto(submenuAbierto === menu ? null : menu);
  };

  if (!isOpen) return null;

  return (
    <div className="voke-drawer-overlay" onClick={onClose}>
      <div className="voke-drawer-box" onClick={(e) => e.stopPropagation()}>
        
        {/* CABECERA DEL MENÚ LATERAL */}
        <div className="voke-drawer-header">
          <div className="voke-drawer-welcome">¡Hola, bienvenido!</div>
          <button className="voke-drawer-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* SECCIÓN DINÁMICA: MI CUENTA */}
        <div className="voke-drawer-account-section">
          {user ? (
            <Link to="/login" className="voke-drawer-account-link" onClick={onClose}>
              <span className="voke-account-icon">👤</span>
              <span className="voke-account-text">{user.nome_completo || user.nombre || 'Mi cuenta'}</span>
            </Link>
          ) : (
            <Link to="/login" className="voke-drawer-account-link" onClick={onClose}>
              <span className="voke-account-icon">👤</span>
              <span className="voke-account-text">Mi cuenta</span>
            </Link>
          )}
        </div>

        {/* CUERPO DE NAVEGACIÓN PRINCIPAL */}
        <div className="voke-drawer-navigation">
          <div className="voke-menu-section-title">Departamentos</div>
          <ul className="voke-main-menu-list">
            {/* --- 1. CUADERNOS --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('cuadernos')}>
                <span>Cuadernos</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'cuadernos' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'cuadernos' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Cuadernos')}>Acceder a todas las marcas</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Cuadernos', 'Dell')}>Dell</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Cuadernos', 'HP')}>HP</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Cuadernos', 'Lenovo')}>Lenovo</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Cuadernos', 'Positivo')}>Positivo</li>
                </ul>
              )}
            </li>

            {/* --- 2. COMPUTADORAS --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('computadoras')}>
                <span>Computadoras</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'computadoras' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'computadoras' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Computadoras')}>Acceder a todo</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Computadoras', 'Dell')}>Dell</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Computadoras', 'HP')}>HP</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Computadoras', 'Lenovo')}>Lenovo</li>
                </ul>
              )}
            </li>

            {/* --- 3. SMARTPHONES --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('smartphones')}>
                <span>Smartphones</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'smartphones' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'smartphones' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Smartphones')}>Acceder a todo</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Smartphones', 'Apple')}>Manzana</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Smartphones', 'LG')}>LG</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Smartphones', 'Motorola')}>Motorola</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Smartphones', 'Samsung')}>Samsung</li>
                </ul>
              )}
            </li>

            {/* --- 4. TABLETAS --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('tabletas')}>
                <span>Tabletas</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'tabletas' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'tabletas' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Tabletas')}>Acceder a todo</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Tabletas', 'Apple')}>Manzana</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Tabletas', 'Samsung')}>Samsung</li>
                </ul>
              )}
            </li>

            {/* --- 5. MONITORES --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('monitores')}>
                <span>Monitores</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'monitores' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'monitores' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Monitores')}>Acceder a todo</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Monitores', '19P')}>19P</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Monitores', '20P')}>20P</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Monitores', '22P')}>22P</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Monitores', '23P')}>23P</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Monitores', '24P')}>24P</li>
                </ul>
              )}
            </li>
            {/* --- 6. ACCESORIOS Y PERIFÉRICOS --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger-direct" onClick={() => buscarProducto('Accesorios')}>
                <span>Accesorios y Periféricos</span>
              </div>
            </li>

            {/* --- 7. MENU MANZANA (APPLE GENERAL) --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger" onClick={() => toggleSubmenu('manzana')}>
                <span>Menu Manzana</span>
                <span className="voke-menu-arrow">{submenuAbierto === 'manzana' ? '▲' : '▼'}</span>
              </div>
              {submenuAbierto === 'manzana' && (
                <ul className="voke-submenu-list">
                  <li className="voke-submenu-item-all" onClick={() => buscarProducto('Apple')}>Acceder a todo</li>
                  <li className="voke-submenu-title">Marcas</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Apple', 'iPad')}>iPad</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Apple', 'iPhone')}>iPhone</li>
                  <li className="voke-submenu-item" onClick={() => buscarProducto('Apple', 'Macbook')}>Macbook</li>
                </ul>
              )}
            </li>

            {/* --- 8. CHROMEBOOK --- */}
            <li className="voke-menu-item-main">
              <div className="voke-menu-trigger-direct" onClick={() => buscarProducto('Chromebook')}>
                <span>Menu Chromebook</span>
              </div>
            </li>

          </ul>
        </div>

      </div>
    </div>
  );
};

export default DrawerMenu;