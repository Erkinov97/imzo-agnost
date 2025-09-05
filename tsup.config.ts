import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'], // ESM, CommonJS va browser uchun IIFE
  globalName: 'EIMZOAgnost', // Browser global uchun
  minify: false, // Development uchun false
  sourcemap: true,
  dts: true, // TypeScript declaration files
  clean: true,
  target: 'es2022',
  outDir: 'dist',
  platform: 'neutral', // Browser va Node.js uchun
  splitting: false, // Code splitting disable
  treeshake: true, // Dead code elimination
  bundle: true,
  external: [], // Barcha dependency bundle qilamiz
  noExternal: [], // Har qanday dependency bundle qilamiz
  define: {
    // Browser environment uchun process safely handle qilish
    'process.env.NODE_ENV': '"production"'
  },
  inject: ['./polyfills/process-polyfill.js'], // Browser uchun process polyfill
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : format === 'esm' ? '.mjs' : '.js'
    };
  }
});
