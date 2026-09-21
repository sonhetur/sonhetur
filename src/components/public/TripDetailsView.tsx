import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  MessageCircle,
  Compass,
  Share2,
} from 'lucide-react';
import type { Travel, SiteSettings } from '../../types/index.ts';
import { formatCurrency, formatDate, getWhatsAppLink } from '../../utils/formatters.ts';

interface TripDetailsViewProps {
  travel: Travel;
  settings: SiteSettings;
  onBack: () => void;
  onContactWithTravel: (travel: Travel) => void;
}

export default function TripDetailsView({
  travel,
  settings,
  onBack,
  onContactWithTravel,
}: TripDetailsViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    travel.mainImage || (travel.gallery && travel.gallery.length > 0 ? travel.gallery[0] : null)
  );

  const allPhotos = [
    ...(travel.mainImage ? [travel.mainImage] : []),
    ...(travel.gallery || []),
  ].filter(Boolean);

  const interestMessage = `Olá, SonheTur! Tenho interesse na viagem ${travel.title}. Gostaria de receber mais informações.`;
  const whatsappHref = getWhatsAppLink(settings.whatsapp || '(31) 9912-6011', interestMessage);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${travel.title} | SonheTur`,
        text: `Confira esta viagem da SonheTur: ${travel.title} para ${travel.destination}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="py-12 bg-[#F5F7FA] text-[#071A33] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[#071A33] text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D6FA3]" />
            <span>Voltar para todas as viagens</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#071A33] text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            title="Compartilhar viagem"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        {/* Title & Destination Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#071A33] text-white">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{travel.destination}</span>
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6FA3]/15 text-[#2D6FA3]">
              {travel.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#071A33] font-['Playfair_Display',serif] leading-tight">
            {travel.title}
          </h1>

          {travel.shortDescription && (
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl">
              {travel.shortDescription}
            </p>
          )}

          {/* Quick specs ribbon */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071A33]/5 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Saída</span>
                <span className="text-sm font-bold text-[#071A33]">
                  {travel.departureDate ? formatDate(travel.departureDate) : 'A definir'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071A33]/5 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Retorno</span>
                <span className="text-sm font-bold text-[#071A33]">
                  {travel.returnDate ? formatDate(travel.returnDate) : 'A definir'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071A33]/5 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Duração</span>
                <span className="text-sm font-bold text-[#071A33]">
                  {travel.duration || 'Consulte'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071A33]/5 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Vagas</span>
                <span className="text-sm font-bold text-[#071A33]">
                  {travel.vacancies > 0 ? `${travel.vacancies} disponíveis` : 'Consulte'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        {allPhotos.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-[#071A33] mb-4 font-['Playfair_Display',serif]">
              Galeria de Fotos
            </h2>
            <div className="rounded-xl overflow-hidden bg-[#071A33] h-[360px] sm:h-[480px] w-full flex items-center justify-center mb-4">
              <img
                src={selectedPhoto || allPhotos[0]}
                alt={travel.title}
                className="w-full h-full object-contain"
              />
            </div>

            {allPhotos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`relative w-24 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedPhoto === photo ? 'border-[#38BDF8] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Elegant Navy Placeholder when no photo is registered */
          <div className="bg-[#071A33] rounded-2xl p-10 text-center text-white mb-8 border border-[#123B63]">
            <Compass className="w-12 h-12 text-[#38BDF8] mx-auto mb-3" />
            <p className="text-sm font-semibold tracking-wide text-slate-200">
              Excursão SonheTur • Destino: {travel.destination}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Fotos reais do roteiro serão disponibilizadas pela agência.
            </p>
          </div>
        )}

        {/* Two-Column Grid: Details & Booking Action Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full Description */}
            {travel.fullDescription && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif] mb-4">
                  Sobre esta viagem
                </h2>
                <div className="text-slate-700 leading-relaxed space-y-3 whitespace-pre-line text-base">
                  {travel.fullDescription}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {travel.itinerary && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif] mb-4">
                  Roteiro Previsto
                </h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
                  {travel.itinerary}
                </div>
              </div>
            )}

            {/* Included & Not Included */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Included */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#071A33] flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>O que está incluso</span>
                </h3>
                {travel.included && travel.included.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {travel.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">Consulte detalhes dos itens inclusos com nossa equipe.</p>
                )}
              </div>

              {/* Not Included */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#071A33] flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>O que não está incluso</span>
                </h3>
                {travel.notIncluded && travel.notIncluded.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {travel.notIncluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">Despesas pessoais e itens não listados no roteiro.</p>
                )}
              </div>
            </div>

            {/* Important Info & Observations */}
            {(travel.importantInfo || travel.observations || travel.boardingLocation) && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                {travel.boardingLocation && (
                  <div>
                    <h3 className="text-base font-bold text-[#071A33] flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#2D6FA3]" />
                      <span>Local de Embarque</span>
                    </h3>
                    <p className="text-sm text-slate-700">{travel.boardingLocation}</p>
                  </div>
                )}

                {travel.importantInfo && (
                  <div>
                    <h3 className="text-base font-bold text-[#071A33] flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-[#2D6FA3]" />
                      <span>Informações Importantes</span>
                    </h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{travel.importantInfo}</p>
                  </div>
                )}

                {travel.observations && (
                  <div>
                    <h3 className="text-base font-bold text-[#071A33] mb-2">Observações</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{travel.observations}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Side Card: Price, Payment Methods, WhatsApp CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
              <div>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Investimento por passageiro
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#071A33]">
                  {travel.price > 0 ? formatCurrency(travel.price) : 'Consulte'}
                </div>
                {travel.vacancies > 0 && (
                  <span className="inline-block mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {travel.vacancies} vagas restantes
                  </span>
                )}
              </div>

              {/* Payment Methods */}
              {travel.paymentMethods ? (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#2D6FA3]" />
                    <span>Formas de Pagamento</span>
                  </h4>
                  <p className="text-sm text-slate-700">{travel.paymentMethods}</p>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#2D6FA3]" />
                    <span>Pagamento</span>
                  </h4>
                  <p className="text-sm text-slate-600">Consulte condições de parcelamento e pagamentos com nossa equipe.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all text-center focus:outline-none focus:ring-2 focus:ring-[#2D6FA3]"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>TENHO INTERESSE</span>
                </a>

                <button
                  onClick={() => onContactWithTravel(travel)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white font-semibold text-sm transition-all text-center"
                >
                  <span>Enviar mensagem por formulário</span>
                </button>
              </div>

              {/* Verified Contact Card info */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1 text-center">
                <p>Atendimento SonheTur</p>
                <p className="font-semibold text-slate-700">{settings.phone}</p>
                <p>{settings.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
