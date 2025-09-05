import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"], // UMD ham bo'ladi, lekin browser uchun iife eng qulay
  globalName: "CAPIWSPlugin", // `window.CAPIWSPlugin` sifatida mavjud bo'ladi
  minify: true,
  sourcemap: false,
  dts: false, // typelar shart emas hozircha
  clean: true,
  target: "es2017",
});
