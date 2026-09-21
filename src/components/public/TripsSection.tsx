import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight, MessageCircle, Compass } from 'lucide-react';
import type { Travel, Destination, SiteSettings } from '../../types/index.ts';
import { formatCurrency, formatDate, getWhatsAppLink } from '../../utils/formatters.ts';

interface TripsSectionProps {
  travels: Travel[];
  settings: SiteSettings;
  destinations?: Destination[];
  onSelectTravel: (travel: Travel) => void;
  onContactClick?: () => void;
}

export default function TripsSection({
  travels,
  settings,
  destinations: registeredDestinations,
  onSelectTravel,
  onContactClick,
}: TripsSectionProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('todos');

  // Filter distinct destinations present in published travels or registered destinations
  const destinations = registeredDestinations && registeredDestinations.length > 0
    ? Array.from(new Set([...travels.map(t => t.destination), ...registeredDestinations.map(d => d.name)].filter(Boolean)))
    : Array.from(new Set(travels.map(t => t.destination).filter(Boolean)));

  const filteredTravels = selectedDestination === 'todos'
    ? travels
    : travels.filter(t => t.destination === selectedDestination);

  const whatsappHref = getWhatsAppLink(
    settings.whatsapp || '(31) 9912-6011',
    'Olá, SonheTur! Gostaria de consultar as próximas opções de viagem e excursões.'
  );

  return (
    <section id="viagens" className="py-20 bg-[#F5F7FA] text-[#071A33] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2545]/10 text-[#071A33] text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-[#2D6FA3]" />
            <span>Roteiros e Excursões</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071A33] font-['Playfair_Display',serif]">
            Próximas Viagens
          </h2>
          <div className="w-20 h-1 bg-[#2D6FA3] mx-auto mt-4 rounded-full" />
        </div>

        {/* Filter buttons if multiple destinations exist */}
        {destinations.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedDestination('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDestination === 'todos'
                  ? 'bg-[#071A33] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos os destinos
            </button>
            {destinations.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDestination === dest
                    ? 'bg-[#071A33] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        )}

        {/* Empty State - Requirement 5 & 23 */}
        {travels.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#071A33]/5 border border-[#123B63]/20 flex items-center justify-center mb-6">
              <Compass className="w-8 h-8 text-[#2D6FA3]" />
            </div>

            <h3 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
              Novas experiências estão sendo preparadas.
            </h3>

            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
              Entre em contato com a SonheTur para consultar nossas próximas opções de viagem.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-semibold text-sm shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              >
                <MessageCircle className="w-4 h-4 text-[#93C5FD]" />
                <span>FALAR COM A SONHETUR</span>
              </a>

              <button
                onClick={onContactClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#071A33] font-semibold text-sm border border-slate-300 shadow-sm transition-all"
              >
                <span>Enviar uma mensagem</span>
              </button>
            </div>
          </div>
        ) : filteredTravels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 max-w-lg mx-auto">
            <p className="text-slate-600">Nenhuma viagem disponível para o destino selecionado no momento.</p>
            <button
              onClick={() => setSelectedDestination('todos')}
              className="mt-4 text-sm font-semibold text-[#2D6FA3] hover:underline"
            >
              Ver todos os destinos
            </button>
          </div>
        ) : (
          /* Cards Grid for Real Published Trips */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTravels.map((travel) => {
              const hasImage = Boolean(travel.mainImage);

              return (
                <article
                  key={travel.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Card Media Header */}
                  <div className="relative h-56 w-full bg-[#071A33] overflow-hidden flex items-center justify-center">
                    {hasImage ? (
                      <img
                        src={travel.mainImage}
                        alt={travel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      /* Elegant Navy Fallback */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0B2545] to-[#071A33]">
                        <Compass className="w-12 h-12 text-[#38BDF8] mb-2" />
                        <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                          SonheTur Excursões
                        </span>
                        <span className="text-sm font-bold text-white mt-1">
                          {travel.destination}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#071A33]/90 text-white backdrop-blur-sm border border-[#2D6FA3]/40">
                        {travel.status}
                      </span>
                    </div>

                    {/* Destination Pill */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/95 text-[#071A33] shadow-md backdrop-blur-sm">
                        <MapPin className="w-3.5 h-3.5 text-[#2D6FA3]" />
                        <span>{travel.destination}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#071A33] font-['Playfair_Display',serif] group-hover:text-[#2D6FA3] transition-colors leading-tight">
                        {travel.title}
                      </h3>

                      {travel.shortDescription && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {travel.shortDescription}
                        </p>
                      )}

                      {/* Travel Meta Specifications */}
                      <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                        {travel.departureDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                            <span>
                              Data: <strong>{formatDate(travel.departureDate)}</strong>
                              {travel.returnDate && ` até ${formatDate(travel.returnDate)}`}
                            </span>
                          </div>
                        )}

                        {travel.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                            <span>Duração: <strong>{travel.duration}</strong></span>
                          </div>
                        )}

                        {travel.vacancies > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                            <span>Vagas: <strong>{travel.vacancies} disponíveis</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Action Button Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                          Valor por pessoa
                        </span>
                        <span className="text-xl font-extrabold text-[#071A33]">
                          {travel.price > 0 ? formatCurrency(travel.price) : 'Consulte'}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectTravel(travel)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold tracking-wide transition-all shadow-sm group-hover:shadow"
                      >
                        <span>Ver detalhes</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
