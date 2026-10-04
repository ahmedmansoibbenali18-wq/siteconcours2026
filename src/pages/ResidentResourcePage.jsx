import AlertCenter from '../components/AlertCenter.jsx';
import WaterStatus from '../components/WaterStatus.jsx';
import WeatherCard from '../components/WeatherCard.jsx';

const pageContent = {
  alerts: {
    eyebrow: 'ESPACE HABITANT / ALERTES',
    title: 'Alertes de Terra Nova',
    description: 'Les alertes ne seront affichées qu’à partir d’une source officielle configurée.',
  },
  weather: {
    eyebrow: 'ESPACE HABITANT / MÉTÉO',
    title: 'Météo de Terra Nova',
    description: 'Les conditions, prévisions et mises à jour nécessitent une source météo officielle.',
  },
  water: {
    eyebrow: 'ESPACE HABITANT / EAU',
    title: 'Distribution d’eau',
    description: 'Les informations de distribution et de réserve nécessitent une source officielle.',
  },
};

export default function ResidentResourcePage({ resourceId, state, onRetry, readAlerts, setReadAlerts }) {
  const page = pageContent[resourceId];
  return (
    <section aria-labelledby="resident-resource-title" className="resident-page">
      <div className="resident-page-heading">
        <span className="section-index">{page.eyebrow}</span>
        <h1 id="resident-resource-title">{page.title}</h1>
        <p>{page.description}</p>
      </div>
      {resourceId === 'alerts' && <AlertCenter onRetry={onRetry} readAlerts={readAlerts} setReadAlerts={setReadAlerts} state={state} />}
      {resourceId === 'weather' && <WeatherCard onRetry={onRetry} state={state} />}
      {resourceId === 'water' && <WaterStatus onRetry={onRetry} state={state} />}
    </section>
  );
}
