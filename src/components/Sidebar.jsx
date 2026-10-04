import { useEffect, useRef } from 'react';
import mark from '../assets/terra-nova-mark.svg';
import { pages } from '../utils/navigation.js';
import Icon from './Icon.jsx';

export default function Sidebar({ activePage, apiConfigured, isAuthenticated, mobileNavOpen, navigateTo, onLogout, setMobileNavOpen }) {
  const navRef = useRef(null);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const previousFocus = document.activeElement;
    navRef.current?.querySelector('button')?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMobileNavOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <>
      <aside className={`sidebar${mobileNavOpen ? ' sidebar--open' : ''}`}>
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigateTo('overview'); }} aria-label="Terra Nova — accueil">
          <span aria-hidden="true" className="brand-mark"><img alt="" height="27" src={mark} width="27" /></span>
          <span className="brand-copy"><strong>TERRA NOVA</strong><small>PORTAIL CITOYEN</small></span>
        </a>
        <div className="sidebar-label">ESPACE CITOYEN</div>
        <nav aria-label="Navigation principale" className="side-nav" id="primary-navigation" ref={navRef}>
          {pages.filter((page) => {
            if (page.group === 'account') return !isAuthenticated && page.id === 'login';
            if (page.group === 'private') return isAuthenticated;
            if (page.group === 'preview') return !isAuthenticated;
            return true;
          }).map((page, index, visiblePages) => (
            <div className="nav-entry" key={page.id}>
              {page.group === 'private' && visiblePages[index - 1]?.group !== 'private' && (
                <span className="sidebar-label sidebar-label--section">MON ESPACE</span>
              )}
              {page.group === 'preview' && visiblePages[index - 1]?.group !== 'preview' && (
                <span className="sidebar-label sidebar-label--section">ESPACE HABITANT · APERÇU</span>
              )}
              {page.group === 'account' && <span className="sidebar-label sidebar-label--section">COMPTE</span>}
              <button
                aria-current={activePage === page.id ? 'page' : undefined}
                className={`nav-item${activePage === page.id ? ' nav-item--active' : ''}`}
                onClick={() => navigateTo(page.id)}
                type="button"
              >
                <Icon name={page.icon} />
                <span>{page.label}</span>
                {page.id === 'report' && <span aria-hidden="true" className="nav-accent" />}
              </button>
            </div>
          ))}
          {isAuthenticated && (
            <button className="nav-item" onClick={onLogout} type="button">
              <Icon name="user" /><span>Déconnexion</span>
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-card">
            <span className="network-icon"><Icon name="pulse" size={17} /></span>
            <div><strong>Réseau citoyen</strong><span className="network-status"><i />{apiConfigured ? 'Source configurée' : 'En attente de connexion'}</span></div>
          </div>
          <div className="sidebar-foot"><span>TN / PORTAIL 01</span><span>V. 1.0</span></div>
        </div>
      </aside>
      {mobileNavOpen && (
        <button
          aria-label="Fermer le menu de navigation"
          className="nav-backdrop"
          onClick={() => setMobileNavOpen(false)}
          type="button"
        />
      )}
    </>
  );
}
