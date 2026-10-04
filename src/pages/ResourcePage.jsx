import { useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import ResourceContent from '../components/ResourceContent.jsx';

export default function ResourcePage({
  resource,
  state,
  query,
  setQuery,
  activeFilter,
  setActiveFilter,
  onRetry,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    function focusSearch(event) {
      const target = event.target;
      if (
        event.key === '/'
        && !(target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)))
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <section aria-labelledby="data-page-title" className="data-page">
      <div className="page-intro">
        <span className="section-index">ESPACE CITOYEN / {resource.id.toUpperCase()}</span>
        <h1 id="data-page-title">{resource.label}</h1>
        <p>Consultez les informations publiées par la plateforme officielle de Terra Nova.</p>
      </div>
      <div className="data-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Rechercher dans {resource.label.toLowerCase()}</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans les données…"
            ref={searchInputRef}
            type="search"
            value={query}
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <span className="data-count">
          {state.status === 'success' && Array.isArray(state.data)
            ? `${state.data.length} ENREGISTREMENT(S)` : 'SOURCE OFFICIELLE'}
        </span>
      </div>
      <ResourceContent
        filterField={activeFilter.field}
        filterValue={activeFilter.value}
        onFilterChange={(field, value) => setActiveFilter({ field, value })}
        onRetry={onRetry}
        query={query}
        resource={resource}
        state={state}
      />
    </section>
  );
}
