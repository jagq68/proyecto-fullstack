import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  // Flujo secuencial estricto de Voke: 'acceso', 'registro', o 'perfil'
  const [faseActual, setFaseActual] = useState('acceso');
  const [tipoDocumento, setTipoDocumento] = useState('CPF');
  
  // ESTADOS MAESTROS DE LOS CAMPOS
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [contrasenaAnterior, setContrasenaAnterior] = useState('');
  const [nombre, setNombre] = useState('');
  const [numDoc, setNumDoc] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState('');
  const [tel, setTel] = useState('');

  // Canales de notificación opcionales
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifTel, setNotifTel] = useState(false);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);
  const [notifSms, setNotifSms] = useState(false);

  const [user, setUser] = useState(null);
  const [alerta, setAlerta] = useState({ txt: '', err: false });

  // Sincronización estricta al cargar el componente
    useEffect(() => {
    const guardado = localStorage.getItem('voke_usuario');
    const token = localStorage.getItem('voke_token');
    
    if (guardado && token) {
      try {
        const u = JSON.parse(guardado);
        setUser(u);
        setNombre(u.nome_completo || u.nombre || '');
        setEmail(u.email || '');
        setTel(u.telefono || u.tel || '');
        setNumDoc(u.cpf_cnpj || '');
        setFecha(u.fecha_nacimiento || '');
        setSexo(u.sexo || '');
        
        // CORRECCIÓN: Si ya hay sesión activa, lo dejamos en 'acceso' de manera informativa
        // o si vino directo a la ruta, no lo forzamos a saltar al CRUD a menos que pulse un enlace
        setFaseActual('acceso'); 
      } catch (e) {
        localStorage.clear();
        setUser(null);
        setFaseActual('acceso');
      }
    } else {
      setUser(null);
      setFaseActual('acceso'); 
    }
  }, []);

//   useEffect(() => {
//     const guardado = localStorage.getItem('voke_usuario');
//     const token = localStorage.getItem('voke_token');
    
//     if (guardado && token) {
//       try {
//         const u = JSON.parse(guardado);
//         setUser(u);
//         setFaseActual('perfil'); 
//         setNombre(u.nome_completo || u.nombre || '');
//         setEmail(u.email || '');
//         setTel(u.telefono || u.tel || '');
//         setNumDoc(u.cpf_cnpj || '');
//         setFecha(u.fecha_nacimiento || '');
//         setSexo(u.sexo || '');
//       } catch (e) {
//         localStorage.clear();
//         setUser(null);
//         setFaseActual('acceso');
//       }
//     } else {
//       setUser(null);
//       setFaseActual('acceso'); 
//     }
//   }, []);
  // ==========================================
  // FUNCIONES CONTROLADORAS DEL CRUD
  // ==========================================
  const ingresar = async (e) => {
    e.preventDefault();
    setAlerta({ txt: '', err: false });
    if (!email || !pass) return setAlerta({ txt: 'Por favor, insira e-mail e senha.', err: true });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: pass })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'E-mail ou senha incorretos.');

      localStorage.setItem('voke_token', data.token);
      localStorage.setItem('voke_usuario', JSON.stringify(data.usuario));
      
      setUser(data.usuario);
      setNombre(data.usuario.nome_completo || data.usuario.nombre || '');
      setEmail(data.usuario.email || '');
      setTel(data.usuario.telefono || data.usuario.tel || '');
      
      setContrasenaAnterior('');
      setPass('');
      setConfPass('');
      
      window.dispatchEvent(new Event('carrito_actualizado'));
      
      // SOLUCIÓN: En lugar de saltar al perfil interno, redirige al inicio a comprar
      navigate('/'); 
    } catch (err) {
      setAlerta({ txt: err.message, err: true });
    }
  };

//   const ingresar = async (e) => {
//     e.preventDefault();
//     setAlerta({ txt: '', err: false });
//     if (!email || !pass) return setAlerta({ txt: 'Por favor, insira e-mail e senha.', err: true });
    
//     try {
//       // Uso de fetch directo para descartar problemas de interceptores en la red
//       const response = await fetch('http://localhost:3001/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, contrasena: pass })
//       });
//       const data = await response.json();

//       if (!response.ok) throw new Error(data.error || 'E-mail ou senha incorretos.');

//       localStorage.setItem('voke_token', data.token);
//       localStorage.setItem('voke_usuario', JSON.stringify(data.usuario));
      
//       setUser(data.usuario);
//       setNombre(data.usuario.nome_completo || data.usuario.nombre || '');
//       setEmail(data.usuario.email || '');
//       setTel(data.usuario.telefono || data.usuario.tel || '');
      
//       setContrasenaAnterior('');
//       setPass('');
//       setConfPass('');
      
