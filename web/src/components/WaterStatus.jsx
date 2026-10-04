import ErrorMessage from './ErrorMessage.jsx';
import Icon from './Icon.jsx';
import Loading from './Loading.jsx';

const fieldGroups = [
  { label: 'État actuel', keys: ['status', 'state', 'etat', 'état'] },
  { label: 'Secteur', keys: ['sector', 'area', 'quartier', 'secteur'] },
  { label: 'Dernière mise à jour', keys: ['updatedat', 'updated_at', 'lastupdated', 'mise_a_jour', 'mise à jour'] },
  { label: 'Prochaine distribution', keys: ['nextdistribution', 'next_distribution', 'prochaine_distribution', 'prochaine distribution'] },
  { label: 'Réserve disponible', keys: ['reserve', 'level', 'available', 'niveau', 'réserve'] },
];

function findValue(data, keys) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const entry = Object.entries(data).find(([key, value]) => (
    keys.includes(key.toLocaleLowerCase('fr')) && ['string', 'number'].includes(typeof value)
  ));
  return entry?.[1];
}

function toDisplayValue(value) {
  if (typeof value === 'number') return String(value);
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : value;
}

export default function WaterStatus({ state, onRetry }) {
  return (
    <section aria-labelledby="water-title" className="resident-card water-card">
      <div className="resident-card-heading">
        <span className="resident-card-icon"><Icon name="drop" /></span>
        <div><span className="section-index">RESSOURCE VITALE</span><h2 id="water-title">Distribution d’eau</h2></div>
      </div>
      {state.status === 'loading' || state.status === 'idle' ? <Loading /> : null}
      {state.status === 'unavailable' && (
        <p className="resident-empty">Données en attente de connexion à l’API Terra Nova.</p>
      )}
      {state.status === 'error' && <ErrorMessage onRetry={onRetry}>{state.error}</ErrorMessage>}
      {state.status === 'success' && state.data == null && <p className="resident-empty">Aucune donnée disponible.</p>}
      {state.status === 'success' && state.data != null && (() => {
        const currentStatus = findValue(state.data, ['status', 'state', 'etat', 'état']);
        const normalizedStatus = typeof currentStatus === 'string'
          ? currentStatus.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          : '';
        const statusStyle = normalizedStatus.includes('interrompu') ? 'interrupted'
          : normalizedStatus.includes('perturbe') ? 'disturbed'
            : normalizedStatus.includes('normal') ? 'normal' : 'unknown';
        const entries = fieldGroups
          .map(({ label, keys }) => [label, findValue(state.data, keys)])
          .filter(([, value]) => value !== undefined);
        return entries.length > 0 ? (
          <>
            {currentStatus != null && <span className={`water-status-pill water-status-pill--${statusStyle}`}>Distribution {currentStatus}</span>}
            <dl className="resident-data-list">
              {entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{toDisplayValue(value)}</dd></div>)}
            </dl>
          </>
        ) : (
          <div className="resident-source-data">
            <p>Source connectée. Son format ne fournit pas encore de champs d’eau reconnus.</p>
            <pre>{JSON.stringify(state.data, null, 2)}</pre>
          </div>
        );
      })()}
    </section>
  );
}
