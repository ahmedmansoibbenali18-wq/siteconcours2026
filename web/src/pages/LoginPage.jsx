import { useState } from 'react';
import mark from '../assets/terra-nova-mark.svg';
import Icon from '../components/Icon.jsx';
import { DemoAuthenticationError, loginDemoResident } from '../services/auth.js';

export default function LoginPage({ navigateTo, onAuthenticated }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const form = event.currentTarget;
    const identifierValue = new FormData(form).get('identifier');
    try {
      onAuthenticated(loginDemoResident(String(identifierValue ?? identifier)));
    } catch (error) {
      setMessage(error instanceof DemoAuthenticationError
        ? error.message
        : 'Impossible d’ouvrir la session de démonstration.');
    } finally {
      setLoading(false);
      form.reset();
      setIdentifier('');
    }
  }

  return (
    <section aria-labelledby="login-title" className="login-page">
      <div className="login-card">
        <a aria-label="Terra Nova, accueil" className="login-brand" href="/" onClick={(event) => { event.preventDefault(); navigateTo('overview'); }}>
          <span className="brand-mark"><img alt="" height="27" src={mark} width="27" /></span>
          <span className="brand-copy"><strong>TERRA NOVA</strong><small>PORTAIL CITOYEN</small></span>
        </a>
        <span className="section-index">ESPACE PERSONNEL</span>
        <h1 id="login-title">Connexion habitant</h1>
        <p className="login-description">Ouvrez une session de démonstration de votre espace personnel.</p>
        <div className="form-notice login-unavailable" role="status">
          <Icon name="globe" size={18} />
          <p><strong>Mode démonstration uniquement.</strong> Aucune API d’authentification n’est connectée. Le mot de passe n’est ni vérifié ni conservé ; n’utilisez pas de vrai mot de passe. Cette simulation ne protège pas des données réelles.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="resident-identifier">Identifiant ou adresse e-mail
            <input autoComplete="username" id="resident-identifier" name="identifier" onChange={(event) => setIdentifier(event.target.value)} required value={identifier} />
          </label>
          <label className="form-field" htmlFor="resident-password">Mot de passe
            <input autoComplete="current-password" id="resident-password" name="password" required type="password" />
          </label>
          {message && <p className="login-error" role="alert">{message}</p>}
          <button className="primary-button login-submit" disabled={loading} type="submit">
            {loading ? 'Ouverture…' : 'Continuer en mode démonstration'}
          </button>
        </form>
        <div className="login-options">
          <button onClick={() => navigateTo('register')} type="button">Créer une identité de démonstration</button>
          <button onClick={() => navigateTo('password-reset')} type="button">Mot de passe oublié ?</button>
        </div>
        <button className="text-button login-preview" onClick={() => navigateTo('overview')} type="button">
          Retour au portail public <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  );
}
