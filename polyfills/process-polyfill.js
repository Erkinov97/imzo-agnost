// Browser polyfill for process object
// Bu fayl browser environmentda process obyektini safely handle qiladi

if (typeof globalThis !== 'undefined' && typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'production'
    },
    versions: {
      node: null
    }
  };
}
