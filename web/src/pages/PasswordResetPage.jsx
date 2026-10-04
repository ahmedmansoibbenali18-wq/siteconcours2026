import { useState } from 'react';

export default function PasswordResetPage({ navigateTo }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section aria-labelledby="password-reset-title" className="login-page">
      <div className="login-card">
        <span className="section-index">COMPTE HABITANT</span>
        <h1 id="password-reset-title">Mot de passe oublié ?</h1>
        <div className="form-notice login-unavailable" role="status">
          <p><strong>Service indisponible.</strong> Terra Nova ne dispose pas encore d’API d’authentification ou de réinitialisation. Aucun e-mail ne sera envoyé.</p>
        </div>
        {submitted && <p className="login-error" role="status">La réinitialisation ne peut pas être effectuée tant que le service officiel n’est pas connecté.</p>}
        <form className="login-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label className="form-field" htmlFor="reset-email">Adresse e-mail
            <input autoComplete="email" id="reset-email" required type="email" />
          </label>
          <button className="primary-button login-submit" type="submit">Vérifier la disponibilité</button>
        </form>
        <button className="text-button login-preview" onClick={() => navigateTo('login')} type="button">Retour à la connexion</button>
      </div>
    </section>
  );
}
