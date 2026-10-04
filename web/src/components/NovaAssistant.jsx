import { useRef, useState } from 'react';
import Icon from './Icon.jsx';

const suggestedQuestions = [
  'Quelle est la météo aujourd’hui ?',
  'Y a-t-il une alerte dans mon secteur ?',
  'Quand aura lieu la prochaine distribution d’eau ?',
  'Je veux signaler un problème.',
];

function getDemoReply(question) {
  const text = question.toLocaleLowerCase('fr');
  if ((text.includes('eau') && (text.includes('plus') || text.includes('coup'))) || text.includes('distribution')) {
    return {
      text: 'Je peux vous aider à préparer une demande au sujet de la distribution d’eau. Nova est en mode démonstration : votre texte ne sera pas envoyé.',
      createRequest: {
        category: 'Eau',
        title: 'Problème de distribution d’eau',
        description: question,
      },
    };
  }
  if (text.includes('météo') || text.includes('meteo') || text.includes('temps')) {
    return { text: 'Je ne peux pas consulter la météo pour le moment : aucune source météo officielle n’est connectée.', page: 'weather', action: 'Ouvrir la météo' };
  }
  if (text.includes('alerte') || text.includes('urgent') || text.includes('secteur')) {
    return { text: 'Aucune source officielle d’alertes n’est connectée. Je ne peux donc pas confirmer s’il existe une alerte dans votre secteur.', page: 'alerts', action: 'Ouvrir les alertes' };
  }
  if (text.includes('eau') || text.includes('distribution')) {
    return { text: 'Les horaires et l’état de distribution seront affichés dès que l’API officielle de Terra Nova sera connectée.', page: 'water', action: 'Ouvrir l’état de l’eau' };
  }
  if (text.includes('signaler') || text.includes('problème') || text.includes('probleme')) {
    return { text: 'Le formulaire de signalement est préparé, mais aucun signalement ne peut être transmis sans l’API officielle.', page: 'report', action: 'Ouvrir les signalements' };
  }
  if (text.includes('service')) {
    return { text: 'Les services disponibles sont consultables dans le portail. Leur liste dépend de la source officielle configurée.', page: 'services', action: 'Consulter les services' };
  }
  if (text.includes('information') || text.includes('actualit')) {
    return { text: 'Les informations de la ville seront affichées lorsqu’une source officielle sera connectée.', page: 'news', action: 'Consulter les actualités' };
  }
  return { text: 'Je suis en mode démonstration : je ne suis reliée ni à une IA ni aux données officielles. Essayez une question sur la météo, les alertes, l’eau, les services ou un signalement.' };
}

export default function NovaAssistant({ navigateTo, onCreateRequest }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const messageId = useRef(0);
  const inputRef = useRef(null);

  function sendQuestion(value = question) {
    const trimmed = value.trim();
    if (!trimmed || thinking) return;
    const id = messageId.current++;
    setMessages((current) => [...current, { id, author: 'Vous', text: trimmed }]);
    setQuestion('');
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: messageId.current++, author: 'Nova — démonstration', ...getDemoReply(trimmed) }]);
      setThinking(false);
      inputRef.current?.focus();
    }, 250);
  }

  function openAssistant() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <>
      {!open && (
        <button aria-label="Ouvrir l’assistant Nova, mode démonstration" className="nova-launcher" onClick={openAssistant} type="button">
          <Icon name="sparkles" size={19} /><span>Nova</span>
        </button>
      )}
      {open && (
        <section aria-label="Assistant Nova en démonstration" aria-modal="false" className="nova-panel" role="dialog">
          <header className="nova-header">
            <span className="resident-card-icon"><Icon name="sparkles" /></span>
            <div><strong>Nova</strong><span>Mode démonstration · sans IA connectée</span></div>
            <button aria-label="Fermer l’assistant Nova" className="nova-close" onClick={() => setOpen(false)} type="button"><Icon name="close" /></button>
          </header>
          <p className="nova-notice">Les échanges restent dans cette session. Aucune IA ni reconnaissance vocale n’est active.</p>
          <div aria-live="polite" className="nova-messages">
            {messages.length === 0 && <p className="nova-welcome">Bonjour, je peux vous orienter vers les rubriques du portail. Les informations nécessitant une API restent indisponibles.</p>}
            {messages.map((message) => (
              <article className={`nova-message${message.author === 'Vous' ? ' nova-message--user' : ''}`} key={message.id}>
                <strong>{message.author}</strong><p>{message.text}</p>
                {message.page && <button className="text-button" onClick={() => { navigateTo(message.page); setOpen(false); }} type="button">{message.action} <Icon name="arrow" size={14} /></button>}
                {message.createRequest && (
                  <button className="text-button" onClick={() => { onCreateRequest(message.createRequest); setOpen(false); }} type="button">
                    Créer cette demande <Icon name="arrow" size={14} />
                  </button>
                )}
              </article>
            ))}
            {thinking && <p className="nova-thinking" role="status">Préparation de la réponse de démonstration…</p>}
          </div>
          {messages.length === 0 && (
            <div className="nova-suggestions">
              {suggestedQuestions.map((suggestion) => (
                <button key={suggestion} onClick={() => sendQuestion(suggestion)} type="button">{suggestion}</button>
              ))}
            </div>
          )}
          <form className="nova-form" onSubmit={(event) => { event.preventDefault(); sendQuestion(); }}>
            <label className="visually-hidden" htmlFor="nova-question">Votre question à Nova</label>
            <input autoComplete="off" id="nova-question" onChange={(event) => setQuestion(event.target.value)} placeholder="Écrivez votre question…" ref={inputRef} value={question} />
            <button aria-label="Envoyer la question" disabled={!question.trim() || thinking} type="submit"><Icon name="arrow" /></button>
            <button aria-label="Micro indisponible : reconnaissance vocale non configurée" className="nova-microphone" disabled title="Reconnaissance vocale non configurée" type="button"><span aria-hidden="true">●</span></button>
          </form>
        </section>
      )}
    </>
  );
}
