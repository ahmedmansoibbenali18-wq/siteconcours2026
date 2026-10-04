const apiBaseUrl = import.meta.env.VITE_TERRA_NOVA_API_BASE_URL?.trim() ?? '';

const resourcePaths = {
  services: import.meta.env.VITE_TERRA_NOVA_SERVICES_PATH?.trim() ?? '',
  requests: import.meta.env.VITE_TERRA_NOVA_REQUESTS_PATH?.trim() ?? '',
  news: import.meta.env.VITE_TERRA_NOVA_NEWS_PATH?.trim() ?? '',
  alerts: import.meta.env.VITE_TERRA_NOVA_ALERTS_PATH?.trim() ?? '',
  weather: import.meta.env.VITE_TERRA_NOVA_WEATHER_PATH?.trim() ?? '',
  water: import.meta.env.VITE_TERRA_NOVA_WATER_PATH?.trim() ?? '',
};

export function isResourceConfigured(resource) {
  return Boolean(resourcePaths[resource]?.trim());
}

export async function getResource(resource, { signal } = {}) {
  const path = resourcePaths[resource]?.trim();
  if (!path) {
    throw new Error(`Le chemin API pour « ${resource} » n’est pas configuré.`);
  }

  const baseUrl = apiBaseUrl || window.location.origin;
  let url;

  try {
    url = new URL(path, `${baseUrl.replace(/\/+$/, '')}/`);
  } catch {
    throw new Error('La configuration du service est invalide. Vérifiez les paramètres de l’API.');
  }

  let response;

  try {
    response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Le serveur est injoignable. Vérifiez la connexion et la configuration réseau.');
  }

  if (!response.ok) {
    throw new Error('Impossible de contacter les services de Terra Nova. Veuillez réessayer.');
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    throw new Error('La réponse des services de Terra Nova est indisponible. Veuillez réessayer.');
  }
}
