import Icon from '../components/Icon.jsx';

export default function ReportPage() {
  return (
    <section aria-labelledby="report-page-title" className="data-page report-page">
      <div className="page-intro">
        <span className="section-index">ESPACE CITOYEN / SIGNALEMENT</span>
        <h1 id="report-page-title">Faire un signalement.</h1>
        <p>Décrivez un problème observé dans votre quartier pour le transmettre aux services compétents.</p>
      </div>
      <div className="report-form-panel">
        <div className="report-form-heading">
          <span className="tile-icon"><Icon name="alert" size={20} /></span>
          <div>
            <h2>Votre signalement</h2>
            <p>Les champs du formulaire sont préparatoires ; aucune information n’est envoyée.</p>
          </div>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="form-field" htmlFor="report-title-input">
            Sujet du signalement
            <input id="report-title-input" name="title" placeholder="Ex. équipement endommagé" required />
          </label>
          <label className="form-field" htmlFor="report-description-input">
            Description
            <textarea id="report-description-input" name="description" placeholder="Décrivez la situation et son emplacement…" required rows="5" />
          </label>
          <label className="form-field" htmlFor="report-location-input">
            Emplacement <span className="optional-label">FACULTATIF</span>
            <input id="report-location-input" name="location" placeholder="Quartier, secteur ou repère" />
          </label>
          <div className="form-notice" role="status">
            <Icon name="globe" size={18} />
            <p>Le contrat officiel de signalement n’est pas fourni. Le formulaire restera désactivé jusqu’à réception de la route et du format de données requis.</p>
          </div>
          <button className="primary-button form-submit" disabled type="button">
            Envoi indisponible <Icon name="arrow" size={17} />
          </button>
        </form>
      </div>
    </section>
  );
}
