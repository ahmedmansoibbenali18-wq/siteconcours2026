import { useMemo } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import Icon from './Icon.jsx';
import Loading from './Loading.jsx';

const levels = {
  information: ['information', 'info'],
  attention: ['attention', 'warning', 'avertissement'],
  urgent: ['urgent'],
  critical: ['critique', 'critical', 'criticality'],
};

function normalizeLevel(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.toLocaleLowerCase('fr').trim();
  return Object.entries(levels).find(([, aliases]) => aliases.includes(normalized))?.[0] ?? null;
}

function getField(item, names) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return undefined;
  const entry = Object.entries(item).find(([key]) => names.includes(key.toLocaleLowerCase('fr')));
  return entry?.[1];
}

function getAlertKey(alert, index) {
  const id = getField(alert, ['id', 'uuid', 'identifier', 'identifiant']);
  if (id != null) return String(id);
  try {
    return JSON.stringify(alert) ?? String(index);
  } catch {
    return String(index);
  }
}

function displayDate(value) {
  if (typeof value !== 'string') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AlertCenter({ state, onRetry, readAlerts, setReadAlerts }) {
  const alerts = useMemo(() => {
    if (state.status !== 'success' || state.data == null) return [];
    return Array.isArray(state.data) ? state.data : [state.data];
  }, [state.data, state.status]);
  const unreadCount = alerts.reduce((count, alert, index) => (
    count + (readAlerts.has(getAlertKey(alert, index)) ? 0 : 1)
  ), 0);

  function toggleRead(key) {
    setReadAlerts((current) => {
      const updated = new Set(current);
      if (updated.has(key)) updated.delete(key);
      else updated.add(key);
      return updated;
    });
  }

  function markAllRead() {
    setReadAlerts((current) => new Set([
      ...current,
      ...alerts.map((alert, index) => getAlertKey(alert, index)),
    ]));
  }

  return (
    <section aria-labelledby="alerts-title" className="resident-card alert-center">
      <div className="resident-card-heading">
        <span className="resident-card-icon"><Icon name="alert" /></span>
        <div><span className="section-index">INFORMATIONS OFFICIELLES</span><h2 id="alerts-title">Centre d’alertes</h2></div>
        <span aria-label={`${unreadCount} alerte${unreadCount === 1 ? '' : 's'} non lue${unreadCount === 1 ? '' : 's'}`} className="alert-count">
          {unreadCount} non lue{unreadCount === 1 ? '' : 's'}
        </span>
      </div>
      {state.status === 'loading' || state.status === 'idle' ? <Loading /> : null}
      {state.status === 'unavailable' && (
        <p className="resident-empty">Aucune alerte ne sera affichée avant la connexion d’une source officielle.</p>
      )}
      {state.status === 'error' && <ErrorMessage onRetry={onRetry}>{state.error}</ErrorMessage>}
      {state.status === 'success' && alerts.length === 0 && <p className="resident-empty">Aucune alerte publiée par la source.</p>}
      {alerts.length > 0 && (
        <>
          <button className="text-button alert-mark-all" disabled={unreadCount === 0} onClick={markAllRead} type="button">
            Tout marquer comme lu
          </button>
          <div className="alert-list" aria-live="polite">
            {alerts.map((alert, index) => {
              const rawLevel = getField(alert, ['level', 'severity', 'niveau', 'priority', 'priorite', 'priorité']);
              const level = normalizeLevel(rawLevel);
              const title = getField(alert, ['title', 'name', 'titre']) ?? 'Alerte de la source officielle';
              const description = getField(alert, ['description', 'message', 'details', 'detail']);
              const sector = getField(alert, ['sector', 'area', 'secteur', 'quartier']);
              const date = getField(alert, ['date', 'createdat', 'created_at', 'updatedat', 'updated_at']);
              const alertKey = getAlertKey(alert, index);
              const isRead = readAlerts.has(alertKey);
              return (
                <article className={`alert-item${level ? ` alert-item--${level}` : ' alert-item--unknown'}${isRead ? ' alert-item--read' : ''}`} key={alertKey}>
                  <div className="alert-item-top">
                    <span className="alert-level">{level ? level.toUpperCase() : 'NIVEAU NON PRÉCISÉ PAR LA SOURCE'}</span>
                    <button aria-pressed={isRead} className="alert-read-button" onClick={() => toggleRead(alertKey)} type="button">
                      {isRead ? 'Marquer comme non lue' : 'Marquer comme lue'}
                    </button>
                  </div>
                  <h3>{typeof title === 'string' ? title : JSON.stringify(title)}</h3>
                  {description != null && <p>{typeof description === 'string' ? description : JSON.stringify(description)}</p>}
                  <div className="alert-meta">
                    {sector != null && <span>Secteur : {String(sector)}</span>}
                    {date != null && <time>{displayDate(String(date))}</time>}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
