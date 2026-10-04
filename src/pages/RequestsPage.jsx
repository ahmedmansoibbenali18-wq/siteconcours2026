import { useEffect, useMemo, useRef, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Icon from '../components/Icon.jsx';
import Loading from '../components/Loading.jsx';
import { createDemoRequest, requestCategories } from '../services/requests.js';

const blankForm = {
  category: '',
  title: '',
  description: '',
  sector: '',
  urgency: 'normal',
  contact: '',
};

const fieldNames = {
  id: ['id', 'requestid', 'request_id', 'reference', 'numero', 'numéro'],
  title: ['title', 'subject', 'titre', 'objet'],
  category: ['category', 'type', 'categorie', 'catégorie'],
  description: ['description', 'details', 'detail', 'détails'],
  status: ['status', 'state', 'statut', 'etat', 'état'],
  created: ['createdat', 'created_at', 'date', 'submittedat', 'submitted_at'],
  updated: ['updatedat', 'updated_at', 'lastupdated', 'last_updated', 'date_mise_a_jour'],
  response: ['response', 'reply', 'answer', 'reponse', 'réponse', 'lastresponse', 'last_response'],
  messages: ['messages', 'conversation', 'thread', 'exchanges'],
  sector: ['sector', 'area', 'quartier', 'secteur'],
  urgency: ['urgency', 'priority', 'urgence', 'priorite', 'priorité'],
  unread: ['hasnewresponse', 'has_new_response', 'unread', 'unreadresponse', 'unread_response', 'newresponse', 'new_response'],
};

function getField(item, field) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return undefined;
  const names = fieldNames[field];
  const result = Object.entries(item).find(([key]) => names.includes(key.toLocaleLowerCase('fr')));
  return result?.[1];
}

function asText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const text = value.text ?? value.message ?? value.content ?? value.body;
    return typeof text === 'string' ? text : JSON.stringify(value);
  }
  return '';
}

function parseDate(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date)
    : asText(value);
}

function normalizedStatus(value) {
  if (typeof value !== 'string') return { label: asText(value) || 'Statut non précisé', style: 'unknown' };
  const normalized = value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const known = {
    recue: ['recue', 'recu', 'received', 'new'],
    progress: ['en cours', 'in progress', 'processing'],
    waiting: ['en attente', 'waiting', 'pending'],
    resolved: ['resolue', 'resolu', 'resolved'],
    closed: ['fermee', 'ferme', 'closed'],
  };
  const entry = Object.entries(known).find(([, aliases]) => aliases.includes(normalized));
  const labels = { recue: 'Reçue', progress: 'En cours', waiting: 'En attente', resolved: 'Résolue', closed: 'Fermée' };
  return entry
    ? { label: labels[entry[0]], style: entry[0] }
    : { label: value, style: 'unknown' };
}

function createConversation(item) {
  const messages = getField(item, 'messages');
  if (!Array.isArray(messages)) return [];
  return messages.flatMap((message, index) => {
    const text = asText(message);
    if (!text) return [];
    const speakerValue = message?.speaker ?? message?.author ?? message?.sender ?? message?.role;
    const speaker = typeof speakerValue === 'string' ? speakerValue.toLocaleLowerCase('fr') : '';
    const isResident = ['resident', 'inhabitant', 'user', 'citizen', 'habitant'].includes(speaker);
    return [{ key: String(message?.id ?? index), speaker: isResident ? 'Vous' : 'Terra Nova', text }];
  });
}

function getRequestKey(item) {
  if (getField(item, 'id') != null) return String(getField(item, 'id'));
  if (item.demoKey) return String(item.demoKey);
  return JSON.stringify(item);
}

function hasReply(item) {
  return Boolean(asText(getField(item, 'response')) || createConversation(item).length > 0);
}

function isNewReply(item) {
  const value = getField(item, 'unread');
  return value === true || value === 1 || value === 'true';
}

