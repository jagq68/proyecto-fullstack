import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api'; // <-- Importamos tu cliente unificado de Axios

const Login = () => {
  const navigate = useNavigate();
  const [esLogin, setEsLogin] = useState(true);
  const [tipoDocumento, setTipoDocumento] = useState('CPF');
  
  // Estados para capturar las cajas de texto del formulario
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  
  // Estado para capturar mensajes de error o éxito
  const [mensajeAlerta, setMensajeAlerta] = useState({ texto: '', esError: false });

  // Función principal para manejar el envío de datos
  const manejarFormulario = async (e) => {
    e.preventDefault();
    setMensajeAlerta({ texto: '', esError: false });

    // Validación básica de campos comunes
    if (!email || !contrasena) {
      return setMensajeAlerta({ texto: 'Por favor, preencha todos os campos obrigatórios.', esError: true });
    }

    try {
      if (esLogin) {
        // --- FLUJO DE INICIO DE SESIÓN ---
        const respuesta = await api.post('/auth/login', { email, contrasena });
        
        // Guardamos el token devuelto por el backend de forma persistente en el navegador
        localStorage.setItem('voke_token', respuesta.data.token);
        localStorage.setItem('voke_usuario', JSON.stringify(respuesta.data.usuario));

        setMensajeAlerta({ texto: 'Autenticação bem-sucedida! Redirecionando...', esError: false });
        
        // Redirigimos al usuario inmediatamente a la vitrina principal tras 1.5 segundos
        setTimeout(() => {
          navigate('/');
        }, 1500);

      } else {
        // --- FLUJO DE REGISTRO DE NUEVO USUARIO ---
        if (!nomeCompleto || !cpfCnpj) {
          return setMensajeAlerta({ texto: 'Por favor, preencha o Nome e o CPF/CNPJ.', esError: true });
        }

        const datosRegistro = {
          email,
          contrasena,
          cpf_cnpj: cpfCnpj,
          nome_completo: nomeCompleto,
          perfil: 'cliente'
        };

        await api.post('/auth/register', datosRegistro);
        setMensajeAlerta({ texto: 'Cadastro concluído com sucesso! Faça login para acessar.', esError: false });
        
        // Limpiamos los campos y lo movemos automáticamente a la pestaña de login
        setEsLogin(true);
        setContrasena('');
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      const textoError = error.response?.data?.error || 'Erro interno no servidor ao processar a solicitação.';
      setMensajeAlerta({ texto: textoError, esError: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
        
        {/* LOGOTIPO CORPORATIVO */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="text-3xl font-black tracking-wider text-voke-dark hover:opacity-90">voke</Link>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Simulação Loja Brasil</p>
        </div>

        {/* MENSAJES DE ALERTA DINÁMICOS */}
        {mensajeAlerta.texto && (
          <div className={`p-3 rounded-md text-xs font-medium mb-4 text-center border ${mensajeAlerta.esError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            {mensajeAlerta.texto}
          </div>
        )}

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex border-b border-slate-200 mb-6 text-sm font-medium">
          <button 
            type="button"
            onClick={() => { setEsLogin(true); setMensajeAlerta({ texto: '', esError: false }); }}
            className={`flex-1 pb-3 text-center transition-colors ${esLogin ? 'border-b-2 border-voke-cyan text-voke-dark font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Acessar Conta
          </button>
          <button 
            type="button"
            onClick={() => { setEsLogin(false); setMensajeAlerta({ texto: '', esError: false }); }}
            className={`flex-1 pb-3 text-center transition-colors ${esLogin ? 'text-slate-400 hover:text-slate-600' : 'border-b-2 border-voke-cyan text-voke-dark font-bold'}`}
          >
            Criar Cadastro
          </button>
        </div>

        {/* FORMULARIO */}
        <form className="space-y-4" onSubmit={manejarFormulario}>
          
          {!esLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Digite seu nome completo" 
                  className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tipo de Documento *</label>
                <div className="flex space-x-6 text-sm text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="docType" 
                      checked={tipoDocumento === 'CPF'} 
                      onChange={() => setTipoDocumento('CPF')}
                      className="text-voke-cyan focus:ring-voke-cyan h-4 w-4"
                    />
                    <span>Pessoa Física (CPF)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="docType" 
                      checked={tipoDocumento === 'CNPJ'} 
                      onChange={() => setTipoDocumento('CNPJ')}
                      className="text-voke-cyan focus:ring-voke-cyan h-4 w-4"
                    />
                    <span>Pessoa Jurídica (CNPJ)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tipoDocumento === 'CPF' ? 'CPF *' : 'CNPJ *'}
                </label>
                <input 
                  type="text" 
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} 
                  className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@voke.com" 
              className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha *</label>
            <input 
              type="password" 
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
            />
          </div>

          {!esLogin && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600 mb-1">Sua senha deve conter pelo menos:</p>
              <p>• Mínimo de 8 caracteres</p>
              <p>• Pelo menos 1 letra maiúscula</p>
              <p>• Pelo menos 1 número e 1 caractere especial</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-voke-dark hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-full transition-colors mt-2"
          >
            {esLogin ? 'Para entrar' : 'Concluir Cadastro'}
          </button>

          {esLogin && (
            <div className="text-center mt-4">
              <span className="text-xs text-voke-cyan hover:underline cursor-pointer font-medium">
                Esqueceu sua senha?
              </span>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Login;