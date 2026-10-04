import Icon from './Icon.jsx';

export default function ErrorMessage({ children, onRetry }) {
  return (
    <div className="resource-message resource-message--error" role="alert">
      <span className="message-symbol"><Icon name="alert" size={19} /></span>
      <div>
        <strong>Impossible de charger ces données</strong>
        <p>{children}</p>
        {onRetry && (
          <button className="text-button" onClick={onRetry} type="button">
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
