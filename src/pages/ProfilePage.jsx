import { useState } from 'react';
import Icon from '../components/Icon.jsx';

export default function ProfilePage({ resident, onUpdateProfile, navigateTo }) {
  const [firstName, setFirstName] = useState(resident?.firstName ?? '');
  const [lastName, setLastName] = useState(resident?.lastName ?? '');
  const [email, setEmail] = useState(resident?.email ?? '');
  const [sector, setSector] = useState(resident?.sector ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setSaved(false);
    setError('');
    try {
      const updated = onUpdateProfile({ firstName, lastName, email, sector });
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setEmail(updated.email);
      setSector(updated.sector);
      setSaved(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Le profil ne peut pas être mis à jour.');
    }
  }

  return (
    <section aria-labelledby="profile-title" className="resident-page">
      <div className="resident-page-heading">
        <span className="section-index">MON ESPACE / PROFIL · DÉMONSTRATION</span>
        <h1 id="profile-title">Mon profil</h1>
        <p>Ces informations ne sont conservées que dans la mémoire de cette session de démonstration.</p>
      </div>
      <div className="preview-banner" role="note">
        <Icon name="globe" size={18} />
        <p><strong>Profil non sécurisé.</strong> Aucun service officiel ne vérifie ni ne stocke ces informations. N’utilisez pas de données personnelles réelles.</p>
      </div>
      <section className="resident-card">
        <form className="profile-edit-form" onSubmit={submit}>
          <label className="form-field" htmlFor="profile-first-name">Prénom
            <input autoComplete="given-name" id="profile-first-name" maxLength="80" onChange={(event) => setFirstName(event.target.value)} required value={firstName} />
          </label>
          <label className="form-field" htmlFor="profile-last-name">Nom
            <input autoComplete="family-name" id="profile-last-name" maxLength="80" onChange={(event) => setLastName(event.target.value)} required value={lastName} />
          </label>
          <label className="form-field" htmlFor="profile-email">E-mail de démonstration
            <input autoComplete="email" id="profile-email" maxLength="254" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label className="form-field" htmlFor="profile-sector">Secteur / quartier
            <input autoComplete="address-level3" id="profile-sector" maxLength="100" onChange={(event) => setSector(event.target.value)} value={sector} />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          {saved && <p className="request-success" role="status">Profil de démonstration mis à jour.</p>}
          <button className="primary-button" type="submit">Enregistrer dans cette session</button>
        </form>
      </section>
      <button className="text-button" onClick={() => navigateTo('notifications')} type="button">Préférences et notifications <Icon name="arrow" size={14} /></button>
    </section>
  );
}
