import Icon from './Icon.jsx';

export default function Topbar({ currentPage, apiConfigured, demoSession, mobileNavOpen, setMobileNavOpen }) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="topbar">
      <button
        aria-controls="primary-navigation"
        aria-expanded={mobileNavOpen}
        aria-label={mobileNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="mobile-menu-button"
        onClick={() => setMobileNavOpen((open) => !open)}
        type="button"
      >
        <Icon name={mobileNavOpen ? 'close' : 'menu'} />
      </button>
      <div className="breadcrumb"><span>TERRA NOVA</span><span className="breadcrumb-slash">/</span><strong>{currentPage.label}</strong></div>
      <div className="topbar-right">
        <span className={`connection-pill${demoSession ? ' connection-pill--demo' : apiConfigured ? ' connection-pill--configured' : ''}`}>
          <i />{demoSession ? 'Session démo' : apiConfigured ? 'API configurée' : 'API à configurer'}
        </span>
        <span className="topbar-date">{date}</span>
      </div>
    </header>
  );
}
