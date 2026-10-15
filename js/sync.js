/* Uzak sürümü yalnız düzenleme yokken uygular; taslağı kendiliğinden değiştirmez. */
(function (root) {
  'use strict';
  function create(options) {
    let revision = null, busy = false;
    return {
      invalidate() { revision = null; },
      async check() {
        if (busy || !options.available()) return 'paused';
        busy = true;
        try {
          const next = await options.revision();
          if (!next || next === revision) return 'unchanged';
          if (options.blocked()) { options.pending(); return 'pending'; }
          const snapshot = await options.read(next);
          // Ağ/şifre çözümü sürerken kullanıcı düzenlemeye başlamış olabilir.
          if (options.blocked()) { options.pending(); return 'pending'; }
          options.apply(snapshot);
          revision = next;
          return 'applied';
        } catch (error) { if (options.error) options.error(error); return 'failed'; }
        finally { busy = false; }
      },
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { create };
  else root.OPSync = { create };
})(typeof window !== 'undefined' ? window : globalThis);
