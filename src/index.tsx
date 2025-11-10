import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app';
import * as serviceWorker from './serviceWorker';

// ---- Zakeke network tap (fetch/XMLHttpRequest) ----
(function installZkNetTap(){
  try {
    const ORIGIN: string = '*'; // tighten to your parent origin later
    const w = window as unknown as {
      fetch: typeof window.fetch;
      parent: Window | null;
      __zkNetTap?: { enabled: boolean };
    };

    const shouldLog = (url: string): boolean => /zakeke\./i.test(url) || /\/api\//i.test(url);
    const post = (type: string, payload: unknown): void => {
      try { w.parent && w.parent.postMessage({ src: 'zakeke-app', type, payload }, ORIGIN); } catch {}
    };

    // --- fetch tap ---
    const _fetch = w.fetch.bind(window);
    w.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const started = Date.now();
      const url = typeof input === 'string' ? input : (input as URL | Request).toString();
      const method = (init && (init as RequestInit).method) || 'GET';
      if (shouldLog(url)) post('zk-net-fetch', { phase: 'start', method, url });
      try {
        const res = await _fetch(input as any, init as any);
        if (shouldLog(url)) {
          const clone = res.clone();
          let bodySnippet: string | null = null;
          try { bodySnippet = await clone.text(); bodySnippet = bodySnippet.slice(0, 3000); } catch {}
          post('zk-net-fetch', { phase: 'end', method, url, status: res.status, durMs: Date.now()-started, bodySnippet });
        }
        return res;
      } catch (e) {
        const err = e as Error;
        if (shouldLog(url)) post('zk-net-fetch', { phase: 'error', method, url, error: err?.message });
        throw e;
      }
    }) as typeof window.fetch;

    // --- XHR tap ---
    // Provide precise typings for `this` and the open/send signatures to avoid TS2683/TS2345
    type ZkXHR = XMLHttpRequest & { __zk?: { url: string; method: string; started: number } };

    const _open = XMLHttpRequest.prototype.open;
    const _send = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ): void {
      const xhr = this as ZkXHR;
      const urlStr = typeof url === 'string' ? url : url.toString();
      xhr.__zk = { url: urlStr, method, started: 0 };
      // Call native open with a fully-specified signature
      return _open.call(this, method, urlStr, async, username ?? null, password ?? null);
    } as typeof XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest,
      body?: Document | XMLHttpRequestBodyInit | null
    ): void {
      try {
        const xhr = this as ZkXHR;
        const meta = xhr.__zk || { url: '', method: 'GET', started: 0 };
        meta.started = Date.now();
        xhr.__zk = meta;
        if (shouldLog(meta.url)) post('zk-net-xhr', { phase: 'start', method: meta.method, url: meta.url });
        this.addEventListener('loadend', function (this: XMLHttpRequest) {
          const m = (this as ZkXHR).__zk || meta;
          if (!shouldLog(m.url)) return;
          post('zk-net-xhr', { phase: 'end', method: m.method, url: m.url, status: this.status, durMs: Date.now() - m.started });
        });
        this.addEventListener('error', function (this: XMLHttpRequest) {
          const m = (this as ZkXHR).__zk || meta;
          if (!shouldLog(m.url)) return;
          post('zk-net-xhr', { phase: 'error', method: m.method, url: m.url });
        });
      } catch {}
      return _send.call(this, body as any);
    } as typeof XMLHttpRequest.prototype.send;

    // Optional toggle for debugging
    (w as any).__zkNetTap = { enabled: true };
  } catch {}
})();
// ---- end Zakeke network tap ----

