import ErrorMessage from './ErrorMessage.jsx';
import Icon from './Icon.jsx';
import Loading from './Loading.jsx';

function dataToText(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function getAvailableFilters(data) {
  if (!Array.isArray(data) || data.length < 2) return [];

  const fields = new Set(data.flatMap((item) => (
    item && typeof item === 'object' && !Array.isArray(item) ? Object.keys(item) : []
  )));

  return [...fields].flatMap((field) => {
    const values = data.map((item) => item?.[field]);
    if (values.some((value) => !['string', 'number', 'boolean'].includes(typeof value))) return [];
    const options = [...new Map(values.map((value) => [JSON.stringify(value), String(value)])).entries()];
    return options.length > 1 && options.length <= 12 ? [{ field, options }] : [];
  });
}

export default function ResourceContent({
  resource,
  state,
  query,
  filterField,
  filterValue,
  onFilterChange,
  onRetry,
}) {
  if (state.status === 'loading' || state.status === 'idle') return <Loading />;
  if (state.status === 'unavailable') {
    return (
      <div className="resource-message resource-message--muted">
        <span className="message-symbol"><Icon name="globe" size={19} /></span>
        <div>
          <strong>Source officielle non configurée</strong>
          <p>Le chemin API de {resource.label.toLowerCase()} n’a pas encore été communiqué.</p>
        </div>
      </div>
    );
  }
  if (state.status === 'error') return <ErrorMessage onRetry={onRetry}>{state.error}</ErrorMessage>;
  if (state.status !== 'success' || state.data == null) {
    return <div className="resource-message resource-message--muted">Aucune donnée à afficher.</div>;
  }

  const items = Array.isArray(state.data) ? state.data : [state.data];
  const filters = getAvailableFilters(Array.isArray(state.data) ? state.data : []);
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const visibleItems = normalizedQuery
    ? items.filter((item) => dataToText(item).toLocaleLowerCase('fr').includes(normalizedQuery))
    : items;
  const filteredItems = filterField && filterValue !== ''
    ? visibleItems.filter((item) => JSON.stringify(item?.[filterField]) === filterValue)
    : visibleItems;
  const filterControls = filters.map(({ field, options }) => (
    <label className="filter-field" key={field}>
      <span>Filtrer par <strong>{field}</strong></span>
      <select value={filterField === field ? filterValue : ''} onChange={(event) => onFilterChange(field, event.target.value)}>
        <option value="">Toutes les valeurs</option>
        {options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
    </label>
  ));

  return (
    <>
      {filterControls.length > 0 && <div className="facet-filters">{filterControls}</div>}
      {filteredItems.length === 0 ? (
        <div className="resource-message resource-message--muted">
          {items.length === 0 ? 'Aucune donnée publiée pour le moment.' : 'Aucun résultat ne correspond à ces critères.'}
        </div>
      ) : (
        <div className="record-list" aria-live="polite">
          {filteredItems.map((item, index) => (
            <article className="record-card" key={index}>
              <span className="record-index">{String(index + 1).padStart(2, '0')}</span>
              <pre>{dataToText(item)}</pre>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
