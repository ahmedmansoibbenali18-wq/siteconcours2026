import Icon from '../components/Icon.jsx';

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date non fournie'
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
}

export default function RequestDetailPage({ request, navigateTo }) {
  if (!request) {
    return (
      <section className="resident-page">
        <div className="resident-page-heading"><span className="section-index">SUIVI PERSONNEL</span><h1>Demande introuvable</h1></div>
        <p className="resident-empty">Cette demande n’existe pas dans votre espace de démonstration.</p>
        <button className="text-button" onClick={() => navigateTo('my-requests')} type="button">Retour à mes demandes</button>
      </section>
    );
  }

  return (
    <section aria-labelledby="request-detail-title" className="resident-page">
      <header className="resident-page-heading">
        <span className="section-index">MON ESPACE / DEMANDE · DÉMONSTRATION</span>
        <h1 id="request-detail-title">{request.title}</h1>
        <p>Catégorie : {request.category}</p>
      </header>
      <div className="preview-banner" role="status">
        <Icon name="globe" size={18} />
        <p><strong>Demande de démonstration · non transmise.</strong> Ce suivi est visible uniquement dans l’espace de démonstration actuellement actif.</p>
      </div>
      <article className="request-card">
        <span className="request-demo-badge">DÉMO · NON TRANSMISE</span>
        <p className="request-description">{request.description}</p>
        {request.sector && <p className="request-urgency">Secteur : {request.sector}</p>}
        <div className="request-timeline">
          <div className="request-timeline-item"><span className="timeline-dot" /><span>Demande créée</span><time>{displayDate(request.createdAt)}</time></div>
          <div className="request-timeline-item"><span className="timeline-dot timeline-dot--status" /><span>Statut</span><strong className="request-status request-status--demo">Simulation locale</strong></div>
        </div>
        {request.response
          ? <section className="request-response"><span className="request-response-label">Réponse officielle</span><p>{request.response}</p></section>
          : <p className="resident-empty">Aucune réponse n’est simulée ou inventée. La réponse de Terra Nova apparaîtra lorsqu’un service officiel sera connecté.</p>}
      </article>
      <button className="text-button" onClick={() => navigateTo('my-requests')} type="button">Retour à mes demandes <Icon name="arrow" size={14} /></button>
    </section>
  );
}
