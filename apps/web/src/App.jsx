import { useEffect, useMemo, useState } from 'react';
import { getResource, isResourceConfigured } from './services/terraNovaApi.js';

const resources = [
  { id: 'services', label: 'Services municipaux', shortLabel: 'Services', icon: 'grid' },
  { id: 'requests', label: 'Demandes habitantes', shortLabel: 'Demandes', icon: 'inbox' },
  { id: 'news', label: 'Actualités & annonces', shortLabel: 'Actualités', icon: 'news' },
];

const pages = [
  { id: 'overview', label: 'Vue d’ensemble', icon: 'home' },
  ...resources.map(({ id, shortLabel, icon }) => ({ id, label: shortLabel, icon })),
  { id: 'report', label: 'Signaler un problème', icon: 'alert' },
];

const initialResourceState = Object.fromEntries(
  resources.map(({ id }) => [id, { status: 'idle', data: null, error: '' }]),
);

function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    inbox: <><path d="M4 4h16l2 11v5H2v-5L4 4Z" /><path d="M2 14h6l2 3h4l2-3h6M8 8h8" /></>,
    news: <><path d="M5 4h15v17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M7 8h10M7 12h10M7 16h6M3 7h2" /></>,
    alert: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    pulse: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function formatDate() {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function dataToText(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function getAvailableFilters(data) {
  if (!Array.isArray(data) || data.length < 2) return [];

  const fields = new Set(data.flatMap((item) => (
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.keys(item)
      : []
  )));

  return [...fields].flatMap((field) => {
    const values = data.map((item) => item?.[field]);
    if (values.some((value) => !['string', 'number', 'boolean'].includes(typeof value))) return [];
    const options = [...new Map(values.map((value) => [JSON.stringify(value), String(value)])).entries()];
    return options.length > 1 && options.length <= 12 ? [{ field, options }] : [];
  });
}

function ResourceContent({ resource, state, query = '', filterField, filterValue, onFilterChange }) {
  if (state.status === 'loading') {
    return <div className="resource-message" role="status"><span className="loader" />Chargement des données…</div>;
  }

  if (state.status === 'unavailable') {
    return (
      <div className="resource-message resource-message--muted">
        <span className="message-symbol"><Icon name="globe" size={19} /></span>
        <div>
          <strong>Source officielle non configurée</strong>
          <p>Le chemin API de {resource.label.toLowerCase()} n’a pas encore été communiqué.</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="resource-message resource-message--error" role="alert">
        <span className="message-symbol"><Icon name="alert" size={19} /></span>
        <div><strong>Impossible de charger ces données</strong><p>{state.error}</p></div>
      </div>
    );
  }

  if (state.status !== 'success' || state.data == null) {
    return <div className="resource-message resource-message--muted">Aucune donnée à afficher.</div>;
  }

  const items = Array.isArray(state.data) ? state.data : [state.data];
  const filters = getAvailableFilters(Array.isArray(state.data) ? state.data : []);
  const visibleItems = query.trim()
    ? items.filter((item) => dataToText(item).toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')))
    : items;
  const filteredItems = filterField && filterValue
    ? visibleItems.filter((item) => JSON.stringify(item?.[filterField]) === filterValue)
    : visibleItems;
  const filterControls = filters.map(({ field, options }) => (
    <label className="filter-field" key={field}>
      <span>Filtrer par <strong>{field}</strong></span>
      <select value={filterField === field ? filterValue : ''} onChange={(event) => onFilterChange(field, event.target.value)}>
        <option value="">Toutes les valeurs</option>
        {options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
    </label>
  ));

  if (filteredItems.length === 0) {
    return (
      <>
        <div className="facet-filters">{filterControls}</div>
        <div className="resource-message resource-message--muted">
          {items.length === 0 ? 'Aucune donnée publiée pour le moment.' : 'Aucun résultat ne correspond à ces critères.'}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="facet-filters">{filterControls}</div>
      <div className="record-list" aria-live="polite">
        {filteredItems.map((item, index) => (
          <article className="record-card" key={index}>
            <span className="record-index">{String(index + 1).padStart(2, '0')}</span>
            <pre>{dataToText(item)}</pre>
          </article>
        ))}
      </div>
    </>
  );
}

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [resourceState, setResourceState] = useState(initialResourceState);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState({ field: '', value: '' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let active = true;

    resources.forEach((resource) => {
      if (!isResourceConfigured(resource.id)) {
        setResourceState((current) => ({
          ...current,
          [resource.id]: { status: 'unavailable', data: null, error: '' },
        }));
        return;
      }

      setResourceState((current) => ({
        ...current,
        [resource.id]: { status: 'loading', data: null, error: '' },
      }));

      getResource(resource.id)
        .then((data) => {
          if (!active) return;
          setResourceState((current) => ({
            ...current,
            [resource.id]: { status: 'success', data, error: '' },
          }));
        })
        .catch((error) => {
          if (!active) return;
          setResourceState((current) => ({
            ...current,
            [resource.id]: {
              status: 'error',
              data: null,
              error: error.message || 'Une erreur réseau est survenue.',
            },
          }));
        });
    });

    return () => { active = false; };
  }, []);

  const currentPage = pages.find((page) => page.id === activePage) ?? pages[0];
  const selectedResource = resources.find((resource) => resource.id === activePage);
  const apiConfigured = resources.some(({ id }) => isResourceConfigured(id));
  const visibleResources = useMemo(() => (
    resources.filter((resource) => {
      if (!query.trim()) return true;
      const state = resourceState[resource.id];
      return state.status === 'unavailable'
        || (state.status === 'success' && dataToText(state.data).toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));
    })
  ), [query, resourceState]);

  function navigateTo(page) {
    setActivePage(page);
    setQuery('');
    setActiveFilter({ field: '', value: '' });
    setMobileNavOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${mobileNavOpen ? ' sidebar--open' : ''}`}>
        <a className="brand" href="#accueil" onClick={() => navigateTo('overview')} aria-label="Terra Nova — accueil">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>TERRA NOVA</strong><small>PORTAIL CITOYEN</small></span>
        </a>

        <div className="sidebar-label">ESPACE CITOYEN</div>
        <nav className="side-nav" aria-label="Navigation principale">
          {pages.map((page) => (
            <button
              className={`nav-item${activePage === page.id ? ' nav-item--active' : ''}`}
              type="button"
              key={page.id}
              onClick={() => navigateTo(page.id)}
              aria-current={activePage === page.id ? 'page' : undefined}
            >
              <Icon name={page.icon} />
              <span>{page.label}</span>
              {page.id === 'report' && <span className="nav-accent" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="network-card">
            <span className="network-icon"><Icon name="pulse" size={17} /></span>
            <div><strong>Réseau citoyen</strong><span className="network-status"><i />{apiConfigured ? 'Source configurée' : 'En attente de connexion'}</span></div>
          </div>
          <div className="sidebar-foot"><span>TN / PORTAIL 01</span><span>V. 1.0</span></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-backdrop" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Fermer le menu" />}

      <main className="main-content" id="accueil">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-label={mobileNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
            <Icon name={mobileNavOpen ? 'close' : 'menu'} />
          </button>
          <div className="breadcrumb"><span>TERRA NOVA</span><span className="breadcrumb-slash">/</span><strong>{currentPage.label}</strong></div>
          <div className="topbar-right">
            <span className={`connection-pill${apiConfigured ? ' connection-pill--configured' : ''}`}>
              <i />{apiConfigured ? 'API configurée' : 'API à configurer'}
            </span>
            <span className="topbar-date">{formatDate()}</span>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'overview' && (
            <>
              <section className="welcome-section" aria-labelledby="welcome-title">
                <div className="welcome-copy">
                  <div className="eyebrow"><span className="eyebrow-line" />PORTAIL DES HABITANTS <span className="eyebrow-id">TN—01</span></div>
                  <h1 id="welcome-title">Bienvenue sur<br /><span>Terra Nova.</span></h1>
                  <p>Votre point de repère pour les services et la vie de la colonie.</p>
                  <button className="primary-button" type="button" onClick={() => navigateTo('services')}>
                    Explorer les services <Icon name="arrow" size={17} />
                  </button>
                </div>
                <div className="planet-panel" aria-label="Illustration abstraite de la planète Terra Nova">
                  <div className="planet-orbit planet-orbit--one" />
                  <div className="planet-orbit planet-orbit--two" />
                  <div className="planet">
                    <span className="planet-shade" />
                    <span className="planet-continent planet-continent--one" />
                    <span className="planet-continent planet-continent--two" />
                  </div>
                  <span className="planet-coordinate">VISUEL<br />CONCEPTUEL</span>
                  <span className="planet-label"><i />TERRA NOVA</span>
                  <span className="planet-scan" />
                </div>
              </section>

              <section className="status-strip" aria-label="État des espaces citoyens">
                <div className="status-strip-heading"><Icon name="pulse" size={17} /><span>FLUX CITOYEN</span></div>
                {resources.map((resource) => {
                  const state = resourceState[resource.id];
                  const label = state.status === 'loading' ? 'Synchronisation…'
                    : state.status === 'success' ? 'Données reçues'
                      : state.status === 'error' ? 'Erreur de connexion' : 'Source à connecter';
                  return (
                    <button className="status-item" key={resource.id} type="button" onClick={() => navigateTo(resource.id)}>
                      <span className={`status-dot status-dot--${state.status}`} />
                      <span>{resource.shortLabel}</span><strong>{label}</strong>
                    </button>
                  );
                })}
              </section>

              <section className="overview-section" aria-labelledby="overview-heading">
                <div className="section-heading">
                  <div><span className="section-index">01 / SERVICES CITOYENS</span><h2 id="overview-heading">À portée de main.</h2></div>
                  <button className="text-button" type="button" onClick={() => navigateTo('services')}>Tout explorer <Icon name="arrow" size={16} /></button>
                </div>
                <div className="resource-grid">
                  {visibleResources.map((resource) => (
                    <article className="resource-tile" key={resource.id}>
                      <div className="tile-top"><span className="tile-icon"><Icon name={resource.icon} size={19} /></span><span className="tile-number">{resource.id === 'services' ? 'A—01' : resource.id === 'requests' ? 'A—02' : 'A—03'}</span></div>
                      <h3>{resource.label}</h3>
                      <p>{resourceState[resource.id].status === 'success' ? 'Consultez les informations transmises par la plateforme.' : 'Les informations apparaîtront ici une fois la source officielle connectée.'}</p>
                      <button className="tile-link" type="button" onClick={() => navigateTo(resource.id)}>Ouvrir l’espace <Icon name="arrow" size={15} /></button>
                    </article>
                  ))}
                  {visibleResources.length === 0 && <p className="no-results">Aucun espace ne correspond à « {query} ».</p>}
                </div>
              </section>

              <div className="overview-bottom">
                <section className="announcement-panel" aria-labelledby="announcement-title">
                  <div className="panel-kicker"><span className="live-indicator" />CANAL D’INFORMATION</div>
                  <div className="announcement-content">
                    <div><h2 id="announcement-title">Actualités de la colonie</h2><p>{resourceState.news.status === 'success' ? 'Les dernières informations officielles sont disponibles.' : 'Aucune annonce n’est affichée tant que le flux officiel n’est pas connecté.'}</p></div>
                    <button className="round-button" type="button" onClick={() => navigateTo('news')} aria-label="Consulter les actualités"><Icon name="arrow" size={18} /></button>
                  </div>
                </section>
                <section className="report-panel" aria-labelledby="report-title">
                  <span className="report-panel-icon"><Icon name="alert" size={20} /></span>
                  <div><span className="section-index">VOTRE VOIX COMPTE</span><h2 id="report-title">Un problème à signaler ?</h2><p>Accédez à l’espace de signalement citoyen.</p></div>
                  <button className="report-arrow" type="button" onClick={() => navigateTo('report')} aria-label="Accéder au signalement"><Icon name="arrow" size={18} /></button>
                </section>
              </div>
              <footer className="page-footer"><span>TERRA NOVA <span className="footer-separator">/</span> PORTAIL CITOYEN</span><span>UN NOUVEAU FOYER, ENSEMBLE.</span></footer>
            </>
          )}

          {selectedResource && (
            <section className="data-page" aria-labelledby="data-page-title">
              <div className="page-intro">
                <span className="section-index">ESPACE CITOYEN / {selectedResource.id.toUpperCase()}</span>
                <h1 id="data-page-title">{selectedResource.label}</h1>
                <p>Consultez les informations publiées par la plateforme officielle de Terra Nova.</p>
              </div>
              <div className="data-toolbar">
                <label className="search-field">
                  <Icon name="search" size={18} />
                  <span className="visually-hidden">Rechercher dans {selectedResource.label.toLowerCase()}</span>
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans les données…" />
                  <kbd>/</kbd>
                </label>
                <span className="data-count">{resourceState[selectedResource.id].status === 'success' && Array.isArray(resourceState[selectedResource.id].data) ? `${resourceState[selectedResource.id].data.length} ENREGISTREMENT(S)` : 'SOURCE OFFICIELLE'}</span>
              </div>
              <ResourceContent
                resource={selectedResource}
                state={resourceState[selectedResource.id]}
                query={query}
                filterField={activeFilter.field}
                filterValue={activeFilter.value}
                onFilterChange={(field, value) => setActiveFilter({ field, value })}
              />
            </section>
          )}

          {activePage === 'report' && (
            <section className="data-page report-page" aria-labelledby="report-page-title">
              <div className="page-intro">
                <span className="section-index">ESPACE CITOYEN / SIGNALEMENT</span>
                <h1 id="report-page-title">Faire un signalement.</h1>
                <p>Décrivez un problème observé dans votre quartier pour le transmettre aux services compétents.</p>
              </div>
              <div className="report-form-panel">
                <div className="report-form-heading"><span className="tile-icon"><Icon name="alert" size={20} /></span><div><h2>Votre signalement</h2><p>Les champs du formulaire sont préparatoires ; aucune information n’est envoyée.</p></div></div>
                <form onSubmit={(event) => event.preventDefault()}>
                  <label className="form-field">Sujet du signalement<input name="title" type="text" placeholder="Ex. équipement endommagé" required /></label>
                  <label className="form-field">Description<textarea name="description" rows="5" placeholder="Décrivez la situation et son emplacement…" required /></label>
                  <label className="form-field">Emplacement <span className="optional-label">FACULTATIF</span><input name="location" type="text" placeholder="Quartier, secteur ou repère" /></label>
                  <div className="form-notice" role="status"><Icon name="globe" size={18} /><p>Le contrat officiel de signalement n’est pas fourni. Le formulaire restera désactivé jusqu’à réception de la route et du format de données requis.</p></div>
                  <button className="primary-button form-submit" type="button" disabled>Envoi indisponible <Icon name="arrow" size={17} /></button>
                </form>
              </div>
            </section>
          )}

          {activePage !== 'overview' && (
            <footer className="page-footer page-footer--inner"><span>TERRA NOVA <span className="footer-separator">/</span> PORTAIL CITOYEN</span><span>UN NOUVEAU FOYER, ENSEMBLE.</span></footer>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
