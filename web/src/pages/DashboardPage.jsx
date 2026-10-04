import AlertCenter from '../components/AlertCenter.jsx';
import Icon from '../components/Icon.jsx';
import ResourceContent from '../components/ResourceContent.jsx';
import WaterStatus from '../components/WaterStatus.jsx';
import WeatherCard from '../components/WeatherCard.jsx';

function getServiceStatus(state) {
  if (state.status === 'loading' || state.status === 'idle') return 'Chargement…';
  if (state.status === 'unavailable') return 'Source à connecter';
  if (state.status === 'error') return 'Erreur de connexion';
  if (state.data == null) return 'Aucune donnée';
  return 'Données reçues';
}

function QuickLink({ icon, title, description, onClick }) {
  return (
    <button className="dashboard-quick-link" onClick={onClick} type="button">
      <span className="resident-card-icon"><Icon name={icon} /></span>
      <span><strong>{title}</strong><small>{description}</small></span>
      <Icon name="arrow" size={16} />
    </button>
  );
}

export default function DashboardPage({ resourceState, retryResource, navigateTo, readAlerts, setReadAlerts }) {
  return (
    <section aria-labelledby="resident-dashboard-title" className="resident-page">
      <div className="resident-page-heading">
        <span className="section-index">ESPACE HABITANT / APERÇU</span>
        <h1 id="resident-dashboard-title">Bonjour, habitant·e</h1>
        <p>Voici les informations importantes pour votre vie sur Terra Nova.</p>
      </div>
      <div className="preview-banner" role="status">
        <Icon name="globe" size={18} />
        <p><strong>Mode aperçu, sans compte connecté.</strong> L’authentification et les données personnelles nécessitent les services officiels de Terra Nova.</p>
        <button className="text-button" onClick={() => navigateTo('login')} type="button">Connexion <Icon name="arrow" size={14} /></button>
      </div>
      <section aria-label="État des services" className="resident-card service-status-card">
        <div className="resident-card-heading">
          <span className="resident-card-icon"><Icon name="pulse" /></span>
          <div><span className="section-index">SYNCHRONISATION</span><h2>État des services</h2></div>
        </div>
        <div className="service-status-grid">
          {[
            ['services', 'Services'],
            ['requests', 'Demandes'],
            ['news', 'Informations'],
          ].map(([id, label]) => (
            <div className="service-status-item" key={id}><span>{label}</span><strong>{getServiceStatus(resourceState[id])}</strong></div>
          ))}
        </div>
      </section>
      <div className="resident-grid">
        <WeatherCard onRetry={() => retryResource('weather')} state={resourceState.weather} />
        <WaterStatus onRetry={() => retryResource('water')} state={resourceState.water} />
      </div>
      <AlertCenter onRetry={() => retryResource('alerts')} readAlerts={readAlerts} setReadAlerts={setReadAlerts} state={resourceState.alerts} />
      <div className="resident-grid resident-grid--lower">
        <section className="resident-card">
          <div className="resident-card-heading">
            <span className="resident-card-icon"><Icon name="inbox" /></span>
            <div><span className="section-index">ESPACE PERSONNEL</span><h2>Mes demandes</h2></div>
          </div>
          <p className="resident-empty">Vos demandes personnelles ne peuvent pas être identifiées sans compte connecté ni API de profil.</p>
          <button className="text-button" onClick={() => navigateTo('requests')} type="button">Consulter les demandes <Icon name="arrow" size={14} /></button>
        </section>
        <section className="resident-card">
          <div className="resident-card-heading">
            <span className="resident-card-icon"><Icon name="news" /></span>
            <div><span className="section-index">INFORMATIONS</span><h2>À retenir</h2></div>
          </div>
          <ResourceContent
            filterField=""
            filterValue=""
            onFilterChange={() => {}}
            onRetry={() => retryResource('news')}
            query=""
            resource={{ id: 'news', label: 'actualités' }}
            state={resourceState.news}
          />
          <button className="text-button" onClick={() => navigateTo('news')} type="button">Voir les actualités <Icon name="arrow" size={14} /></button>
        </section>
      </div>
      <section aria-label="Accès rapides" className="dashboard-links">
        <QuickLink description="Consultez les rubriques disponibles." icon="grid" onClick={() => navigateTo('services')} title="Services de la ville" />
        <QuickLink description="Le formulaire est préparé pour l’API." icon="alert" onClick={() => navigateTo('report')} title="Signaler un problème" />
        <QuickLink description="Aide locale en mode démonstration." icon="sparkles" onClick={() => navigateTo('nova')} title="Assistant Nova" />
      </section>
    </section>
  );
}
