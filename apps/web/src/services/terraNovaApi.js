const apiBaseUrl = import.meta.env.VITE_TERRA_NOVA_API_BASE_URL?.trim() ?? '';

const resourcePaths = {
  services: import.meta.env.VITE_TERRA_NOVA_SERVICES_PATH?.trim() ?? '',
  requests: import.meta.env.VITE_TERRA_NOVA_REQUESTS_PATH?.trim() ?? '',
  news: import.meta.env.VITE_TERRA_NOVA_NEWS_PATH?.trim() ?? '',
};

export function isResourceConfigured(resource) {
  return Boolean(resourcePaths[resource]);
}

export async function getResource(resource) {
  const path = resourcePaths[resource];
  if (!path) {
    throw new Error(`Le chemin API pour « ${resource} » n’est pas configuré.`);
  }

  const baseUrl = apiBaseUrl || window.location.origin;
  const url = new URL(path, `${baseUrl.replace(/\/+$/, '')}/`);
  let response;

  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Le serveur est injoignable. Vérifiez la connexion et la configuration réseau.');
  }

  if (!response.ok) {
    throw new Error(`Le serveur a répondu avec le statut ${response.status}.`);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    throw new Error('La réponse du serveur n’est pas un JSON valide.');
  }
}
