import { useCallback, useEffect, useState } from 'react';
import { getResource, isResourceConfigured } from '../services/api.js';
import { allResources } from '../utils/navigation.js';

function createInitialState() {
  return Object.fromEntries(allResources.map(({ id }) => [
    id,
    { status: isResourceConfigured(id) ? 'idle' : 'unavailable', data: null, error: '' },
  ]));
}

export default function useResources() {
  const [resourceState, setResourceState] = useState(createInitialState);

  const loadResource = useCallback(async (resourceId, signal) => {
    if (!isResourceConfigured(resourceId)) {
      setResourceState((current) => ({
        ...current,
        [resourceId]: { status: 'unavailable', data: null, error: '' },
      }));
      return;
    }

    setResourceState((current) => ({
      ...current,
      [resourceId]: { status: 'loading', data: null, error: '' },
    }));

    try {
      const data = await getResource(resourceId, { signal });
      if (signal?.aborted) return;
      setResourceState((current) => ({
        ...current,
        [resourceId]: { status: 'success', data, error: '' },
      }));
    } catch (error) {
      if (signal?.aborted) return;
      setResourceState((current) => ({
        ...current,
        [resourceId]: {
          status: 'error',
          data: null,
          error: error instanceof Error
            ? error.message
            : 'Impossible de contacter les services de Terra Nova. Veuillez réessayer.',
        },
      }));
    }
  }, []);

  useEffect(() => {
    const controllers = allResources.map(() => new AbortController());
    allResources.forEach((resource, index) => {
      loadResource(resource.id, controllers[index].signal);
    });
    return () => controllers.forEach((controller) => controller.abort());
  }, [loadResource]);

  const retryResource = useCallback((resourceId) => {
    const controller = new AbortController();
    loadResource(resourceId, controller.signal);
  }, [loadResource]);

  return { resourceState, retryResource };
}
