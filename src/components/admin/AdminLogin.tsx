import { useState, useEffect } from 'react';
import { Compass, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { dataProvider } from '../../services/api.ts';
import type { AdminUser } from '../../types/index.ts';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToSite: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('sonhetur@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  useEffect(() => {
    // Check if the server requires initial password setup
    dataProvider.checkAuthStatus()
      .then(res => {
        if (!res.configured) {
          setIsFirstSetup(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await dataProvider.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('não configurada') || msg.includes('primeiro acesso') || msg.includes('needsSetup')) {
        setIsFirstSetup(true);
      }
      if (msg.includes('The string did not match the expected pattern') || msg.includes('Unexpected token')) {
        setErrorMessage('Servidor não retornou resposta no formato esperado. Verifique seus dados de acesso.');
      } else {
        setErrorMessage(msg || 'Falha ao autenticar. Verifique seus dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPassword.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setErrorMessage('A confirmação de senha não coincide.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await dataProvider.setupInitialPassword(setupPassword);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('The string did not match the expected pattern') || msg.includes('Unexpected token')) {
        setErrorMessage('Falha de resposta do servidor ao configurar senha. Tente novamente.');
      } else {
        setErrorMessage(msg || 'Erro ao definir senha inicial.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071A33] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      {/* Background visual accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2D6FA3] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#123B63] blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#38BDF8] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao site público</span>
        </button>

        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#0B2545] border border-[#2D6FA3]/60 items-center justify-center shadow-lg mb-3">
            <Compass className="w-8 h-8 text-[#38BDF8]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-['Playfair_Display',serif]">
            SONHE<span className="text-[#38BDF8]">TUR</span>
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Painel de Gestão de Turismo & Excursões
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B2545] py-8 px-6 sm:px-10 rounded-2xl border border-[#123B63] shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isFirstSetup ? (
            /* First-time Master Password Setup */
            <div>
              <div className="mb-6 p-3 rounded-lg bg-[#123B63]/60 border border-[#2D6FA3]/40 text-xs text-slate-200 space-y-1">
                <p className="font-semibold text-[#38BDF8]">Primeiro Acesso ao Painel</p>
                <p>
                  Defina agora a sua senha de administrador para <strong>sonhetur@gmail.com</strong>.
                  Ela será armazenada de forma segura com hash criptográfico.
                </p>
              </div>

              <form onSubmit={handleInitialSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    disabled
                    value="sonhetur@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#071A33] border border-[#123B63] text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Criar Senha Mestra *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#071A33] border border-[#2D6FA3]/60 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#071A33] border border-[#2D6FA3]/60 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-white text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow-lg transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  <span>{isLoading ? 'Configurando...' : 'ATIVAR ACESSO ADMINISTRATIVO'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Regular Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  E-mail Administrativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sonhetur@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#071A33] border border-[#123B63] focus:border-[#2D6FA3] focus:ring-1 focus:ring-[#2D6FA3] text-white text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#071A33] border border-[#123B63] focus:border-[#2D6FA3] focus:ring-1 focus:ring-[#2D6FA3] text-white text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-[#93C5FD]" />
                  <span>{isLoading ? 'Autenticando...' : 'ENTRAR NO PAINEL'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#123B63] text-center text-xs text-slate-400">
                <p>Acesso exclusivo para administradores autorizados da SonheTur.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
