import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const [fase, setFase] = useState('acceso');
  const [doc, setDoc] = useState('CPF');
  
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [nombre, setNombre] = useState('');
  const [numDoc, setNumDoc] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState('');
  const [tel, setTel] = useState('');

  const [user, setUser] = useState(null);
  const [alerta, setAlerta] = useState({ txt: '', err: false });

  useEffect(() => {
    const guardado = localStorage.getItem('voke_usuario');
    if (guardado) {
      const u = JSON.parse(guardado);
      setUser(u); 
      setFase('perfil');
      setNombre(u.nome_completo || ''); 
      setEmail(u.email || ''); 
      setTel(u.telefono || '');
    }
  }, []);

  const ingresar = async (e) => {
    e.preventDefault();
    setAlerta({ txt: '', err: false });
    try {
      const res = await api.post('/auth/login', { email, contrasena: pass });
      localStorage.setItem('voke_token', res.data.token);
      localStorage.setItem('voke_usuario', JSON.stringify(res.data.usuario));
      setUser(res.data.usuario);
      window.dispatchEvent(new Event('carrito_actualizado'));
      setFase('perfil');
    } catch (err) { 
      setAlerta({ txt: 'E-mail ou senha incorretos.', err: true }); 
    }
  };

  const registrar = async (e) => {
    e.preventDefault();
    if (pass !== confPass) return setAlerta({ txt: 'As senhas não coincidem.', err: true });
    try {
      const datos = { email, contrasena: pass, cpf_cnpj: numDoc, nome_completo: nombre, fecha_nacimiento: fecha, sexo, telefono: tel, perfil: 'cliente' };
      const res = await api.post('/auth/register', datos);
      localStorage.setItem('voke_token', res.data.token);
      localStorage.setItem('voke_usuario', JSON.stringify(res.data.usuario));
      setUser(res.data.usuario);
      window.dispatchEvent(new Event('carrito_actualizado'));
      setFase('perfil');
    } catch (err) { 
      setAlerta({ txt: 'Erro ao realizar cadastro.', err: true }); 
    }
  };
  const modificar = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/auth/usuario/${user.id}`, { nome_completo: nombre, email, telefono: tel, contrasena: pass });
      localStorage.setItem('voke_usuario', JSON.stringify(res.data.usuario));
      setAlerta({ txt: 'Dados atualizados com sucesso!', err: false });
    } catch (err) { setAlerta({ txt: 'Erro ao atualizar dados.', err: true }); }
  };

  const eliminar = async () => {
    if (window.confirm("Deseja excluir permanentemente sua conta?")) {
      try {
        await api.delete(`/auth/usuario/${user.id}`);
        localStorage.clear(); setUser(null); setFase('acceso');
        window.dispatchEvent(new Event('carrito_actualizado'));
        navigate('/');
      } catch (err) { setAlerta({ txt: 'Erro ao deletar usuário.', err: true }); }
    }
  };

  return (
    <div className="voke-login-wrapper">
      <div className="voke-login-card-box">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#262626', fontSize: '32px', fontWeight: 'bold' }}>voke</Link>
          <p style={{ fontSize: '10px', color: '#98A2B3', textTransform: 'uppercase', fontWeight: 'bold', margin: '4px 0 0 0' }}>Simulação Loja Brasil</p>
        </div>

        {alerta.txt && (
          <div style={{ padding: '10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', border: '1px solid', backgroundColor: alerta.err ? '#FFF5F5' : '#E6FFFA', color: alerta.err ? '#DC3545' : '#28A745', borderColor: alerta.err ? '#DEE2E6' : '#47CD89' }}>{alerta.txt}</div>
        )}

        {/* FASE 1: ACCESO INFORMATIVO */}
        {fase === 'acceso' && (
          <form onSubmit={ingresar}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Acceso</h3>
              <p style={{ fontSize: '12px', color: '#6C757D', margin: 0 }}>¿Ya eres cliente de Voke?</p>
            </div>
            <div className="voke-form-group-block">
              <label className="voke-form-label">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="voke-form-input-text" />
            </div>
            <div className="voke-form-group-block">
              <label className="voke-form-label">Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="voke-form-input-text" />
            </div>
            <button type="submit" className="voke-submit-btn-black">Para entrar</button>
            <div className="voke-login-footer-info">
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#262626' }}>Crear una cuenta</p>
              <p style={{ margin: '0 0 8px 0' }}>¿Aún no tienes una cuenta de Voke?</p>
              <span onClick={() => setFase('registro')} style={{ color: '#295991', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Registro</span>
            </div>
          </form>
        )}

        {/* FASE 2: REGISTRO EXTENDIDO EXIGIDO */}
        {fase === 'registro' && (
          <form onSubmit={registrar}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Crear una cuenta</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginBottom: '12px' }}>
              <label><input type="radio" checked={doc === 'CPF'} onChange={() => setDoc('CPF')} /> CPF</label>
              <label><input type="radio" checked={doc === 'CNPJ'} onChange={() => setDoc('CNPJ')} /> CNPJ</label>
            </div>
            <div className="voke-form-group-block"><label className="voke-form-label">{doc} *</label><input type="text" value={numDoc} onChange={(e) => setNumDoc(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Nombre completo *</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Fecha de nacimiento *</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Sexo *</label><select value={sexo} onChange={(e) => setSexo(e.target.value)} className="voke-form-input-text"><option value="">Sexo</option><option value="M">Masculino</option><option value="F">Feminino</option></select></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Teléfono *</label><input type="text" value={tel} onChange={(e) => setTel(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Correo electrónico *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Contraseña *</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Confirmar Contraseña *</label><input type="password" value={confPass} onChange={(e) => setConfPass(e.target.value)} className="voke-form-input-text" /></div>
            
            {/* CONSEJOS DE SEGURIDAD EXIGIDOS */}
            <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '4px', padding: '12px', fontSize: '11px', color: '#6C757D', marginBottom: '16px', lineHeight: '1.4' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>Consejos:</p>
              <p style={{ margin: '0 0 6px 0' }}>Le sugerimos que no incluya datos personales, así como sus contraseñas más recientes utilizadas aquí en Voke o en otros sitios web.</p>
              <p style={{ margin: 0 }}>• Mínimo de 8 caracteres<br />• Letras mayúsculas y minúsculas (A/a)<br />• Al menos 1 número (148)<br />• Caracteres especiales (@\$#)<br />• No utilice secuencias (123/Abc)</p>
            </div>

            {/* CANALES DE NOTIFICACIÓN OPCIONALES */}
            <div style={{ borderTop: '1px solid #DEE2E6', paddingTop: '12px', marginBottom: '16px' }}>
              <label className="voke-form-label" style={{ display: 'block', marginBottom: '6px' }}>Canales de notificación (opcional)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <label><input type="checkbox" /> correo electronico</label>
                <label><input type="checkbox" /> teléfono</label>
                <label><input type="checkbox" /> WhatsApp</label>
                <label><input type="checkbox" /> SMS</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button type="button" onClick={() => setFase('acceso')} className="voke-submit-btn-black" style={{ backgroundColor: '#6C757D', width: 'auto', padding: '10px 20px' }}>Volver</button>
              <button type="submit" className="voke-submit-btn-black" style={{ backgroundColor: '#295991', width: 'auto', padding: '10px 20px' }}>Continuar con el registro</button>
            </div>
          </form>
        )}

        {/* FASE 3: MODIFICACIÓN Y ELIMINACIÓN CRUD DEL CLIENTE AGREGADO */}
        {fase === 'perfil' && user && (
          <form onSubmit={modificar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, borderBottom: '1px solid #DEE2E6', paddingBottom: '8px' }}>Dados do Cliente</h3>
            <div className="voke-form-group-block"><label className="voke-form-label">Nome Completo</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Telefone</label><input type="text" value={tel} onChange={(e) => setTel(e.target.value)} className="voke-form-input-text" /></div>
            <div className="voke-form-group-block"><label className="voke-form-label">Nova Senha (Modificar Clave)</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Preencha se desejar alterar" className="voke-form-input-text" /></div>
            <button type="submit" className="voke-submit-btn-black" style={{ backgroundColor: '#295991' }}>Modificar Dados do Registro (PUT)</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button type="button" onClick={() => { localStorage.clear(); setUser(null); setFase('acceso'); }} className="voke-submit-btn-black" style={{ backgroundColor: '#6C757D', padding: '10px' }}>Sair</button>
              <button type="button" onClick={eliminar} className="voke-submit-btn-black" style={{ backgroundColor: '#DC3545', padding: '10px' }}>Eliminar Conta (DELETE)</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;