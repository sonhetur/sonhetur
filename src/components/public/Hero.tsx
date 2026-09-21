import { ArrowRight, MessageCircle, MapPin, Compass } from 'lucide-react';
import type { Banner, InstitutionalContent, SiteSettings } from '../../types/index.ts';
import { getWhatsAppLink } from '../../utils/formatters.ts';

interface HeroProps {
  banners: Banner[];
  content: InstitutionalContent;
  settings: SiteSettings;
  onExploreTrips: () => void;
  onContact: () => void;
}

export default function Hero({ banners, content, settings, onExploreTrips, onContact }: HeroProps) {
  // If there's an active registered banner with image, use it, otherwise fall back to pure navy theme
  const activeBanner = banners.find(b => b.isActive ?? b.active);

  const slogan = content?.slogan || 'Seu próximo destino começa aqui.';
  const homeMainText = content?.homeMainText || 'Descubra novas experiências e encontre sua próxima viagem com a SonheTur.';

  const whatsappHref = getWhatsAppLink(
    settings.whatsapp || '(31) 9912-6011',
    'Olá, SonheTur! Gostaria de falar com a equipe sobre opções de viagens e turismo.'
  );

  return (
    <section className="relative overflow-hidden bg-[#071A33] text-white py-24 sm:py-32 lg:py-36 border-b border-[#123B63]">
      {/* Background: If custom banner image is registered by admin */}
      {activeBanner?.image ? (
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image}
            alt={activeBanner.title || 'SonheTur Viagens'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#071A33]/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-transparent to-[#071A33]/70" />
        </div>
      ) : (
        /* Pure Navy Elegant Geometric Background (Strictly no fake photos) */
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          {/* Subtle grid and compass radial graphics */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#2D6FA3]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#38BDF8]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#2D6FA3]/30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#123B63]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B2545]/60 rounded-full blur-3xl" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Region Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2545] border border-[#2D6FA3]/50 text-xs font-medium text-slate-200 mb-8 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Turismo & Excursões no Vale do Aço, MG</span>
        </div>

        {/* Company Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Playfair_Display',serif] text-white leading-tight">
          SONHE<span className="text-[#38BDF8]">TUR</span>
        </h1>

        {/* Main Slogan */}
        <p className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-100 max-w-3xl mx-auto leading-snug">
          {activeBanner?.title || slogan}
        </p>

        {/* Complementary Text */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {activeBanner?.subtitle || homeMainText}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreTrips}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white text-base font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 border border-[#2D6FA3] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          >
            <span>CONHECER VIAGENS</span>
            <ArrowRight className="w-5 h-5 text-[#38BDF8]" />
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#0B2545] hover:bg-[#123B63] text-white text-base font-semibold border border-[#2D6FA3]/60 shadow hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          >
            <MessageCircle className="w-5 h-5 text-[#38BDF8]" />
            <span>FALE CONOSCO</span>
          </a>
        </div>

        {/* Discreet feature pills */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 border-t border-[#123B63]/60 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 text-slate-300 text-sm py-2">
            <Compass className="w-4 h-4 text-[#38BDF8]" />
            <span>Excursões Organizadas</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-300 text-sm py-2">
            <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>Atendimento Personalizado</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-300 text-sm py-2">
            <MapPin className="w-4 h-4 text-[#38BDF8]" />
            <span>Embarque no Vale do Aço</span>
          </div>
        </div>
      </div>
    </section>
  );
}