// ---- Runtime module inspector ----
(function attachModuleInspector() {
  try {
    const qp = new URLSearchParams(window.location.search);
    const debugEnabled = qp.has('debugmods') || qp.has('debug-mods') || (window as any).__DEBUG_MODS__ === true;

    const extractModuleIdsFromStack = (stack?: string): number[] => {
      if (!stack) return [];
      const ids = new Set<number>();
      const re = /\bat\s+(\d{1,6})\b/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(stack))) ids.add(Number(m[1]));
      return Array.from(ids);
    };

    const printModuleInfo = (ids: number[]): void => {
      const rt: any = (window as any).__webpack_require__;
      if (!rt || !rt.m) return;
      ids.forEach((id) => {
        try {
          const modFn = rt.m[id];
          if (typeof modFn !== 'function') return;
          const src = Function.prototype.toString.call(modFn);
          const hintMatch = /\/\*\s*([^*]+)\s*\*\//.exec(src);
          const hint = hintMatch ? hintMatch[1] : null;
          console.groupCollapsed(`%c[MODMAP] id ${id}`, 'font-weight:bold');
          console.log({ id, hint });
          console.log(src.slice(0, 600));
          console.groupEnd();
        } catch {}
      });
    };

    window.addEventListener('error', (evt) => {
      try {
        const ids = extractModuleIdsFromStack((evt as any)?.error?.stack || String((evt as any)?.error || (evt as any)?.message));
        if (ids.length) printModuleInfo(ids);
      } catch {}
    });

    window.addEventListener('unhandledrejection', (evt: any) => {
      try {
        const reason = evt?.reason?.stack ? evt.reason.stack : String(evt?.reason);
        const ids = extractModuleIdsFromStack(reason);
        if (ids.length) printModuleInfo(ids);
      } catch {}
    });

    if (debugEnabled) {
      (window as any).__probeMods = (ids: number[] = []) => {
        if (!ids.length) {
          console.info('[MODMAP] pass module ids, e.g., __probeMods([501,6564,6412,4146,9699])');
          return;
        }
        printModuleInfo(ids);
      };
      console.info('[MODMAP] enabled. Use __probeMods([501,...]) to inspect module sources.');
    }
  } catch {}
})();

// ---- end module inspector ----
// ---- Safari telemetry + parent handshake ----
(function telemetryAndHandshake() {
  const ORIGIN = '*'; // TODO: tighten to 'https://spiritsstudio.co.uk' once verified
  const send = (type: string, payload: any = {}) => {
    try { window.parent && window.parent.postMessage({ src: 'zakeke-app', type, payload }, ORIGIN); } catch {}
  };

  // Lifecycle breadcrumbs
  send('zk-bootstrap-start', { ua: navigator.userAgent, ts: Date.now() });
  window.addEventListener('DOMContentLoaded', () => send('zk-domcontentloaded'));
  window.addEventListener('load', () => send('zk-window-load'));

  // Error traps (report to parent)
  window.addEventListener('error', (e: ErrorEvent) => {
    send('zk-error', {
      message: (e as any)?.error?.message || e.message,
      stack: (e as any)?.error?.stack,
      filename: e.filename, lineno: e.lineno, colno: e.colno
    });
  });
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const r: any = e?.reason;
    send('zk-unhandledrejection', {
      reason: typeof r === 'string' ? r : (r?.message || r),
      stack: r?.stack
    });
  });

  // Observe #root hydration to detect stalls (Safari-specific symptom)
  const observeRoot = () => {
    const root = document.getElementById('root');
    if (!root) return;
    const obs = new MutationObserver(() => {
      const childCount = root.querySelectorAll('*').length;
      send('zk-root-mutation', { childCount });
      if (childCount > 10) { // heuristic: app DOM populated
        send('zakeke-ready');
        obs.disconnect();
      }
    });
    obs.observe(root, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeRoot, { once: true });
  } else {
    observeRoot();
  }

  // Expose a tiny debug hook for manual pings from the console
  (window as any).__zkPing = (note?: any) => send('zk-ping', { note, ts: Date.now() });
})();
// ---- end telemetry + handshake ----



const mountNode = document.getElementById('root');
(window as any).__zk_performance = { t0: performance.now() };
try {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    mountNode
  );
  (function () {
    try {
      const t1 = performance.now();
      (window as any).__zk_performance.t1 = t1;
      window.parent?.postMessage({
        src: 'zakeke-app',
        type: 'zk-react-mounted',
        payload: { durationMs: t1 - (window as any).__zk_performance.t0 }
      }, '*');
    } catch {}
  })();
} catch (e) {
  try {
    window.parent?.postMessage({
      src: 'zakeke-app',
      type: 'zk-react-mount-error',
      payload: { message: (e as any)?.message, stack: (e as any)?.stack }
    }, '*');
  } catch {}
  throw e;
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
