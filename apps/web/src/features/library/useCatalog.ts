import { useEffect, useState } from 'react';
import { loadCatalog } from './api';
import type { Catalog } from './types';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; data: Catalog }
  | { status: 'error' };

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then(data => {
        if (active) setCatalog({ status: 'ready', data });
      })
      .catch(() => {
        if (active) setCatalog({ status: 'error' });
      });
    return () => { active = false; };
  }, [revision]);

  function retry() {
    setCatalog({ status: 'loading' });
    setRevision(value => value + 1);
  }

  return { catalog, retry };
}
