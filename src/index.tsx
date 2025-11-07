import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app';
import * as serviceWorker from './serviceWorker';

// ---- Runtime module inspector (helps decode "r is not a function" from minified stacks) ----
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



ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
