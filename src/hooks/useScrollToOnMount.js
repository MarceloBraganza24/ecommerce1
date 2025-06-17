import { useEffect } from 'react';

export function useScrollToOnMount(storageKey = 'scrollToId') {
  useEffect(() => {
    const idToScroll = sessionStorage.getItem(storageKey);
    if (idToScroll) {
      const el = document.getElementById(idToScroll);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);
}
