import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos funcionam em https://usuario.github.io/repositorio/
  base: "./",
});