//       window.dispatchEvent(new Event('carrito_actualizado'));
//       setFaseActual('perfil');
//     } catch (err) {
//       setAlerta({ txt: err.message, err: true });
//     }
//   };

  const registrar = async (e) => {
    e.preventDefault();
    setAlerta({ txt: '', err: false });
    if (pass !== confPass) return setAlerta({ txt: 'As senhas não coincidem.', err: true });
    
    try {
      const datos = { 
        email, 
        contrasena: pass,       
        cpf_cnpj: numDoc,       
        nome_completo: nombre,  
        fecha_nacimiento: fecha || null, 
        sexo: sexo || 'O', 
        telefono: tel || null, 
        perfil: 'cliente'
      };
      
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao realizar cadastro no sistema.');

      // El usuario ya se insertó con éxito en PostgreSQL. Guardamos las credenciales generadas
      localStorage.setItem('voke_token', data.token);
      localStorage.setItem('voke_usuario', JSON.stringify(data.usuario));
      
      setUser(data.usuario);
      
      // LIMPIEZA CLAVE: Se vacían los estados de contraseña del formulario de registro
      // para que la Fase 3 no herede claves ni dispare errores de validación anteriores
      setContrasenaAnterior('');
      setPass('');
      setConfPass('');
      
      window.dispatchEvent(new Event('carrito_actualizado'));
      setFaseActual('perfil'); 
    } catch (err) {
      localStorage.removeItem('voke_token');
      localStorage.removeItem('voke_usuario');
      setUser(null);
      setAlerta({ txt: err.message, err: true });
    }
  };

  const modificarDatosBasicos = async (e) => {
    e.preventDefault();
    setAlerta({ txt: '', err: false });
    try {
      const response = await fetch(`http://localhost:3001/api/auth/usuario/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('voke_token')}`
        },
        body: JSON.stringify({ nome_completo: nombre, email, telefono: tel })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar dados cadastrais.');

      localStorage.setItem('voke_usuario', JSON.stringify(data.usuario));
      setAlerta({ txt: 'Dados pessoais atualizados com sucesso!', err: false });
    } catch (err) {
      setAlerta({ txt: err.message, err: true });
    }
  };

  const modificarContrasena = async (e) => {
    e.preventDefault();
    setAlerta({ txt: '', err: false });
    if (!contrasenaAnterior || !pass) {
      return setAlerta({ txt: 'A senha anterior e a nova senha são obrigatórias.', err: true });
    }
    try {
      const response = await fetch(`http://localhost:3001/api/auth/usuario/password/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('voke_token')}`
        },
        body: JSON.stringify({ contrasenaAnterior, nuevaContrasena: pass })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Senha anterior incorreta. Verifique os dados.');

      setAlerta({ txt: 'Senha alterada com sucesso!', err: false });
      setContrasenaAnterior('');
      setPass('');
    } catch (err) {
      setAlerta({ txt: err.message, err: true });
    }
  };

  const eliminar = async () => {
    if (window.confirm("Deseja excluir permanentemente sua conta da Voke? Esta ação executará o método DELETE do CRUD.")) {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/usuario/${user.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('voke_token')}` }
        });
        if (!response.ok) throw new Error('Erro ao deletar usuário do banco de dados.');

        localStorage.clear();
        setUser(null);
        setEmail('');
        setPass('');
        setNombre('');
        setTel('');
        window.dispatchEvent(new Event('carrito_actualizado'));
        setFaseActual('acceso');
        navigate('/');
      } catch (err) {
        setAlerta({ txt: err.message, err: true });
      }
    }
  };
    // ==========================================
  // RENDERIZADO VISUAL DEL COMPONENTE
  // ==========================================
  return (
    <div className="voke-login-wrapper">
      <div className="voke-login-card-box">
        
        <div className="voke-logo-header">
          <Link to="/" className="voke-logo-text">voke</Link>
          <p className="voke-logo-sub">Simulação Loja Brasil</p>
        </div>

        {alerta.txt && (
          <div className={`voke-alerta-box ${alerta.err ? 'voke-alerta-error' : 'voke-alerta-success'}`}>
            {alerta.txt}
          </div>
        )}

        {/* --- FASE 1: ACCESO --- */}
                {/* --- FASE 1: ACCESO INFORMATIVO --- */}
        {faseActual === 'acceso' && (
          <div>
            {!user ? (
              /* SI NO ESTÁ LOGUEADO: Muestra el formulario tradicional de email y clave */
              <form onSubmit={ingresar}>
                <div className="voke-form-title-block">
                  <h3 className="voke-form-title-text">Acceso</h3>
                  <p className="voke-form-subtitle-text">¿Ya eres cliente de Voke?</p>
                </div>
                
                <div className="voke-form-group-block">
                  <label className="voke-form-label">Correo electrónico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduce tu dirección de correo" className="voke-form-input-text" />
                </div>
                
                <div className="voke-form-group-block">
                  <label className="voke-form-label">Contraseña</label>
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Introduce tu contraseña" className="voke-form-input-text" />
                </div>
                
                <button type="submit" className="voke-submit-btn-black">Para entrar</button>
                
                <div className="voke-login-footer-info">
                  <p className="voke-form-label">Crear una cuenta</p>
                  <p className="voke-form-subtitle-text">¿Aún no tienes una cuenta de Voke?</p>
                  <span onClick={() => setFaseActual('registro')} className="voke-login-link-blue">Registro</span>
                </div>
                
                <div className="voke-logo-header-forgot">
                  <span className="voke-login-link-blue-small">¿Esqueceu sua senha?</span>
                </div>
              </form>
            ) : (
              /* SI YA INICIÓ SESIÓN: Le da la bienvenida y le permite elegir su acción */
              <div className="voke-sesion-activa-block">
                <div className="voke-form-title-block">
                  <h3 className="voke-form-title-text">Olá, {nombre || 'Cliente'}</h3>
                  <p className="voke-form-subtitle-text">Você já está autenticado no sistema da Voke.</p>
                </div>

                <button onClick={() => navigate('/')} className="voke-submit-btn-black">
                  Ir às Compras (Ver Produtos)
                </button>

                <div className="voke-login-footer-info" style={{ textAlign: 'center' }}>
                  <p className="voke-form-subtitle-text">¿Deseja atualizar seu perfil ou senha?</p>
                  <span onClick={() => setFaseActual('perfil')} className="voke-login-link-blue" style={{ marginTop: '8px', display: 'inline-block' }}>
                    Alterar meus dados cadastrais
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* {faseActual === 'acceso' && !user && (
          <form onSubmit={ingresar}>
            <div className="voke-form-title-block">
              <h3 className="voke-form-title-text">Acceso</h3>
              <p className="voke-form-subtitle-text">¿Ya eres cliente de Voke?</p>
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduce tu dirección de correo" className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Introduce tu contraseña" className="voke-form-input-text" />
            </div>
            
            <button type="submit" className="voke-submit-btn-black">Para entrar</button>
            
            <div className="voke-login-footer-info">
              <p className="voke-form-label">Crear una cuenta</p>
              <p className="voke-form-subtitle-text">¿Aún no tienes una cuenta de Voke?</p>
              <span onClick={() => setFaseActual('registro')} className="voke-login-link-blue">Registro</span>
            </div>
            
            <div className="voke-logo-header-forgot">
              <span className="voke-login-link-blue-small">¿Esqueceu sua senha?</span>
            </div>
          </form>
        )} */}

        {/* --- FASE 2: REGISTRO EXTENDIDO --- */}
        {faseActual === 'registro' && !user && (
          <form onSubmit={registrar}>
            <div className="voke-form-title-block">
              <h3 className="voke-form-title-text">Crear una cuenta</h3>
            </div>
            
            <div className="voke-radio-group">
              <label className="voke-radio-label">
                <input type="radio" checked={tipoDocumento === 'CPF'} onChange={() => setTipoDocumento('CPF')} /> CPF
              </label>
              <label className="voke-radio-label">
                <input type="radio" checked={tipoDocumento === 'CNPJ'} onChange={() => setTipoDocumento('CNPJ')} /> CNPJ
              </label>
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">{tipoDocumento}</label>
              <input type="text" value={numDoc} onChange={(e) => setNumDoc(e.target.value)} placeholder="000.000.000-00" className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Nombre completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Escribe tu nombre." className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Fecha de nacimiento</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Sexo</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="voke-form-input-text">
                <option value="">Sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Teléfono</label>
              <input type="text" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(00) 0000 0000" className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduce tu mejor dirección de correo electrónico." className="voke-form-input-text" />
            </div>
            
            <div className="voke-form-group-block">
              <label className="voke-form-label">Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Introduce tu contraseña." className="voke-form-input-text" />
            </div>

            <div className="voke-consejos-box">
              <p className="voke-form-label">Consejos:</p>
              <p className="voke-consejos-desc">Le sugerimos que no incluya datos personales, así como sus contraseñas más recientes utilizadas aquí en Voke o en otros sitios web.</p>
              <ul className="voke-consejos-list">
                <li>• Mínimo de 8 caracteres</li>
                <li>• Letras mayúsculas y minúsculas (A/a)</li>
                <li>• Al menos 1 número (148)</li>
                <li>• Caracteres especiales (@\$#)</li>
                <li>• No utilice secuencias (123/Abc)</li>
              </ul>
            </div>
            
            <div className="voke-form-group-block-spaced">
              <label className="voke-form-label">confirmar Contraseña</label>
              <input type="password" value={confPass} onChange={(e) => setConfPass(e.target.value)} placeholder="Introduzca la misma contraseña que arriba." className="voke-form-input-text" />
            </div>

            <div className="voke-form-group-block">
              <label className="voke-form-label">Canales de notificación (opcional)</label>
              <p className="voke-notif-subtext">Selecciona los canales desde los que deseas recibir notificaciones de Voke.</p>
              <div className="voke-notif-list">
                <label className="voke-notif-label"><input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} /> correo electrónico</label>
                <label className="voke-notif-label"><input type="checkbox" checked={notifTel} onChange={(e) => setNotifTel(e.target.checked)} /> teléfono</label>
                <label className="voke-notif-label"><input type="checkbox" checked={notifWhatsapp} onChange={(e) => setNotifWhatsapp(e.target.checked)} /> WhatsApp</label>
                <label className="voke-notif-label"><input type="checkbox" checked={notifSms} onChange={(e) => setNotifSms(e.target.checked)} /> SMS</label>
              </div>
            </div>

            <div className="voke-buttons-flex">
              <button type="button" onClick={() => setFaseActual('acceso')} className="voke-btn-volver">Volver</button>
              <button type="submit" className="voke-btn-continuar">Continuar con el registro</button>
            </div>
          </form>
        )}
        {/* --- FASE 3: DADOS DO CLIENTE (PANEL CRUD POST-REGISTRO O LOGIN) --- */}
        {faseActual === 'perfil' && user && (
          <div className="voke-perfil-container">
            
            {/* SECCIÓN 1: MODIFICAR DATOS BÁSICOS (PUT DATOS) */}
            <form onSubmit={modificarDatosBasicos} className="voke-profile-section-form">
              <div className="voke-form-title-block">
                <h3 className="voke-form-title-text-profile">Dados do Cliente</h3>
                <p className="voke-form-subtitle-text">Modifique sus datos de registro aquí.</p>
              </div>
              
              <div className="voke-form-group-block">
                <label className="voke-form-label">Nome Completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="voke-form-input-text" />
              </div>
              
              <div className="voke-form-group-block">
                <label className="voke-form-label">Correo electrónico</label>
                <input type="email" value={email} className="voke-form-input-text" disabled />
              </div>
              
              <div className="voke-form-group-block">
                <label className="voke-form-label">Telefone</label>
                <input type="text" value={tel} onChange={(e) => setTel(e.target.value)} className="voke-form-input-text" />
              </div>

              <button type="submit" className="voke-btn-salvar-datos">
                Salvar Alterações (PUT Datos)
              </button>
            </form>

            {/* SECCIÓN 2: MODIFICAR EXCLUSIVAMENTE LA CLAVE (PUT CLAVE) */}
            <form onSubmit={modificarContrasena} className="voke-profile-section-form-spaced">
              <div className="voke-form-title-block">
                <h4 className="voke-form-title-subsegment">Alterar Senha de Acesso</h4>
              </div>

              <div className="voke-form-group-block">
                <label className="voke-form-label">Nova Senha</label>
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Digite nova senha" className="voke-form-input-text" />
              </div>

              <div className="voke-form-group-block voke-crud-seguridad-box">
                <label className="voke-form-label-alert">Senha Anterior (Obrigatório para alterar senha) *</label>
                <input type="password" value={contrasenaAnterior} onChange={(e) => setContrasenaAnterior(e.target.value)} placeholder="Digite sua senha atual para validar" className="voke-form-input-text" />
              </div>

              <button type="submit" className="voke-btn-salvar-clave">
                Alterar Senha (PUT Clave)
              </button>
            </form>

            {/* SECCIÓN 3: ELIMINAR CUENTA (DELETE) Y CERRAR SESIÓN */}
            <div className="voke-profile-delete-zone">
              <p className="voke-delete-warning-text">¿Desea cerrar su cuenta permanentemente?</p>
              
              <button type="button" onClick={eliminar} className="voke-btn-eliminar">
                Excluir Conta (DELETE)
              </button>

              {/* NUEVO BOTÓN: Agrega esta línea abajo para poder salir de la pantalla de inmediato */}
              <button 
                type="button" 
                onClick={() => { localStorage.clear(); setUser(null); setFaseActual('acceso'); }} 
                className="voke-btn-volver" 
                style={{ marginTop: '12px', width: '100%' }}
              >
                Sair da Conta (Logout)
              </button>
            </div>
            {/* SECCIÓN 3: ELIMINAR CUENTA (DELETE) */}
            {/* <div className="voke-profile-delete-zone">
              <p className="voke-delete-warning-text">¿Desea cerrar su cuenta permanentemente?</p>
              <button type="button" onClick={eliminar} className="voke-btn-eliminar">
                Excluir Conta (DELETE)
              </button>
            </div> */}

          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
