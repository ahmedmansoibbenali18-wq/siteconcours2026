export default function Loading({ children = 'Chargement des informations…' }) {
  return (
    <div className="resource-message" role="status">
      <span aria-hidden="true" className="loader" />
      {children}
    </div>
  );
}
