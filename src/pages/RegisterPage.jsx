import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { DemoAuthenticationError, registerDemoResident } from '../services/auth.js';

export default function RegisterPage({ navigateTo, onAuthenticated }) {
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    sector: '',
    password: '',
    confirmation: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    setMessage('');
    if (fields.password.length < 8) {
      setMessage('Pour tester le formulaire, le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (fields.password !== fields.confirmation) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const resident = registerDemoResident(fields);
      onAuthenticated(resident);
    } catch (error) {
      setMessage(error instanceof DemoAuthenticationError
        ? error.message
        : 'Impossible de créer cette identité de démonstration.');
    } finally {
      setLoading(false);
      setFields((current) => ({ ...current, password: '', confirmation: '' }));
    }
  }

  return (
    <section aria-labelledby="register-title" className="login-page">
      <div className="login-card">
        <span className="section-index">ESPACE HABITANT / DÉMONSTRATION</span>
        <h1 id="register-title">Créer une identité de démonstration</h1>
        <div className="form-notice login-unavailable" role="note">
          <Icon name="globe" size={18} />
          <p><strong>Pas de compte réel.</strong> Votre profil reste uniquement en mémoire jusqu’au rechargement de la page. Les mots de passe sont vérifiés dans ce formulaire puis immédiatement oubliés : ils ne sont pas transmis, stockés ou utilisés pour authentifier.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label className="form-field" htmlFor="register-first-name">Prénom
            <input autoComplete="given-name" id="register-first-name" maxLength="80" name="firstName" onChange={updateField} required value={fields.firstName} />
          </label>
          <label className="form-field" htmlFor="register-last-name">Nom
            <input autoComplete="family-name" id="register-last-name" maxLength="80" name="lastName" onChange={updateField} required value={fields.lastName} />
          </label>
          <label className="form-field" htmlFor="register-email">E-mail
            <input autoComplete="email" id="register-email" maxLength="254" name="email" onChange={updateField} required type="email" value={fields.email} />
          </label>
          <label className="form-field" htmlFor="register-sector">Secteur / quartier <span className="optional-label">FACULTATIF</span>
            <input autoComplete="address-level3" id="register-sector" maxLength="100" name="sector" onChange={updateField} value={fields.sector} />
          </label>
          <label className="form-field" htmlFor="register-password">Mot de passe de test (non conservé)
            <input autoComplete="new-password" id="register-password" minLength="8" name="password" onChange={updateField} required type="password" value={fields.password} />
          </label>
          <label className="form-field" htmlFor="register-confirmation">Confirmer le mot de passe
            <input autoComplete="new-password" id="register-confirmation" minLength="8" name="confirmation" onChange={updateField} required type="password" value={fields.confirmation} />
          </label>
          {message && <p className="login-error" role="alert">{message}</p>}
          <button className="primary-button login-submit" disabled={loading} type="submit">
            {loading ? 'Préparation…' : 'Créer le profil de démonstration'}
          </button>
        </form>
        <button className="text-button login-preview" onClick={() => navigateTo('login')} type="button">
          J’ai déjà une identité de démonstration <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  );
}
