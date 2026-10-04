import Icon from '../components/Icon.jsx';

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function NotificationsPage({ notifications }) {
  return (
    <section aria-labelledby="notifications-title" className="resident-page">
      <header className="resident-page-heading">
        <span className="section-index">MON ESPACE / ACTUALITÉS PERSONNELLES</span>
        <h1 id="notifications-title">Notifications</h1>
        <p>Les mises à jour qui concernent vos demandes.</p>
      </header>
      <div className="preview-banner" role="note">
        <Icon name="globe" size={18} />
        <p><strong>Notifications de démonstration.</strong> Cette page n’est reliée à aucun service de notification officiel.</p>
      </div>
      {notifications.length === 0 ? (
        <p className="resident-empty">Aucune notification dans cette session. Les réponses et changements de statut apparaîtront après connexion à un service officiel.</p>
      ) : (
        <div aria-live="polite" className="resident-notification-list">
          {notifications.map((notification) => (
            <article className="resident-notification" key={notification.id}>
              <span className="resident-card-icon"><Icon name="news" /></span>
              <div><strong>{notification.title}</strong><p>{notification.description}</p><time>{displayDate(notification.date)}</time><span className="request-demo-badge">DÉMO</span></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
