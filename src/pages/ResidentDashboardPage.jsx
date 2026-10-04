import Icon from '../components/Icon.jsx';

function SummaryCard({ label, value, icon, onClick }) {
  return (
    <button className="resident-summary-card" onClick={onClick} type="button">
      <span className="resident-card-icon"><Icon name={icon} /></span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </button>
  );
}

export default function ResidentDashboardPage({ resident, requests, notifications, navigateTo, onOpenRequest, onNewRequest }) {
  const inProgress = requests.filter((request) => ['en cours', 'in progress', 'processing'].includes(String(request.status).toLocaleLowerCase('fr'))).length;
  const resolved = requests.filter((request) => ['résolue', 'resolue', 'resolved', 'closed', 'fermée', 'fermee'].includes(String(request.status).toLocaleLowerCase('fr'))).length;
  const unreadReplies = requests.filter((request) => request.hasNewResponse || request.unreadResponse).length;
  const sortedRequests = [...requests].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const recentReplies = requests.filter((request) => request.response || (Array.isArray(request.messages) && request.messages.length));
  const name = resident?.firstName || 'habitant·e';

  return (
    <section aria-labelledby="resident-home-title" className="resident-page">
      <header className="resident-page-heading">
        <span className="section-index">MON ESPACE · APERÇU DE DÉMONSTRATION</span>
        <h1 id="resident-home-title">Bonjour, {name}</h1>
        <p>Retrouvez vos demandes de démonstration et les informations de votre espace.</p>
      </header>
      <div className="preview-banner" role="status">
        <Icon name="globe" size={18} />
        <p><strong>Session de démonstration temporaire.</strong> Ce parcours n’authentifie pas réellement votre identité. Les données restent en mémoire jusqu’au rechargement.</p>
      </div>
      <button className="primary-button resident-create-request" onClick={onNewRequest} type="button">
        + Faire une demande <Icon name="arrow" size={16} />
      </button>
      <div className="resident-summary-grid">
        <SummaryCard icon="inbox" label="Demandes en cours" onClick={() => navigateTo('my-requests')} value={inProgress} />
        <SummaryCard icon="news" label="Réponses non lues" onClick={() => navigateTo('notifications')} value={unreadReplies} />
        <SummaryCard icon="pulse" label="Demandes résolues" onClick={() => navigateTo('my-requests')} value={resolved} />
        <SummaryCard icon="alert" label="Notifications" onClick={() => navigateTo('notifications')} value={notifications.length} />
      </div>
      <section aria-labelledby="recent-requests-title" className="resident-card">
        <div className="resident-card-heading">
          <span className="resident-card-icon"><Icon name="inbox" /></span>
          <div><span className="section-index">SUIVI PERSONNEL</span><h2 id="recent-requests-title">Mes dernières demandes</h2></div>
        </div>
        {sortedRequests.length === 0
          ? <p className="resident-empty">Vous n’avez pas encore créé de demande dans cette session de démonstration.</p>
          : sortedRequests.slice(0, 3).map((request) => (
            <button className="resident-recent-item" key={request.demoKey} onClick={() => onOpenRequest(request.demoKey)} type="button">
              <span><strong>{request.title}</strong><small>{request.category} · Simulation locale</small></span>
              <Icon name="arrow" size={15} />
            </button>
          ))}
        <button className="text-button" onClick={() => navigateTo('my-requests')} type="button">Toutes mes demandes <Icon name="arrow" size={14} /></button>
      </section>
      <section aria-labelledby="recent-replies-title" className="resident-card">
        <div className="resident-card-heading">
          <span className="resident-card-icon"><Icon name="news" /></span>
          <div><span className="section-index">MESSAGES</span><h2 id="recent-replies-title">Mes dernières réponses</h2></div>
        </div>
        {recentReplies.length === 0
          ? <p className="resident-empty">Aucune réponse officielle n’est disponible. Les demandes de démonstration ne génèrent pas de fausses réponses.</p>
          : recentReplies.slice(0, 3).map((request) => (
            <article className="request-response-summary" key={request.demoKey}>
              <span className="request-response-label">Réponse à : {request.title}</span>
              <p>{request.response ?? request.messages?.at(-1)?.text}</p>
            </article>
          ))}
        <button className="text-button" onClick={() => navigateTo('notifications')} type="button">Mes notifications <Icon name="arrow" size={14} /></button>
      </section>
    </section>
  );
}
