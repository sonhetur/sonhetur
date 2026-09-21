import { useState } from 'react';
import { Mail, MessageCircle, Phone, Calendar, Trash2, CheckCircle2, Search, Filter } from 'lucide-react';
import type { ContactRequest, SiteSettings } from '../../types/index.ts';
import { formatDate, getWhatsAppLink } from '../../utils/formatters.ts';

interface ContactsManagerProps {
  contacts: ContactRequest[];
  settings: SiteSettings;
  onUpdateStatus: (id: string, status: 'nova' | 'lida' | 'respondida') => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
}

export default function ContactsManager({
  contacts,
  settings,
  onUpdateStatus,
  onDeleteContact,
}: ContactsManagerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);

  const filtered = contacts.filter((c) => {
    const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.travelTitle && c.travelTitle.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleOpenContact = async (contact: ContactRequest) => {
    setSelectedContact(contact);
    if (contact.status === 'nova') {
      try {
        await onUpdateStatus(contact.id, 'lida');
      } catch {}
    }
  };

  const handleWhatsAppReply = (contact: ContactRequest) => {
    if (!contact.phone) {
      alert('Este contato não informou um número de telefone/WhatsApp.');
      return;
    }
    const replyText = `Olá, ${contact.name}! Aqui é da SonheTur Viagens. Recebemos sua mensagem sobre ${
      contact.travelTitle ? `a viagem ${contact.travelTitle}` : 'nossos roteiros e excursões'
    }. Como podemos te ajudar?`;

    const url = getWhatsAppLink(contact.phone, replyText);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Mensagens e Solicitações de Contato
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe contatos e pedidos de informações enviados pelos visitantes no site.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#071A33]/5 text-[#071A33] border border-[#071A33]/10 self-start sm:self-auto">
          Total de mensagens: {contacts.length}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'nova', 'lida', 'respondida'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-[#071A33] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todas' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou viagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#2D6FA3] outline-none"
          />
        </div>
      </div>

      {/* Grid: Message List & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {contacts.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#071A33] font-['Playfair_Display',serif]">
                Nenhuma solicitação de contato
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Assim que um cliente enviar uma mensagem ou registrar interesse em uma viagem, ela aparecerá nesta caixa.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              Nenhuma mensagem encontrada com esses filtros.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleOpenContact(c)}
                  className={`p-4 sm:p-5 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedContact?.id === c.id ? 'bg-[#F5F7FA] border-l-4 border-[#2D6FA3]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#071A33]">{c.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.status === 'nova'
                            ? 'bg-sky-100 text-sky-800'
                            : c.status === 'respondida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mb-1">
                    {c.email} {c.phone && `• ${c.phone}`}
                  </p>

                  {c.travelTitle && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[#2D6FA3] text-[11px] font-medium mb-1">
                      Interesse: {c.travelTitle}
                    </span>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Message Details */}
        <div className="lg:col-span-5">
          {selectedContact ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6 space-y-6">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                    {selectedContact.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Enviada em {formatDate(selectedContact.createdAt)}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    if (confirm('Deseja excluir esta mensagem?')) {
                      await onDeleteContact(selectedContact.id);
                      setSelectedContact(null);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Excluir mensagem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Contact meta */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-[#2D6FA3]" />
                  <a href={`mailto:${selectedContact.email}`} className="hover:underline font-medium">
                    {selectedContact.email}
                  </a>
                </div>

                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">{selectedContact.phone}</span>
                  </div>
                )}

                {selectedContact.travelTitle && (
                  <div className="p-3 bg-blue-50 rounded-xl text-[#071A33] text-xs font-semibold">
                    Interesse na viagem: {selectedContact.travelTitle}
                  </div>
                )}
              </div>

              {/* Message text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Conteúdo da Mensagem
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedContact.message}
                </p>
              </div>

              {/* Actions & WhatsApp Reply */}
              <div className="space-y-3 pt-2">
                {selectedContact.phone && (
                  <button
                    onClick={() => handleWhatsAppReply(selectedContact)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Responder pelo WhatsApp</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateStatus(selectedContact.id, 'respondida')}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Marcar respondida</span>
                  </button>

                  <a
                    href={`mailto:${selectedContact.email}?subject=Resposta SonheTur`}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#071A33] text-white text-xs font-semibold hover:bg-[#2D6FA3] text-center"
                  >
                    Responder E-mail
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-400 text-xs">
              Selecione uma mensagem na lista ao lado para ver o conteúdo completo e responder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
