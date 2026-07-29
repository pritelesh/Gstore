// PostCSS processes CSS after Tailwind generates it.
// - tailwindcss: scans all content files and generates only the utility classes used
// - autoprefixer: adds vendor prefixes (-webkit-, -moz-) for cross-browser support.
//   Next.js 14 handles most prefixing internally, but having it here as a safety net
//   prevents subtle CSS breakage when CSS features are used that Next.js doesn't prefix.
//
// IMPORTANT: If the CSS compiles but Tailwind classes don't apply on new pages:
//   1. Stop the dev server gracefully (Ctrl+C in the terminal)
//   2. Delete the .next folder: Remove-Item -Recurse -Force .next
//   3. Restart: npm run dev
// Force-killing the dev server (e.g., Stop-Process -Force) corrupts the .next cache
// and causes Tailwind to miss classes from newly added files.

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
