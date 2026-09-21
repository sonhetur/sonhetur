import { PlusCircle, Plane, FileText, CheckCircle2, Archive, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import type { DashboardStats, ContactRequest, Travel } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

interface DashboardViewProps {
  stats: DashboardStats;
  travels: Travel[];
  contacts: ContactRequest[];
  onNewTravel: () => void;
  onGoToTravels: () => void;
  onGoToContacts: () => void;
  onUpdateContactStatus: (id: string, status: 'nova' | 'lida' | 'respondida') => void;
}

export default function DashboardView({
  stats,
  travels,
  contacts,
  onNewTravel,
  onGoToTravels,
  onGoToContacts,
  onUpdateContactStatus,
}: DashboardViewProps) {
  const recentContacts = contacts.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Dashboard SonheTur
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visão geral da operação, roteiros e solicitações de clientes.
          </p>
        </div>

        <button
          onClick={onNewTravel}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-5 h-5 text-[#93C5FD]" />
          <span>+ Nova viagem</span>
        </button>
      </div>

      {/* Metric Cards - Strict Zero Fictitious Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Viagens publicadas */}
        <div
          onClick={onGoToTravels}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#2D6FA3] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Viagens publicadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#071A33]">
              {stats.publishedCount ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">Visíveis no site para o público</p>
          </div>
        </div>

        {/* Viagens em rascunho */}
        <div
          onClick={onGoToTravels}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#2D6FA3] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Viagens em rascunho
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#2D6FA3]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#071A33]">
              {stats.draftCount ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">Em edição ou preparação</p>
          </div>
        </div>

        {/* Viagens encerradas */}
        <div
          onClick={onGoToTravels}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#2D6FA3] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Viagens encerradas
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Archive className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#071A33]">
              {stats.closedCount ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">Vagas esgotadas ou finalizadas</p>
          </div>
        </div>

        {/* Solicitações de contato */}
        <div
          onClick={onGoToContacts}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#2D6FA3] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Solicitações de contato
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#2D6FA3]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#071A33]">
              {stats.contactRequestsCount ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">Mensagens recebidas pelo site</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Inquiries & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Contact Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                Solicitações de Contato Recentes
              </h3>
              <p className="text-xs text-slate-500">Últimas mensagens enviadas por visitantes</p>
            </div>

            <button
              onClick={onGoToContacts}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6FA3] hover:underline"
            >
              <span>Ver todas ({contacts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentContacts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma solicitação de contato recebida ainda.</p>
              <p className="text-xs text-slate-400 mt-1">
                Quando visitantes preencherem o formulário no site, as mensagens aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentContacts.map((contact) => (
                <div key={contact.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#071A33]">{contact.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          contact.status === 'nova'
                            ? 'bg-sky-100 text-sky-800'
                            : contact.status === 'respondida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">
                      {contact.email} {contact.phone && `• ${contact.phone}`}
                    </p>

                    {contact.travelTitle && (
                      <p className="text-xs text-[#2D6FA3] font-medium mt-1">
                        Viagem de interesse: {contact.travelTitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                      "{contact.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 mr-2">
                      {formatDate(contact.createdAt)}
                    </span>

                    {contact.status !== 'respondida' && (
                      <button
                        onClick={() => onUpdateContactStatus(contact.id, 'respondida')}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold"
                      >
                        Marcar respondida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Operational Guide & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#071A33] text-white rounded-2xl p-6 border border-[#123B63] shadow-sm">
            <h3 className="text-lg font-bold font-['Playfair_Display',serif] text-white mb-2">
              Gestão de Viagens
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              O site está configurado para exibir <strong>somente informações e viagens cadastradas oficialmente</strong> por você.
            </p>

            <ul className="text-xs text-slate-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0" />
                <span>Viagens em <strong>Rascunho</strong> não aparecem no site público.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0" />
                <span>Mude o status para <strong>Publicada</strong> para abrir para reservas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0" />
                <span>O botão do WhatsApp direciona o cliente já com o nome do roteiro.</span>
              </li>
            </ul>

            <button
              onClick={onNewTravel}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-xs shadow transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#93C5FD]" />
              <span>Cadastrar primeira viagem</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
