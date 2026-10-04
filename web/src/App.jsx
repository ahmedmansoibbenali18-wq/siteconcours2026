import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import NovaAssistant from './components/NovaAssistant.jsx';
import useResources from './hooks/useResources.js';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RequestDetailPage from './pages/RequestDetailPage.jsx';
import ResidentResourcePage from './pages/ResidentResourcePage.jsx';
import ResidentDashboardPage from './pages/ResidentDashboardPage.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import ResourcePage from './pages/ResourcePage.jsx';
import { getSession, logout, updateDemoResident } from './services/auth.js';
import { createDemoRequest } from './services/requests.js';
import { createResidentDemoRequest, getResidentNotifications, getResidentRequest, getResidentRequests } from './services/residentData.js';
import { dataToText } from './utils/data.js';
import { allResources, pages, resources } from './utils/navigation.js';

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const resolvedInitialPage = normalizedPath === '/profil' ? 'profile'
    : normalizedPath === '/dashboard' ? 'dashboard'
      : normalizedPath.match(/^\/mes-demandes\/[^/]+$/) ? 'request-detail'
        : pages.find((page) => page.path === normalizedPath)?.id ?? (normalizedPath === '/' ? 'overview' : 'not-found');
  const initialSession = getSession();
  const initialPageIsPrivate = ['my-space', 'my-requests', 'request-detail', 'notifications', 'profile'].includes(resolvedInitialPage);
  const initialPage = initialPageIsPrivate && !initialSession ? 'login' : resolvedInitialPage;
  const [activePage, setActivePage] = useState(initialPage);
  const [requestedPage, setRequestedPage] = useState(initialPageIsPrivate && !initialSession ? resolvedInitialPage : null);
  const [requestDetailId, setRequestDetailId] = useState(
    normalizedPath.match(/^\/mes-demandes\/([^/]+)$/)?.[1] ?? '',
  );
  const [session, setSession] = useState(initialSession);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState({ field: '', value: '' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [readAlerts, setReadAlerts] = useState(() => new Set());
  const [requestDraft, setRequestDraft] = useState(null);
  const [publicDemoRequests, setPublicDemoRequests] = useState([]);
  const [residentRequests, setResidentRequests] = useState(() => initialSession ? getResidentRequests(initialSession.id) : []);
  const { resourceState, retryResource } = useResources();

  const currentPage = pages.find((page) => page.id === activePage)
    ?? (activePage === 'request-detail' ? { label: 'Détail de la demande' } : { label: 'Page introuvable' });
  const selectedResource = resources.find((resource) => resource.id === activePage);
  const apiConfigured = allResources.some(({ id }) => resourceState[id].status !== 'unavailable');
  const visibleResources = useMemo(() => (
    resources.filter((resource) => {
      if (!query.trim()) return true;
      const state = resourceState[resource.id];
      return state.status === 'unavailable'
        || (state.status === 'success'
          && dataToText(state.data).toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));
    })
  ), [query, resourceState]);

  const privatePageIds = new Set(['my-space', 'my-requests', 'request-detail', 'notifications', 'profile']);

  function navigateTo(page) {
    const destination = pages.find((item) => item.id === page);
    if (!destination) return;
    if (privatePageIds.has(page) && !session) {
      setRequestedPage(page);
      setActivePage('login');
      if (window.location.pathname !== '/connexion') window.history.pushState({}, '', '/connexion');
      setMobileNavOpen(false);
      return;
    }
    setActivePage(page);
    setRequestDetailId('');
    if (window.location.pathname !== destination.path) {
      window.history.pushState({}, '', destination.path);
    }
    setQuery('');
    setActiveFilter({ field: '', value: '' });
    setMobileNavOpen(false);
  }

  const clearRequestDraft = useCallback(() => setRequestDraft(null), []);
  const addPublicDemoRequest = useCallback((fields) => {
    setPublicDemoRequests((current) => [createDemoRequest(fields), ...current]);
  }, []);
  const handleNovaRequest = useCallback((draft) => {
    setRequestDraft(draft);
    navigateTo(session ? 'my-requests' : 'requests');
  }, [session]);

  const handleAuthenticated = useCallback((resident) => {
    setSession(resident);
    setResidentRequests(getResidentRequests(resident.id));
    setRequestedPage(null);
    const nextPage = requestedPage && privatePageIds.has(requestedPage) ? requestedPage : 'my-space';
    const destination = pages.find((page) => page.id === nextPage) ?? pages.find((page) => page.id === 'my-space');
    setActivePage(destination.id);
    window.history.pushState({}, '', destination.path);
    setMobileNavOpen(false);
  }, [requestedPage, setMobileNavOpen]);

  const handleAddResidentRequest = useCallback((fields) => {
    if (!session) return;
    const created = createResidentDemoRequest(session.id, fields);
    setResidentRequests(getResidentRequests(session.id));
    return created;
  }, [session]);

  const handleNewResidentRequest = useCallback(() => {
    setRequestDraft({ category: '', title: '', description: '', sector: '', urgency: 'normal', contact: '' });
    navigateTo('my-requests');
  }, [session]);

  const handleOpenResidentRequest = useCallback((requestId) => {
    if (!session) {
      navigateTo('login');
      return;
    }
    const path = `/mes-demandes/${encodeURIComponent(requestId)}`;
    setRequestDetailId(requestId);
    setActivePage('request-detail');
    window.history.pushState({}, '', path);
    setMobileNavOpen(false);
  }, [session]);

  const handleProfileUpdate = useCallback((fields) => {
    const resident = updateDemoResident(fields);
    setSession(resident);
    return resident;
  }, []);

  useEffect(() => {
    if (initialPageIsPrivate && !initialSession) {
      window.history.replaceState({}, '', '/connexion');
    }
    function syncPageFromPath() {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      const detailMatch = path.match(/^\/mes-demandes\/([^/]+)$/);
      const pageId = path === '/profil' ? 'profile'
        : detailMatch ? 'request-detail'
          : pages.find((page) => page.path === path)?.id ?? (path === '/' ? 'overview' : 'not-found');
      if (privatePageIds.has(pageId) && !getSession()) {
        setRequestedPage(pageId);
        setActivePage('login');
        window.history.replaceState({}, '', '/connexion');
        return;
      }
      setRequestDetailId(detailMatch ? decodeURIComponent(detailMatch[1]) : '');
      setActivePage(pageId);
      setQuery('');
      setActiveFilter({ field: '', value: '' });
    }
    window.addEventListener('popstate', syncPageFromPath);
    return () => window.removeEventListener('popstate', syncPageFromPath);
  }, []);

  function handleLogout() {
    logout();
    setSession(null);
    setResidentRequests([]);
    setActivePage('overview');
    window.history.pushState({}, '', '/');
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <Sidebar
        activePage={activePage}
        apiConfigured={apiConfigured}
        isAuthenticated={Boolean(session)}
        mobileNavOpen={mobileNavOpen}
        navigateTo={navigateTo}
        onLogout={handleLogout}
        setMobileNavOpen={setMobileNavOpen}
      />
      <main className="main-content" id="main-content">
        <Topbar
          apiConfigured={apiConfigured}
          currentPage={currentPage}
          demoSession={Boolean(session)}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />
        <div className="page-content">
          {activePage === 'overview' && (
            <OverviewPage
              navigateTo={navigateTo}
              query={query}
              resourceState={resourceState}
              visibleResources={visibleResources}
            />
          )}
          {activePage === 'requests' && (
            <RequestsPage
              clearDraft={clearRequestDraft}
              demoRequests={publicDemoRequests}
              initialDraft={requestDraft}
              onRetry={() => retryResource('requests')}
              onCreateDemoRequest={addPublicDemoRequest}
              state={resourceState.requests}
            />
          )}
          {activePage === 'my-space' && session && (
            <ResidentDashboardPage
              onNewRequest={handleNewResidentRequest}
              navigateTo={navigateTo}
              notifications={getResidentNotifications(session.id)}
              onOpenRequest={handleOpenResidentRequest}
              requests={residentRequests}
              resident={session}
            />
          )}
          {activePage === 'my-requests' && session && (
            <RequestsPage
              clearDraft={clearRequestDraft}
              demoRequests={residentRequests}
              initialDraft={requestDraft}
              onCreateDemoRequest={handleAddResidentRequest}
              onOpenRequest={handleOpenResidentRequest}
              privateMode
              state={{ status: 'unavailable', data: null, error: '' }}
            />
          )}
          {activePage === 'request-detail' && session && (
            <RequestDetailPage
              navigateTo={navigateTo}
              request={getResidentRequest(session.id, requestDetailId)}
            />
          )}
          {activePage === 'notifications' && session && (
            <NotificationsPage notifications={getResidentNotifications(session.id)} />
          )}
          {selectedResource && selectedResource.id !== 'requests' && (
            <ResourcePage
              activeFilter={activeFilter}
              onRetry={() => retryResource(selectedResource.id)}
              query={query}
              resource={selectedResource}
              setActiveFilter={setActiveFilter}
              setQuery={setQuery}
              state={resourceState[selectedResource.id]}
            />
          )}
          {activePage === 'report' && <ReportPage />}
          {activePage === 'dashboard' && (
            <DashboardPage navigateTo={navigateTo} readAlerts={readAlerts} resourceState={resourceState} retryResource={retryResource} setReadAlerts={setReadAlerts} />
          )}
          {['alerts', 'weather', 'water'].includes(activePage) && (
            <ResidentResourcePage
              onRetry={() => retryResource(activePage)}
              resourceId={activePage}
              readAlerts={readAlerts}
              state={resourceState[activePage]}
              setReadAlerts={setReadAlerts}
            />
          )}
          {activePage === 'profile' && session && (
            <ProfilePage navigateTo={navigateTo} onUpdateProfile={handleProfileUpdate} resident={session} />
          )}
          {activePage === 'login' && <LoginPage navigateTo={navigateTo} onAuthenticated={handleAuthenticated} />}
          {activePage === 'register' && <RegisterPage navigateTo={navigateTo} onAuthenticated={handleAuthenticated} />}
          {activePage === 'password-reset' && <PasswordResetPage navigateTo={navigateTo} />}
          {activePage === 'not-found' && (
            <section aria-labelledby="not-found-title" className="resident-page">
              <div className="resident-page-heading">
                <span className="section-index">ERREUR / 404</span>
                <h1 id="not-found-title">Page introuvable</h1>
                <p>Cette adresse ne correspond à aucune rubrique de Terra Nova.</p>
              </div>
              <button className="primary-button" onClick={() => navigateTo('overview')} type="button">Retour à l’accueil</button>
            </section>
          )}
          {activePage === 'nova' && (
            <section aria-labelledby="nova-page-title" className="resident-page nova-page">
              <div className="resident-page-heading">
                <span className="section-index">ESPACE HABITANT / AIDE</span>
                <h1 id="nova-page-title">Assistant Nova</h1>
                <p>Une aide locale de démonstration pour vous orienter dans le portail.</p>
              </div>
              <div className="preview-banner" role="status">
                <p><strong>Aucune IA, donnée officielle ou fonction vocale n’est connectée.</strong> Les réponses de démonstration ne constituent pas une source d’information.</p>
              </div>
              <p className="nova-open-hint">Utilisez le bouton Nova flottant, en bas de l’écran, pour ouvrir l’assistant.</p>
            </section>
          )}
          {activePage !== 'overview' && (
            <footer className="page-footer page-footer--inner">
              <span>TERRA NOVA <span className="footer-separator">/</span> PORTAIL CITOYEN</span>
              <span>UN NOUVEAU FOYER, ENSEMBLE.</span>
            </footer>
          )}
        </div>
      </main>
      <NovaAssistant navigateTo={navigateTo} onCreateRequest={handleNovaRequest} />
    </div>
  );
}