function displayUrgency(value) {
  const normalized = value.toLocaleLowerCase('fr');
  return {
    low: 'Faible',
    faible: 'Faible',
    normal: 'Normal',
    medium: 'Moyenne',
    high: 'Élevé',
    eleve: 'Élevé',
    urgent: 'Urgent',
    critical: 'Critique',
    critique: 'Critique',
  }[normalized] ?? value;
}

function RequestCard({ request, onRead, isReplyRead, onOpen }) {
  const title = asText(getField(request, 'title')) || 'Demande sans titre';
  const category = asText(getField(request, 'category'));
  const statusValue = getField(request, 'status');
  const status = request.isDemo
    ? { label: 'Simulation locale', style: 'demo' }
    : normalizedStatus(statusValue);
  const createdAt = getField(request, 'created');
  const updatedAt = getField(request, 'updated');
  const urgency = asText(getField(request, 'urgency'));
  const response = getField(request, 'response');
  const conversation = createConversation(request);
  const newReply = !request.isDemo && isNewReply(request) && !isReplyRead;
  const requestKey = getRequestKey(request);

  return (
    <article className={`request-card${newReply ? ' request-card--new-reply' : ''}`}>
      <div className="request-card-heading">
        <div>
          <div className="request-badges">
            {request.isDemo && <span className="request-demo-badge">DÉMO · NON TRANSMISE</span>}
            {!request.isDemo && (hasReply(request) || isNewReply(request)) && !isReplyRead && (
              <span className="request-new-response-badge">{newReply ? 'Nouvelle réponse' : 'Réponse disponible'}</span>
            )}
            {category && <span className="request-category-badge">{category}</span>}
          </div>
          <h3>{title}</h3>
        </div>
        {getField(request, 'id') != null && <span className="request-number">N° {asText(getField(request, 'id'))}</span>}
      </div>
      {asText(getField(request, 'description')) && <p className="request-description">{asText(getField(request, 'description'))}</p>}
      {urgency && <p className="request-urgency">Urgence : {displayUrgency(urgency)}</p>}
      <div className="request-timeline">
        <div className="request-timeline-item"><span className="timeline-dot" /><span>Demande créée</span><time>{formatDate(createdAt) || 'Date non fournie'}</time></div>
        <div className="request-timeline-item"><span className="timeline-dot timeline-dot--status" /><span>Statut</span><strong className={`request-status request-status--${status.style}`}>{status.label}</strong></div>
        {updatedAt != null && <div className="request-timeline-item"><span className="timeline-dot" /><span>Dernière mise à jour</span><time>{formatDate(updatedAt)}</time></div>}
        {asText(getField(request, 'sector')) && <div className="request-timeline-item"><span className="timeline-dot" /><span>Secteur</span><span>{asText(getField(request, 'sector'))}</span></div>}
      </div>
      {response != null && asText(response) && (
        <section aria-label="Réponse de Terra Nova" className="request-response">
          <span className="request-response-label"><Icon name="news" size={16} /> RÉPONSES DE TERRA NOVA</span>
          <p>{asText(response)}</p>
          {updatedAt != null && <time>Dernière mise à jour : {formatDate(updatedAt)}</time>}
        </section>
      )}
      {conversation.length > 0 && (
        <section aria-label="Conversation autour de la demande" className="request-conversation">
          <h4>Conversation</h4>
          {conversation.map((message) => (
            <article className={`conversation-message${message.speaker === 'Vous' ? ' conversation-message--resident' : ''}`} key={message.key}>
              <strong>{message.speaker}</strong><p>{message.text}</p>
            </article>
          ))}
        </section>
      )}
      {onOpen && request.isDemo && (
        <button className="text-button request-open-detail" onClick={() => onOpen(request.demoKey)} type="button">
          Ouvrir le suivi <Icon name="arrow" size={14} />
        </button>
      )}
      {!request.isDemo && (hasReply(request) || isNewReply(request)) && (
        <button aria-pressed={isReplyRead} className="text-button request-mark-read" onClick={() => onRead(requestKey)} type="button">
          {isReplyRead ? 'Réponse marquée comme lue' : 'Marquer la réponse comme lue'}
        </button>
      )}
      {newReply && <span className="visually-hidden">Nouvelle réponse disponible.</span>}
    </article>
  );
}

