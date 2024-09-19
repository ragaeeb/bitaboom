import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  base: "/bitaboom/", // This should match the name of your GitHub repo.
});
