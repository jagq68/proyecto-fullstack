import React, { useState } from 'react';

const Login = () => {
  // Estado para controlar si mostramos la pestaña de Login o de Registro
  const [esLogin, setEsLogin] = useState(true);
  
  // Estado para controlar el selector circular brasileño (CPF para persona física, CNPJ para empresa)
  const [tipoDocumento, setTipoDocumento] = useState('CPF');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
        
        {/* LOGOTIPO CORPORATIVO DE VOKE */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl font-black tracking-wider text-voke-dark">voke</span>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Simulação Loja Brasil</p>
        </div>

        {/* SELECTOR DE PESTAÑAS (LOGIN / REGISTRO) */}
        <div className="flex border-b border-slate-200 mb-6 text-sm font-medium">
          <button 
            onClick={() => setEsLogin(true)}
            className={`flex-1 pb-3 text-center transition-colors ${esLogin ? 'border-b-2 border-voke-cyan text-voke-dark font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Acessar Conta
          </button>
          <button 
            onClick={() => setEsLogin(false)}
            className={`flex-1 pb-3 text-center transition-colors ${esLogin ? 'text-slate-400 hover:text-slate-600' : 'border-b-2 border-voke-cyan text-voke-dark font-bold'}`}
          >
            Criar Cadastro
          </button>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          
          {/* CAMPOS EXCLUSIVOS DE REGISTRO */}
          {!esLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  placeholder="Digite seu nome completo" 
                  className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
                />
              </div>

              {/* SELECTOR CIRCULAR DE CPF / CNPJ (Inspirado en tu imagen) */}
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
                  placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} 
                  className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
                />
              </div>
            </>
          )}

          {/* CAMPOS COMUNES (LOGIN Y REGISTRO) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
            <input 
              type="email" 
              placeholder="seu-email@voke.com" 
              className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-voke-cyan text-slate-800"
            />
          </div>

          {/* BLOQUE GRIS DE REGLAS DE SEGURIDAD (Solo en registro, tal como me mostraste) */}
          {!esLogin && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600 mb-1">Sua senha deve conter pelo menos:</p>
              <p>• Mínimo de 8 caracteres</p>
              <p>• Pelo menos 1 letra maiúscula</p>
              <p>• Pelo menos 1 número e 1 caractere especial</p>
            </div>
          )}

          {/* BOTÓN ESTILO PÍLDORA REDONDEADO (El clásico "Para entrar" de Voke) */}
          <button 
            type="submit" 
            className="w-full bg-voke-dark hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-full transition-colors mt-2"
          >
            {esLogin ? 'Para entrar' : 'Concluir Cadastro'}
          </button>

          {/* RECORDAR CONTRASEÑA */}
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