function RequestForm({ initialDraft, onCancel, onSubmit }) {
  const [fields, setFields] = useState({ ...blankForm, ...initialDraft });
  const [validationMessage, setValidationMessage] = useState('');

  function updateField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!fields.category || !fields.title.trim() || !fields.description.trim()) {
      setValidationMessage('Choisissez une catégorie et renseignez le titre et la description.');
      return;
    }
    setValidationMessage('');
    onSubmit(fields);
  }

  return (
    <section aria-labelledby="request-form-title" aria-modal="true" className="request-form-panel" role="dialog">
      <div className="request-form-heading">
        <div><span className="section-index">NOUVELLE DEMANDE · MODE DÉMONSTRATION</span><h2 id="request-form-title">Décrivez votre besoin</h2></div>
        <button aria-label="Fermer le formulaire" className="nova-close" onClick={onCancel} type="button"><Icon name="close" /></button>
      </div>
      <p className="request-demo-notice" role="note">Aucune API officielle d’envoi n’est configurée. La demande sera simulée uniquement dans cette session, sans être transmise ni enregistrée sur Terra Nova.</p>
      <form className="request-form" onSubmit={submit}>
        <label className="form-field" htmlFor="request-category">Catégorie
          <select id="request-category" name="category" onChange={updateField} required value={fields.category}>
            <option disabled value="">Choisir une catégorie</option>
            {requestCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="form-field" htmlFor="request-title">Titre de la demande
          <input id="request-title" maxLength="120" name="title" onChange={updateField} required value={fields.title} />
        </label>
        <label className="form-field request-form-wide" htmlFor="request-description">Description
          <textarea id="request-description" maxLength="2000" name="description" onChange={updateField} required rows="5" value={fields.description} />
        </label>
        <label className="form-field" htmlFor="request-sector">Secteur / quartier <span className="optional-label">FACULTATIF</span>
          <input autoComplete="address-level3" id="request-sector" maxLength="100" name="sector" onChange={updateField} value={fields.sector} />
        </label>
        <label className="form-field" htmlFor="request-urgency">Niveau d’urgence
          <select id="request-urgency" name="urgency" onChange={updateField} value={fields.urgency}>
            <option value="low">Faible</option>
            <option value="normal">Normal</option>
            <option value="high">Élevé</option>
            <option value="critical">Critique</option>
          </select>
        </label>
        <label className="form-field request-form-wide" htmlFor="request-contact">Moyen de contact <span className="optional-label">FACULTATIF</span>
          <input autoComplete="email" id="request-contact" maxLength="160" name="contact" onChange={updateField} type="text" value={fields.contact} />
        </label>
        {validationMessage && <p className="request-validation" role="alert">{validationMessage}</p>}
        <div className="request-form-actions request-form-wide">
          <button className="text-button" onClick={onCancel} type="button">Annuler</button>
          <button className="primary-button" type="submit">Envoyer ma demande <Icon name="arrow" size={16} /></button>
        </div>
      </form>
    </section>
  );
}

