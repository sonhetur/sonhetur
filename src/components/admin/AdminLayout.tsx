import { useState } from 'react';
import {
  LayoutDashboard,
  Plane,
  MapPin,
  Image as ImageIcon,
  FileText,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  ExternalLink,
} from 'lucide-react';
import type { AdminUser, DashboardStats } from '../../types/index.ts';

export type AdminTab =
  | 'dashboard'
  | 'travels'
  | 'destinations'
  | 'banners'
  | 'content'
  | 'contacts'
  | 'settings';

interface AdminLayoutProps {
  user: AdminUser;
  stats?: DashboardStats;
  unreadContactsCount: number;
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewSite: () => void;
  children: React.ReactNode;
}

interface MenuItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export default function AdminLayout({
  user,
  unreadContactsCount,
  currentTab,
  onSelectTab,
  onLogout,
  onViewSite,
  children,
}: AdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'travels', label: 'Viagens', icon: Plane },
    { id: 'destinations', label: 'Destinos', icon: MapPin },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'content', label: 'Conteúdo', icon: FileText },
    { id: 'contacts', label: 'Contato', icon: Mail, badge: unreadContactsCount > 0 ? unreadContactsCount : undefined },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#071A33] flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#071A33] text-white px-4 py-3 flex items-center justify-between border-b border-[#123B63] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-[#0B2545] text-slate-200"
            aria-label="Abrir menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold tracking-wider font-['Playfair_Display',serif]">
            SONHE<span className="text-[#38BDF8]">TUR</span> Admin
          </span>
        </div>

        <button
          onClick={onViewSite}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] text-xs font-semibold text-slate-200"
        >
          <span>Ver site</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" />
        </button>
      </div>

      {/* Sidebar (Desktop and Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#071A33] text-white flex flex-col justify-between border-r border-[#123B63] transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Top */}
        <div>
          <div className="p-6 border-b border-[#123B63] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0B2545] border border-[#2D6FA3]/60 flex items-center justify-center shadow">
                <Compass className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider font-['Playfair_Display',serif]">
                  SONHE<span className="text-[#38BDF8]">TUR</span>
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-slate-400">
                  Painel de Gestão
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0B2545] text-[#38BDF8] font-semibold border-l-4 border-[#38BDF8] shadow-sm'
                      : 'text-slate-300 hover:bg-[#0B2545]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38BDF8] text-[#071A33]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions / Logout */}
        <div className="p-4 border-t border-[#123B63] space-y-2">
          {/* User pill */}
          <div className="px-3 py-2 rounded-lg bg-[#0B2545]/80 text-xs text-slate-300 truncate">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Conectado como</span>
            <span className="font-medium text-white truncate block">{user.email}</span>
          </div>

          {/* View site button */}
          <button
            onClick={onViewSite}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#0B2545] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#2D6FA3]" />
            <span>Visualizar site público</span>
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-xl font-extrabold text-[#071A33] capitalize font-['Playfair_Display',serif]">
              {menuItems.find(m => m.id === currentTab)?.label || 'Painel'}
            </h1>
            <p className="text-xs text-slate-500">
              Administração da SonheTur Viagens e Turismo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewSite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#071A33] transition-colors border border-slate-200"
            >
              <span>Ver site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#2D6FA3]" />
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
