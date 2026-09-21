import { useState } from 'react';
import { Save, Lock, CheckCircle2, AlertCircle, Building, Mail, Phone, MapPin, Clock, Globe } from 'lucide-react';
import type { SiteSettings } from '../../types/index.ts';
import { dataProvider } from '../../services/api.ts';

interface SettingsManagerProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export default function SettingsManager({ settings, onSaveSettings }: SettingsManagerProps) {
  // General Info
  const [companyName, setCompanyName] = useState(settings.companyName || 'SonheTur');
  const [email, setEmail] = useState(settings.email || 'sonhetur@gmail.com');
  const [phone, setPhone] = useState(settings.phone || '(31) 9912-6011');
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '(31) 9912-6011');
  const [region, setRegion] = useState(settings.region || 'Vale do Aço, Minas Gerais');
  const [address, setAddress] = useState(settings.address || '');
  const [businessHours, setBusinessHours] = useState(settings.businessHours || '');
  const [instagram, setInstagram] = useState(settings.instagram || '');
  const [facebook, setFacebook] = useState(settings.facebook || '');

  // Feedback states
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await onSaveSettings({
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        region: region.trim(),
        address: address.trim() || undefined,
        businessHours: businessHours.trim() || undefined,
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await dataProvider.changePassword(currentPassword, newPassword);
      setPasswordFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Falha ao alterar senha.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Configurações Gerais & Segurança
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os dados institucionais, canais de atendimento e a senha mestra do sistema.
          </p>
        </div>

        {settingsSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: General Site Settings Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#2D6FA3]" />
            <span>Dados da Empresa & Atendimento</span>
          </h3>

          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail Oficial
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Telefone Principal
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp para Reservas
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Região de Atuação
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  placeholder="Ex: Seg a Sex, das 09h às 18h"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Endereço Físico (Opcional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Insira somente se houver ponto fixo de atendimento presencial"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Redes Sociais Oficiais
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Instagram (URL Completa)</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/sonhetur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Facebook (URL Completa)</label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/sonhetur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold shadow transition-all"
              >
                <Save className="w-4 h-4 text-[#38BDF8]" />
                <span>{isSavingSettings ? 'Salvando...' : 'Salvar Dados da Empresa'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2D6FA3]" />
            <span>Segurança & Senha</span>
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Altere a senha de acesso ao painel administrativo. A senha é gravada de forma criptografada usando SHA-256 e salt.
          </p>

          {passwordFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Senha Atual *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nova Senha *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D6FA3]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-[#93C5FD]" />
                <span>{passwordLoading ? 'Alterando...' : 'Alterar Senha do Administrador'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
