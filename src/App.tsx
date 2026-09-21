import { useState, useEffect } from 'react';
import type {
  PublicData,
  AdminData,
  AdminUser,
  Travel,
  Destination,
  Banner,
  SiteSettings,
  InstitutionalContent,
  ContactRequest,
} from './types/index.ts';
import { dataProvider } from './services/api.ts';
import { getWhatsAppLink } from './utils/formatters.ts';

// Public Components
import Header from './components/public/Header.tsx';
import Hero from './components/public/Hero.tsx';
import TripsSection from './components/public/TripsSection.tsx';
import TripDetailsView from './components/public/TripDetailsView.tsx';
import AboutSection from './components/public/AboutSection.tsx';
import ContactSection from './components/public/ContactSection.tsx';
import Footer from './components/public/Footer.tsx';

// Admin Components
import AdminLogin from './components/admin/AdminLogin.tsx';
import AdminLayout, { AdminTab } from './components/admin/AdminLayout.tsx';
import DashboardView from './components/admin/DashboardView.tsx';
import TravelsManager from './components/admin/TravelsManager.tsx';
import DestinationsManager from './components/admin/DestinationsManager.tsx';
import BannersManager from './components/admin/BannersManager.tsx';
import ContentManager from './components/admin/ContentManager.tsx';
import ContactsManager from './components/admin/ContactsManager.tsx';
import SettingsManager from './components/admin/SettingsManager.tsx';

// Icons
import { MessageCircle, Shield } from 'lucide-react';

