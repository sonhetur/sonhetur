import { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Instagram, Facebook, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { SiteSettings, Travel } from '../../types/index.ts';
import { dataProvider } from '../../services/api.ts';
import { getWhatsAppLink } from '../../utils/formatters.ts';

interface ContactSectionProps {
  settings: SiteSettings;
  preselectedTravel?: Travel | null;
}

export default function ContactSection({ settings, preselectedTravel }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(preselectedTravel ? `Interesse: ${preselectedTravel.title}` : '');
  const [message, setMessage] = useState(
    preselectedTravel
      ? `Olá! Gostaria de receber mais informações sobre a viagem ${preselectedTravel.title}.`
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const officialEmail = settings.email || 'sonhetur@gmail.com';
  const officialPhone = settings.phone || '(31) 9912-6011';
  const officialWhatsapp = settings.whatsapp || '(31) 9912-6011';

  const whatsappHref = getWhatsAppLink(
    officialWhatsapp,
    preselectedTravel
      ? `Olá, SonheTur! Tenho interesse na viagem ${preselectedTravel.title}. Gostaria de receber mais informações.`
      : 'Olá, SonheTur! Gostaria de mais informações sobre viagens e excursões.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, preencha nome, e-mail e sua mensagem.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await dataProvider.sendContactRequest({
        name,
        email,
        phone: phone || undefined,
        subject: subject || 'Contato pelo site',
        message,
        travelId: preselectedTravel?.id,
        travelTitle: preselectedTravel?.title,
      });

      setFeedback({
        type: 'success',
        message: 'Sua mensagem foi enviada com sucesso! A equipe da SonheTur entrará em contato em breve.',
      });

      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao enviar mensagem. Tente novamente ou use o WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-20 bg-[#F5F7FA] text-[#071A33] border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071A33]/5 text-[#071A33] text-xs font-semibold uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5 text-[#2D6FA3]" />
            <span>Fale com a SonheTur</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071A33] font-['Playfair_Display',serif]">
            Canais de Atendimento
          </h2>
          <div className="w-20 h-1 bg-[#2D6FA3] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 text-base max-w-xl mx-auto">
            Estamos prontos para atender você e tirar dúvidas sobre nossos próximos roteiros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Phone & WhatsApp Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#071A33] font-['Playfair_Display',serif] mb-1">
                Telefone & WhatsApp
              </h3>
              <p className="text-sm text-slate-500 mb-4">Atendimento direto por ligação ou mensagem</p>
              <p className="text-2xl font-extrabold text-[#071A33] mb-6 tracking-wide">
                {officialPhone}
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar pelo WhatsApp</span>
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#2D6FA3]" />
              </div>
              <h3 className="text-xl font-bold text-[#071A33] font-['Playfair_Display',serif] mb-1">
                E-mail
              </h3>
              <p className="text-sm text-slate-500 mb-4">Para solicitações e informações administrativas</p>
              <p className="text-lg font-bold text-[#071A33] mb-6 break-all">
                {officialEmail}
              </p>
              <a
                href={`mailto:${officialEmail}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white font-semibold text-sm shadow transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar e-mail</span>
              </a>
            </div>

            {/* Region / Additional info (Only confirmed or registered info) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2D6FA3] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase">Região de Atuação</span>
                  <p className="text-sm font-medium text-[#071A33]">
                    {settings.region || 'Vale do Aço, Minas Gerais'}
                  </p>
                </div>
              </div>

              {settings.address && (
                <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                  <MapPin className="w-5 h-5 text-[#2D6FA3] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Endereço</span>
                    <p className="text-sm font-medium text-[#071A33]">{settings.address}</p>
                  </div>
                </div>
              )}

              {settings.businessHours && (
                <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                  <Clock className="w-5 h-5 text-[#2D6FA3] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Horário de Atendimento</span>
                    <p className="text-sm font-medium text-[#071A33]">{settings.businessHours}</p>
                  </div>
                </div>
              )}

              {/* Social networks only when configured */}
              {(settings.instagram || settings.facebook) && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Redes Sociais:</span>
                  {settings.instagram && (
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 text-[#071A33] hover:text-[#2D6FA3] hover:bg-slate-200 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {settings.facebook && (
                    <a
                      href={settings.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 text-[#071A33] hover:text-[#2D6FA3] hover:bg-slate-200 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif] mb-2">
                Envie uma Mensagem
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Preencha o formulário abaixo para tirar dúvidas ou solicitar informações sobre roteiros.
              </p>

              {preselectedTravel && (
                <div className="p-3 mb-6 bg-[#071A33]/5 rounded-xl border border-[#2D6FA3]/30 text-xs text-[#071A33] flex items-center justify-between">
                  <span>Mensagem referente a: <strong>{preselectedTravel.title}</strong></span>
                </div>
              )}

              {feedback && (
                <div
                  className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{feedback.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2D6FA3] focus:ring-2 focus:ring-[#2D6FA3]/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Seu E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2D6FA3] focus:ring-2 focus:ring-[#2D6FA3]/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(31) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2D6FA3] focus:ring-2 focus:ring-[#2D6FA3]/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Consulta de viagem"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2D6FA3] focus:ring-2 focus:ring-[#2D6FA3]/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva sua dúvida ou solicitação..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2D6FA3] focus:ring-2 focus:ring-[#2D6FA3]/20 text-sm outline-none transition-all resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Enviando mensagem...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#38BDF8]" />
                      <span>ENVIAR MENSAGEM</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
