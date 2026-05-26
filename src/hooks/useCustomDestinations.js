import { useCallback, useEffect, useState } from 'react';
import {
  loadCustomDestinations,
  addCustomDestination,
  removeCustomDestination,
  updateCustomDestination,
} from '../utils/customDestinationStorage.js';

export function useCustomDestinations() {
  const [destinations, setDestinations] = useState(() => loadCustomDestinations());
  const [lastAdded, setLastAdded] = useState(null);

  const refresh = useCallback(() => {
    setDestinations(loadCustomDestinations());
  }, []);

  const add = useCallback(
    (city, options = {}) => {
      const result = addCustomDestination(destinations, city, options);
      setDestinations(result.list);
      if (result.added) setLastAdded(result.added);
      return result;
    },
    [destinations]
  );

  const remove = useCallback(
    (id) => {
      const list = removeCustomDestination(destinations, id);
      setDestinations(list);
      if (lastAdded?.id === id) setLastAdded(null);
    },
    [destinations, lastAdded]
  );

  const update = useCallback(
    (id, patch) => {
      const list = updateCustomDestination(destinations, id, patch);
      setDestinations(list);
    },
    [destinations]
  );

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'transport-map-custom-destinations-v1') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return {
    destinations,
    lastAdded,
    add,
    remove,
    update,
    refresh,
    hasDestinations: destinations.length > 0,
  };
}