export default function App() {
  // Navigation & View Modes
  const [currentView, setCurrentView] = useState<'site' | 'admin'>('site');
  const [activeSection, setActiveSection] = useState<'inicio' | 'viagens' | 'sobre' | 'contato'>('inicio');
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [contactTravel, setContactTravel] = useState<Travel | null>(null);

  // Admin state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // App Data States
  const [publicData, setPublicData] = useState<PublicData | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // URL Hash/Path check for /admin direct navigation
  useEffect(() => {
    const handleUrlCheck = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || path.startsWith('/admin')) {
        setCurrentView('admin');
      }
    };
    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    return () => window.removeEventListener('hashchange', handleUrlCheck);
  }, []);

  // Initial Data Fetch
  const loadPublicData = async () => {
    try {
      const data = await dataProvider.getPublicData();
      setPublicData(data);
    } catch (err) {
      console.error('Failed to load public data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const data = await dataProvider.getAdminData();
      setAdminData(data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadPublicData();

    // Verify existing admin session
    dataProvider.getCurrentUser()
      .then((user: AdminUser | null) => {
        if (user) {
          setAdminUser(user);
          loadAdminData();
        }
      })
      .catch(() => {});
  }, []);

  // Public View Navigation
  const handleNavigateSection = (section: string) => {
    setSelectedTravel(null);
    setActiveSection(section as any);

    if (currentView === 'admin') {
      setCurrentView('site');
      window.location.hash = '';
    }

    // Scroll smoothly to section
    setTimeout(() => {
      const elem = document.getElementById(section);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectTravel = (travel: Travel) => {
    setSelectedTravel(travel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactWithTravel = (travel: Travel) => {
    setSelectedTravel(null);
    setContactTravel(travel);
    setActiveSection('contato');
    setTimeout(() => {
      const elem = document.getElementById('contato');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Admin Actions
  const handleLoginSuccess = async (user: AdminUser) => {
    setAdminUser(user);
    await loadAdminData();
  };

  const handleLogout = async () => {
    await dataProvider.logout();
    setAdminUser(null);
    setCurrentView('site');
    window.location.hash = '';
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.location.hash = 'admin';
    if (adminUser) {
      loadAdminData();
    }
  };

  const handleViewSite = () => {
    setCurrentView('site');
    window.location.hash = '';
    loadPublicData();
  };

  // Handlers for Admin Mutations with live state sync
  const handleCreateTravel = async (travelData: Partial<Travel>) => {
    await dataProvider.createTravel(travelData);
    await loadAdminData();
    await loadPublicData();
  };

  const handleUpdateTravel = async (id: string, travelData: Partial<Travel>) => {
    await dataProvider.updateTravel(id, travelData);
    await loadAdminData();
    await loadPublicData();
  };

  const handleDeleteTravel = async (id: string) => {
    await dataProvider.deleteTravel(id);
    await loadAdminData();
    await loadPublicData();
  };

  const handleCreateDestination = async (data: Partial<Destination>) => {
    await dataProvider.createDestination(data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleUpdateDestination = async (id: string, data: Partial<Destination>) => {
    await dataProvider.updateDestination(id, data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleDeleteDestination = async (id: string) => {
    await dataProvider.deleteDestination(id);
    await loadAdminData();
    await loadPublicData();
  };

  const handleCreateBanner = async (data: Partial<Banner>) => {
    await dataProvider.createBanner(data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleUpdateBanner = async (id: string, data: Partial<Banner>) => {
    await dataProvider.updateBanner(id, data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleDeleteBanner = async (id: string) => {
    await dataProvider.deleteBanner(id);
    await loadAdminData();
    await loadPublicData();
  };

  const handleSaveContent = async (data: InstitutionalContent) => {
    await dataProvider.updateContent(data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleSaveSettings = async (data: SiteSettings) => {
    await dataProvider.updateSettings(data);
    await loadAdminData();
    await loadPublicData();
  };

  const handleUpdateContactStatus = async (id: string, status: 'nova' | 'lida' | 'respondida') => {
    await dataProvider.updateContactStatus(id, status);
    await loadAdminData();
  };

  const handleDeleteContact = async (id: string) => {
    await dataProvider.deleteContact(id);
    await loadAdminData();
  };

  // Fallback defaults
  const settings: SiteSettings = publicData?.settings || {
    companyName: 'SonheTur',
    email: 'sonhetur@gmail.com',
    phone: '(31) 9912-6011',
    whatsapp: '(31) 9912-6011',
    region: 'Vale do Aço, Minas Gerais',
  };

  const content: InstitutionalContent = publicData?.content || {
    slogan: 'Viagens e experiências.',
    homeMainText:
      'Conectamos você aos melhores roteiros, praias e experiências turísticas com saída organizada da região do Vale do Aço, Minas Gerais.',
    aboutText:
      'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.',
  };

  const travels: Travel[] = publicData?.travels || [];
  const destinations: Destination[] = publicData?.destinations || [];
  const banners: Banner[] = publicData?.banners || [];

  const unreadCount = adminData?.contactRequests?.filter((c: ContactRequest) => c.status === 'nova').length || 0;

  // Floating WhatsApp Link
  const floatingWhatsappUrl = getWhatsAppLink(
    settings.whatsapp || '(31) 9912-6011',
    'Olá, SonheTur! Gostaria de mais informações sobre viagens e excursões.'
  );

  // Render Admin View
  if (currentView === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToSite={handleViewSite}
        />
      );
    }

    return (
      <AdminLayout
        user={adminUser}
        stats={adminData?.stats}
        unreadContactsCount={unreadCount}
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onLogout={handleLogout}
        onViewSite={handleViewSite}
      >
        {adminTab === 'dashboard' && (
          <DashboardView
            stats={
              adminData?.stats || {
                publishedCount: 0,
                draftCount: 0,
                closedCount: 0,
                contactRequestsCount: 0,
              }
            }
            travels={adminData?.travels || []}
            contacts={adminData?.contactRequests || []}
            onNewTravel={() => setAdminTab('travels')}
            onGoToTravels={() => setAdminTab('travels')}
            onGoToContacts={() => setAdminTab('contacts')}
            onUpdateContactStatus={handleUpdateContactStatus}
          />
        )}

        {adminTab === 'travels' && (
          <TravelsManager
            travels={adminData?.travels || []}
            destinations={adminData?.destinations || []}
            onCreateTravel={handleCreateTravel}
            onUpdateTravel={handleUpdateTravel}
            onDeleteTravel={handleDeleteTravel}
            onPreviewTravel={(t) => {
              handleSelectTravel(t);
              setCurrentView('site');
            }}
          />
        )}

        {adminTab === 'destinations' && (
          <DestinationsManager
            destinations={adminData?.destinations || []}
            travels={adminData?.travels || []}
            onCreateDestination={handleCreateDestination}
            onUpdateDestination={handleUpdateDestination}
            onDeleteDestination={handleDeleteDestination}
          />
        )}

        {adminTab === 'banners' && (
          <BannersManager
            banners={adminData?.banners || []}
            onCreateBanner={handleCreateBanner}
            onUpdateBanner={handleUpdateBanner}
            onDeleteBanner={handleDeleteBanner}
          />
        )}

        {adminTab === 'content' && (
          <ContentManager
            content={adminData?.content || content}
            onSaveContent={handleSaveContent}
          />
        )}

        {adminTab === 'contacts' && (
          <ContactsManager
            contacts={adminData?.contactRequests || []}
            settings={adminData?.settings || settings}
            onUpdateStatus={handleUpdateContactStatus}
            onDeleteContact={handleDeleteContact}
          />
        )}

        {adminTab === 'settings' && (
          <SettingsManager
            settings={adminData?.settings || settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </AdminLayout>
    );
  }

  // Render Public Website View
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#071A33] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        settings={settings}
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Body */}
      <main className="flex-1">
        {selectedTravel ? (
          /* Single Trip Details View */
          <TripDetailsView
            travel={selectedTravel}
            settings={settings}
            onBack={() => setSelectedTravel(null)}
            onContactWithTravel={handleContactWithTravel}
          />
        ) : (
          /* Normal Landing / Public Sections */
          <>
            <Hero
              banners={banners}
              content={content}
              settings={settings}
              onExploreTrips={() => handleNavigateSection('viagens')}
              onContact={() => handleNavigateSection('contato')}
            />

            <TripsSection
              travels={travels}
              destinations={destinations}
              onSelectTravel={handleSelectTravel}
              settings={settings}
            />

            <AboutSection
              content={content}
              settings={settings}
              onContactClick={() => handleNavigateSection('contato')}
            />

            <ContactSection
              settings={settings}
              preselectedTravel={contactTravel}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigateSection}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Floating WhatsApp Action Button */}
      <aside aria-label="Atendimento rápido" className="fixed bottom-6 right-6 z-40">
        <a
          href={floatingWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-300"
          title="Fale conosco no WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="hidden sm:inline">WhatsApp SonheTur</span>
        </a>
      </aside>
    </div>
  );
}