export default function RequestsPage({
  state,
  onRetry,
  initialDraft,
  clearDraft,
  demoRequests,
  onCreateDemoRequest,
  onOpenRequest,
  privateMode = false,
}) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [readReplyKeys, setReadReplyKeys] = useState(() => new Set());
  const formRef = useRef(null);
  const modalOpenerRef = useRef(null);
  const allRequests = demoRequests;
  const unreadReplyCount = allRequests.reduce((count, request) => {
    const key = getRequestKey(request);
    return count + (!request.isDemo && (hasReply(request) || isNewReply(request)) && !readReplyKeys.has(key) ? 1 : 0);
  }, 0);

  useEffect(() => {
    if (!initialDraft) return;
    setShowForm(true);
    setSuccessMessage('');
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, [initialDraft]);

  useEffect(() => {
    if (!showForm) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setShowForm(false);
        clearDraft();
      }
      if (event.key === 'Tab') {
        const focusable = formRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.setTimeout(() => formRef.current?.querySelector('#request-category')?.focus(), 0);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      if (modalOpenerRef.current instanceof HTMLElement && modalOpenerRef.current.isConnected) {
        modalOpenerRef.current.focus();
      }
    };
  }, [clearDraft, showForm]);

  const filteredRequests = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('fr');
    return allRequests
      .filter((request) => {
        const status = request.isDemo ? 'Simulation locale' : normalizedStatus(getField(request, 'status')).label;
        const category = asText(getField(request, 'category'));
        const searchable = [
          getField(request, 'title'),
          getField(request, 'description'),
          category,
          getField(request, 'response'),
          getField(request, 'sector'),
        ].map(asText).join(' ').toLocaleLowerCase('fr');
        return (!needle || searchable.includes(needle))
          && (!statusFilter || status === statusFilter)
          && (!categoryFilter || category === categoryFilter);
      })
      .sort((left, right) => {
        const leftDate = parseDate(getField(left, 'created'))?.getTime() ?? 0;
        const rightDate = parseDate(getField(right, 'created'))?.getTime() ?? 0;
        return sortOrder === 'newest' ? rightDate - leftDate : leftDate - rightDate;
      });
  }, [allRequests, categoryFilter, search, sortOrder, statusFilter]);

  const statusOptions = useMemo(() => [...new Set(allRequests.map((request) => (
    request.isDemo ? 'Simulation locale' : normalizedStatus(getField(request, 'status')).label
  )).filter(Boolean))], [allRequests]);
  const categoryOptions = useMemo(() => [...new Set(allRequests.map((request) => asText(getField(request, 'category'))).filter(Boolean))], [allRequests]);

  function openForm() {
    modalOpenerRef.current = document.activeElement;
    setSuccessMessage('');
    setShowForm(true);
  }

  function markReplyRead(key) {
    setReadReplyKeys((current) => current.has(key) ? current : new Set([...current, key]));
  }

  function markAllRepliesRead() {
    setReadReplyKeys((current) => new Set([
      ...current,
      ...allRequests.filter((request) => !request.isDemo && (hasReply(request) || isNewReply(request))).map((request) => getRequestKey(request)),
    ]));
  }

  function submitDemoRequest(fields) {
    setSending(true);
    setSuccessMessage('');
    window.setTimeout(() => {
      onCreateDemoRequest(fields);
      setSending(false);
      setShowForm(false);
      clearDraft();
      setSuccessMessage('Simulation terminée : votre demande n’a pas été transmise à Terra Nova.');
    }, 500);
  }

  return (
    <section aria-labelledby="requests-title" className="requests-page">
      <header className="requests-hero">
        <div className="requests-hero-copy">
            <span className="section-index">{privateMode ? 'MON ESPACE / SUIVI PERSONNEL' : 'CENTRE DES DEMANDES'}</span>
            <h1 id="requests-title">{privateMode ? 'Mes demandes' : 'Demandes habitantes'}</h1>
          <p>Exprimez votre besoin. Terra Nova vous répond.</p>
          <p className="requests-hero-detail">Décrivez votre situation et recevez une réponse de Terra Nova.</p>
          <button className="primary-button requests-primary" onClick={openForm} type="button">+ Faire une demande</button>
        </div>
        <div aria-hidden="true" className="requests-hero-orbit"><span /><i /></div>
      </header>

      <div className="requests-demo-banner" role="status">
        <Icon name="globe" size={18} />
        <p><strong>Mode démonstration.</strong> Aucune API officielle de demandes n’est documentée. Les demandes créées ici restent en mémoire le temps de cette session et ne sont pas transmises à Terra Nova.</p>
      </div>

      {successMessage && <p className="request-success" role="status"><Icon name="pulse" size={17} />{successMessage}</p>}

      <section aria-labelledby="my-requests-title" className="requests-section">
        <div className="requests-section-heading">
          <div><span className="section-index">SUIVI PERSONNEL · MODE DÉMO</span><h2 id="my-requests-title">Mes demandes</h2></div>
          {unreadReplyCount > 0 && (
            <button aria-label="Marquer toutes les réponses disponibles comme lues" className="request-notification" onClick={markAllRepliesRead} type="button">
              {unreadReplyCount} réponse{unreadReplyCount === 1 ? '' : 's'} disponible{unreadReplyCount === 1 ? '' : 's'}
            </button>
          )}
        </div>
        <p className="requests-section-intro">{privateMode ? 'Vos demandes de démonstration sont visibles uniquement pendant cette session. Les demandes officielles apparaîtront lorsque leur API sera configurée.' : 'Les demandes présentées ici sont des données de démonstration.'}</p>

        <div className="request-filters">
          <label className="search-field">
            <Icon name="search" size={18} />
            <span className="visually-hidden">Rechercher dans mes demandes</span>
            <input onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans mes demandes…" type="search" value={search} />
          </label>
          <label className="request-filter-field"><span>Statut</span>
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">Tous les statuts</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="request-filter-field"><span>Catégorie</span>
            <select onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
              <option value="">Toutes les catégories</option>
              {[...new Set([...requestCategories, ...categoryOptions])].map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="request-filter-field"><span>Trier par date</span>
            <select onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}>
              <option value="newest">Plus récentes</option><option value="oldest">Plus anciennes</option>
            </select>
          </label>
        </div>

        {(state.status === 'loading' || state.status === 'idle') && demoRequests.length === 0 && <Loading />}
        {state.status === 'error' && <ErrorMessage onRetry={onRetry}>{state.error}</ErrorMessage>}
        {state.status === 'unavailable' && (
          <p className="requests-empty-source">La source officielle n’est pas configurée. Vous pouvez essayer le formulaire en mode démonstration.</p>
        )}
        {state.status === 'success' && (
          <p className="requests-empty-source">La source répond, mais aucun compte habitant n’est authentifié. Ses enregistrements ne sont pas affichés comme vos demandes personnelles.</p>
        )}
        {filteredRequests.length === 0 && allRequests.length > 0 && <p className="requests-empty-source">Aucune demande ne correspond à ces filtres.</p>}
        <div aria-live="polite" className="request-list">
          {filteredRequests.map((request) => {
            const key = getRequestKey(request);
            return (
              <RequestCard
                isReplyRead={readReplyKeys.has(key)}
                key={key}
                onRead={markReplyRead}
                onOpen={onOpenRequest}
                request={request}
              />
            );
          })}
        </div>
      </section>

      <section aria-labelledby="terra-nova-replies-title" className="replies-section">
        <span className="section-index">ESPACE DE RÉPONSE</span>
        <h2 id="terra-nova-replies-title">Réponses de Terra Nova</h2>
        <p>Les réponses et conversations seront affichées ici uniquement si la source officielle les fournit.</p>
        {allRequests.filter(hasReply).length === 0
          ? <p className="requests-empty-source">Aucune réponse officielle disponible pour le moment. Aucune réponse de démonstration n’est inventée.</p>
          : allRequests
            .filter(hasReply)
            .map((request) => (
              <article className="request-response-summary" key={getRequestKey(request)}>
                <span className="request-response-label"><Icon name="news" size={16} /> {asText(getField(request, 'title')) || 'Réponse à une demande'}</span>
                {getField(request, 'response') != null && <p>{asText(getField(request, 'response'))}</p>}
                {createConversation(request).map((message) => (
                  <div className={`conversation-message${message.speaker === 'Vous' ? ' conversation-message--resident' : ''}`} key={message.key}>
                    <strong>{message.speaker}</strong><p>{message.text}</p>
                  </div>
                ))}
              </article>
            ))}
      </section>

      {showForm && (
        <div className="request-modal-backdrop">
          <div className="request-modal-scroll" ref={formRef}>
            <RequestForm
              initialDraft={initialDraft}
              onCancel={() => { setShowForm(false); clearDraft(); }}
              onSubmit={submitDemoRequest}
            />
            {sending && <div aria-live="assertive" className="request-sending" role="status">Envoi de votre demande… Simulation locale en cours.</div>}
          </div>
        </div>
      )}
    </section>
  );
}
