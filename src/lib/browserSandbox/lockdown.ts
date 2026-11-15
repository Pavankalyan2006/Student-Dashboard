/**
 * Removes network, storage and worker-spawning APIs from a worker's global scope, including from every
 * prototype in its chain (so `Object.getPrototypeOf(self).fetch` is gone too). Called after the runtime
 * and any packages have loaded and before student code starts. The worker is single-use, so nothing
 * needs them back.
 */
export const BLOCKED_APIS = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'WebSocketStream',
  'WebTransport',
  'EventSource',
  'importScripts',
  'indexedDB',
  'caches',
  'cookieStore',
  'BroadcastChannel',
  'Worker',
  'SharedWorker',
  'RTCPeerConnection',
] as const;

export function lockDown(scope: any): string[] {
  const removed: string[] = [];
  const targets: any[] = [];
  for (let o = scope; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) targets.push(o);
  for (const name of BLOCKED_APIS) {
    let found = false;
    for (const t of targets) {
      if (!Object.prototype.hasOwnProperty.call(t, name)) continue;
      found = true;
      try {
        Object.defineProperty(t, name, { value: undefined, writable: false, configurable: false });
      } catch {
        try {
          delete t[name];
        } catch {
          /* ignore */
        }
      }
    }
    if (found) removed.push(name);
  }
  // navigator.storage and navigator.sendBeacon live on the navigator object.
  const nav = scope.navigator;
  if (nav) {
    for (let o = nav; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
      for (const name of ['storage', 'sendBeacon', 'serviceWorker', 'locks']) {
        if (!Object.prototype.hasOwnProperty.call(o, name)) continue;
        try {
          Object.defineProperty(o, name, { value: undefined, writable: false, configurable: false });
        } catch {
          /* ignore */
        }
      }
    }
  }
  return removed;
}
