// Loads the Monaco code editor from this site's own bundle instead of cdn.jsdelivr.net, so the
// editor works on networks that block the CDN and does not depend on a third party being up.
// Monaco is large, so it is imported only when an editor is first shown. Every <Editor> /
// <DiffEditor> must wait for useMonacoAvailability() === 'ready' before rendering; otherwise
// @monaco-editor/react would start its own CDN load.
import { useEffect, useState } from 'react';
import { loader } from '@monaco-editor/react';

export type MonacoState = 'loading' | 'ready' | 'failed';
let state: MonacoState = 'loading';
let started = false;
const listeners = new Set<(s: MonacoState) => void>();
const publish = (s: MonacoState) => {
  state = s;
  listeners.forEach((l) => l(s));
};

export function startMonaco(): void {
  if (started) return;
  started = true;
  const timer = setTimeout(() => {
    if (state === 'loading') publish('failed');
  }, 20000);
  (async () => {
    const [monaco, worker] = await Promise.all([
      import('monaco-editor'),
      import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    ]);
    (self as any).MonacoEnvironment = { getWorker: () => new worker.default() };
    loader.config({ monaco });
    await loader.init();
  })()
    .then(() => {
      clearTimeout(timer);
      if (state === 'loading') publish('ready');
    })
    .catch(() => {
      clearTimeout(timer);
      publish('failed');
    });
}

export function useMonacoAvailability(): MonacoState {
  const [s, setS] = useState(state);
  useEffect(() => {
    startMonaco();
    listeners.add(setS);
    setS(state);
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}
