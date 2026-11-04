# Performance Audit

Measured so far (no load testing yet):
- `npm run build`: passes in ~3s; Vite warns that some chunks exceed 500 kB after minification (no route-level code splitting; all ~100 page components are imported eagerly in `src/App.tsx`).
- Server startup: seeds ~170 Maps in under 1s on this machine.
- Persistence snapshot: ~7.4 MB JSON per save (dominated by seed catalogs), debounced 1s after writes.
- Pages reach network idle within the 30s crawl timeout; individual timings were not recorded.

Next: per-route bundle sizes, lazy-load page components with `React.lazy`, time key API endpoints.
