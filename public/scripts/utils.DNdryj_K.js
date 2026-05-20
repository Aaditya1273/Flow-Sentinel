// utils.DNdryj_K.js - Flow Sentinel port of Walrus utils
// Export: o = onReady(callback)
export function o(callback) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(callback, 0);
  } else {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  }
}
