import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const [esLogin, setEsLogin] = useState(true);
  const [tipoDocumento, setTipoDocumento] = useState('CPF');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState({ texto: '', esError: false });

  const manejarFormulario = async (e) => {
    e.preventDefault();
    setMensajeAlerta({ texto: '', esError: false });
    if (!email || !contrasena) {
      return setMensajeAlerta({ texto: 'Por favor, preencha e-mail e senha.', esError: true });
    }
    try {
      if (esLogin) {
        const res = await api.post('/auth/login', { email, contrasena });
        localStorage.setItem('voke_token', res.data.token);
        localStorage.setItem('voke_usuario', JSON.stringify(res.data.usuario));
        setMensajeAlerta({ texto: 'Autenticação bem-sucedida! Redirecionando...', esError: false });
        setTimeout(() => navigate('/'), 1500);
      } else {
        if (!nomeCompleto || !cpfCnpj || !fechaNacimiento || !sexo || !telefono || !confirmarContrasena) {
          return setMensajeAlerta({ texto: 'Por favor, preencha todos os campos obrigatórios (*).', esError: true });
        }
        if (contrasena !== confirmarContrasena) {
          return setMensajeAlerta({ texto: 'As senhas não coincidem. Verifique e tente novamente.', esError: true });
        }
        const datos = { email, contrasena, cpf_cnpj: cpfCnpj, nome_completo: nomeCompleto, fecha_nacimiento: fechaNacimiento, sexo, telefono, perfil: 'cliente' };
        await api.post('/auth/register', datos);
        setMensajeAlerta({ texto: 'Cadastro concluído com sucesso! Faça login para acessar.', esError: false });
        setEsLogin(true);
        setContrasena('');
        setConfirmarContrasena('');
      }
    } catch (err) {
      setMensajeAlerta({ texto: err.response?.data?.error || 'Erro interno no servidor.', esError: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="text-3xl font-black tracking-wider text-voke-dark">voke</Link>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Simulação Loja Brasil</p>
        </div>

        {mensajeAlerta.texto && (
          <div className={`p-3 rounded-md text-xs font-medium mb-4 text-center border ${mensajeAlerta.esError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{mensajeAlerta.texto}</div>
        )}

        <div className="flex border-b border-slate-200 mb-6 text-sm font-medium">
          <button type="button" onClick={() => { setEsLogin(true); setMensajeAlerta({ texto: '', esError: false }); }} className={`flex-1 pb-3 text-center ${esLogin ? 'border-b-2 border-voke-cyan text-voke-dark font-bold' : 'text-slate-400'}`}>Acessar Conta</button>
          <button type="button" onClick={() => { setEsLogin(false); setMensajeAlerta({ texto: '', esError: false }); }} className={`flex-1 pb-3 text-center ${!esLogin ? 'border-b-2 border-voke-cyan text-voke-dark font-bold' : 'text-slate-400'}`}>Criar Cadastro</button>
        </div>

        <form className="space-y-4" onSubmit={manejarFormulario}>
          {!esLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tipo de Documento *</label>
                <div className="flex space-x-6 text-sm text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="docType" checked={tipoDocumento === 'CPF'} onChange={() => setTipoDocumento('CPF')} className="text-voke-cyan" /> <span>CPF</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="docType" checked={tipoDocumento === 'CNPJ'} onChange={() => setTipoDocumento('CNPJ')} className="text-voke-cyan" /> <span>CNPJ</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{tipoDocumento === 'CPF' ? 'CPF *' : 'CNPJ *'}</label>
                <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input type="text" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Escreva seu nome completo" className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800">
                  <option value="">Selecione o sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone *</label>
                <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="(00) 00000-0000" className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu melhor e-mail" className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha *</label>
            <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Digite sua senha" className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
          </div>
          
          {/* AQUÍ QUEDÓ REUBICADO PERFECTAMENTE EL CAMPO ADENTRO DE LA COMPOSICIÓN */}
          {!esLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Senha *</label>
              <input type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} placeholder="Confirme sua senha" className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800" />
            </div>
          )}

          {!esLogin && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600 mb-1">Sua senha deve conter pelo menos:</p>
              <p>• Mínimo de 8 caracteres</p>
              <p>• Pelo menos 1 letra maiúscula</p>
              <p>• Pelo menos 1 número e 1 caractere especial</p>
            </div>
          )}
          <button type="submit" className="w-full bg-voke-dark hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-full transition-colors mt-2">{esLogin ? 'Para entrar' : 'Concluir Cadastro'}</button>
          {esLogin && (
            <div className="text-center mt-4">
              <span className="text-xs text-voke-cyan hover:underline cursor-pointer font-medium">Esqueceu sua senha?</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;