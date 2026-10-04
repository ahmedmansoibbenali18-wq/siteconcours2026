import Icon from '../components/Icon.jsx';
import { resources } from '../utils/navigation.js';

export default function OverviewPage({ resourceState, visibleResources, navigateTo, query }) {
  return (
    <>
      <section aria-labelledby="welcome-title" className="welcome-section">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="eyebrow-line" />PORTAIL DES HABITANTS <span className="eyebrow-id">TN—01</span></div>
          <h1 id="welcome-title">Bienvenue sur<br /><span>Terra Nova.</span></h1>
          <p>Votre point de repère pour les services et la vie de la colonie.</p>
          <button className="primary-button" onClick={() => navigateTo('services')} type="button">
            Explorer les services <Icon name="arrow" size={17} />
          </button>
        </div>
        <div aria-label="Illustration abstraite de la planète Terra Nova" className="planet-panel" role="img">
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

      <section aria-label="État des espaces citoyens" className="status-strip">
        <div className="status-strip-heading"><Icon name="pulse" size={17} /><span>FLUX CITOYEN</span></div>
        {resources.map((resource) => {
          const state = resourceState[resource.id];
          const label = state.status === 'loading' ? 'Synchronisation…'
            : state.status === 'success' ? 'Données reçues'
              : state.status === 'error' ? 'Erreur de connexion' : 'Source à connecter';
          return (
            <button className="status-item" key={resource.id} onClick={() => navigateTo(resource.id)} type="button">
              <span className={`status-dot status-dot--${state.status}`} />
              <span>{resource.shortLabel}</span><strong>{label}</strong>
            </button>
          );
        })}
      </section>

      <section aria-labelledby="overview-heading" className="overview-section">
        <div className="section-heading">
          <div><span className="section-index">01 / SERVICES CITOYENS</span><h2 id="overview-heading">À portée de main.</h2></div>
          <button className="text-button" onClick={() => navigateTo('services')} type="button">Tout explorer <Icon name="arrow" size={16} /></button>
        </div>
        <div className="resource-grid">
          {visibleResources.map((resource) => (
            <article className="resource-tile" key={resource.id}>
              <div className="tile-top">
                <span className="tile-icon"><Icon name={resource.icon} size={19} /></span>
                <span className="tile-number">{`A—0${resources.findIndex(({ id }) => id === resource.id) + 1}`}</span>
              </div>
              <h3>{resource.label}</h3>
              <p>{resourceState[resource.id].status === 'success'
                ? 'Consultez les informations transmises par la plateforme.'
                : 'Les informations apparaîtront ici une fois la source officielle connectée.'}</p>
              <button className="tile-link" onClick={() => navigateTo(resource.id)} type="button">
                Ouvrir l’espace <Icon name="arrow" size={15} />
              </button>
            </article>
          ))}
          {visibleResources.length === 0 && <p className="no-results">Aucun espace ne correspond à « {query} ».</p>}
        </div>
      </section>

      <div className="overview-bottom">
        <section aria-labelledby="announcement-title" className="announcement-panel">
          <div className="panel-kicker"><span className="live-indicator" />CANAL D’INFORMATION</div>
          <div className="announcement-content">
            <div>
              <h2 id="announcement-title">Actualités de la colonie</h2>
              <p>{resourceState.news.status === 'success'
                ? 'Les dernières informations officielles sont disponibles.'
                : 'Aucune annonce n’est affichée tant que le flux officiel n’est pas connecté.'}</p>
            </div>
            <button aria-label="Consulter les actualités" className="round-button" onClick={() => navigateTo('news')} type="button">
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </section>
        <section aria-labelledby="report-title" className="report-panel">
          <span className="report-panel-icon"><Icon name="alert" size={20} /></span>
          <div>
            <span className="section-index">VOTRE VOIX COMPTE</span>
            <h2 id="report-title">Un problème à signaler ?</h2>
            <p>Accédez à l’espace de signalement citoyen.</p>
          </div>
          <button aria-label="Accéder au signalement" className="report-arrow" onClick={() => navigateTo('report')} type="button">
            <Icon name="arrow" size={18} />
          </button>
        </section>
      </div>
      <footer className="page-footer">
        <span>TERRA NOVA <span className="footer-separator">/</span> PORTAIL CITOYEN</span>
        <span>UN NOUVEAU FOYER, ENSEMBLE.</span>
      </footer>
    </>
  );
}
