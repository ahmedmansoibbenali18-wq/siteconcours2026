import ErrorMessage from './ErrorMessage.jsx';
import Icon from './Icon.jsx';
import Loading from './Loading.jsx';

const fieldGroups = [
  { label: 'Température', keys: ['temperature', 'temp', 'temperature_c', 'température'] },
  { label: 'Conditions', keys: ['conditions', 'condition', 'weather', 'météo'] },
  { label: 'Vent', keys: ['wind', 'windspeed', 'wind_speed', 'vent'] },
  { label: 'Humidité', keys: ['humidity', 'humiditypercent', 'humidite', 'humidité'] },
  { label: 'Prévisions', keys: ['forecast', 'forecasts', 'previsions', 'prévisions'] },
  { label: 'Dernière mise à jour', keys: ['updatedat', 'updated_at', 'lastupdated', 'mise_a_jour', 'mise à jour'] },
];

function findValue(data, keys) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const entry = Object.entries(data).find(([key]) => keys.includes(key.toLocaleLowerCase('fr')));
  return entry?.[1];
}

function renderValue(value) {
  if (value == null) return '—';
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function WeatherCard({ state, onRetry }) {
  return (
    <section aria-labelledby="weather-title" className="resident-card">
      <div className="resident-card-heading">
        <span className="resident-card-icon"><Icon name="globe" /></span>
        <div><span className="section-index">CONDITIONS LOCALES</span><h2 id="weather-title">Météo</h2></div>
      </div>
      {state.status === 'loading' || state.status === 'idle' ? <Loading /> : null}
      {state.status === 'unavailable' && (
        <p className="resident-empty">Aucune source météo officielle n’est configurée.</p>
      )}
      {state.status === 'error' && <ErrorMessage onRetry={onRetry}>{state.error}</ErrorMessage>}
      {state.status === 'success' && state.data == null && <p className="resident-empty">Aucune donnée météo disponible.</p>}
      {state.status === 'success' && state.data != null && (() => {
        const entries = fieldGroups
          .map(({ label, keys }) => [label, findValue(state.data, keys)])
          .filter(([, value]) => value !== undefined);
        return entries.length > 0 ? (
          <dl className="resident-data-list">
            {entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{renderValue(value)}</dd></div>)}
          </dl>
        ) : (
          <div className="resident-source-data">
            <p>Source connectée. Son format ne fournit pas encore de champs météo reconnus.</p>
            <pre>{JSON.stringify(state.data, null, 2)}</pre>
          </div>
        );
      })()}
    </section>
  );
}
