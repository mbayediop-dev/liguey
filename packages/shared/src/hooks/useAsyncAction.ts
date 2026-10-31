import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '../lib/validation';

interface Options<R> {
  /** Clés React Query à invalider après succès. */
  invalidate?: readonly (readonly unknown[])[];
  onSuccess?: (result: R) => void | Promise<void>;
  errorTitle?: string;
  /** Si false, l'erreur n'est pas affichée (elle est renvoyée via `error`). */
  alertOnError?: boolean;
}

/** Enveloppe une action asynchrone : état de chargement, invalidation du cache, alerte d'erreur. */
export function useAsyncAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>, opts: Options<R> = {}) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current(...args);
        const o = optsRef.current;
        await Promise.all((o.invalidate ?? []).map((k) => qc.invalidateQueries({ queryKey: k as unknown[] })));
        await o.onSuccess?.(result);
        return result;
      } catch (e) {
        const msg = errorMessage(e);
        setError(msg);
        if (optsRef.current.alertOnError !== false) Alert.alert(optsRef.current.errorTitle ?? 'Oups', msg);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [qc],
  );

  return { run, loading, error };
}
