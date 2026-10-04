export const resources = [
  { id: 'services', label: 'Services municipaux', shortLabel: 'Services', icon: 'grid', path: '/services' },
  { id: 'requests', label: 'Demandes habitantes', shortLabel: 'Demandes', icon: 'inbox', path: '/demandes' },
  { id: 'news', label: 'Actualités & annonces', shortLabel: 'Actualités', icon: 'news', path: '/actualites' },
];

export const residentResources = [
  { id: 'alerts', label: 'Alertes', shortLabel: 'Alertes', icon: 'alert', path: '/alertes' },
  { id: 'weather', label: 'Météo', shortLabel: 'Météo', icon: 'globe', path: '/meteo' },
  { id: 'water', label: 'Distribution d’eau', shortLabel: 'Eau', icon: 'drop', path: '/eau' },
];

export const allResources = [...resources, ...residentResources];

export const pages = [
  { id: 'overview', label: 'Vue d’ensemble', icon: 'home', path: '/' },
  ...resources.map(({ id, shortLabel, icon, path }) => ({ id, label: shortLabel, icon, path })),
  { id: 'report', label: 'Signalements', icon: 'alert', path: '/signalements' },
  { id: 'dashboard', label: 'Tableau de bord', icon: 'home', path: '/dashboard', group: 'preview' },
  { id: 'alerts', label: 'Alertes', icon: 'alert', path: '/alertes', group: 'preview' },
  { id: 'weather', label: 'Météo', icon: 'globe', path: '/meteo', group: 'preview' },
  { id: 'water', label: 'Eau', icon: 'drop', path: '/eau', group: 'preview' },
  { id: 'nova', label: 'Assistant Nova', icon: 'sparkles', path: '/assistant', group: 'preview' },
  { id: 'my-space', label: 'Mon espace', icon: 'home', path: '/mon-espace', group: 'private' },
  { id: 'my-requests', label: 'Mes demandes', icon: 'inbox', path: '/mes-demandes', group: 'private' },
  { id: 'notifications', label: 'Notifications', icon: 'news', path: '/notifications', group: 'private' },
  { id: 'profile', label: 'Mon profil', icon: 'user', path: '/mon-profil', group: 'private' },
  { id: 'login', label: 'Connexion habitant', icon: 'user', path: '/connexion', group: 'account' },
  { id: 'register', label: 'Créer un compte', icon: 'user', path: '/inscription', group: 'account' },
  { id: 'password-reset', label: 'Mot de passe oublié', icon: 'user', path: '/mot-de-passe-oublie', group: 'account' },
];
