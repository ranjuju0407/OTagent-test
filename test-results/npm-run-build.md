npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> otagent@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
[plugin:vite:resolve] [plugin vite:resolve] Module "zlib" has been externalized for browser compatibility, imported by "/workspace/OTagent-test/node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin:vite:resolve] [plugin vite:resolve] Module "fs" has been externalized for browser compatibility, imported by "/workspace/OTagent-test/node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin:vite:resolve] [plugin vite:resolve] Module "http" has been externalized for browser compatibility, imported by "/workspace/OTagent-test/node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin:vite:resolve] [plugin vite:resolve] Module "https" has been externalized for browser compatibility, imported by "/workspace/OTagent-test/node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin:vite:resolve] [plugin vite:resolve] Module "url" has been externalized for browser compatibility, imported by "/workspace/OTagent-test/node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
✓ 2234 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.39 kB │ gzip:   0.27 kB
dist/assets/index-BzJeX9K-.css     10.74 kB │ gzip:   2.95 kB
dist/assets/pdf-Dzy4bq9y.js     1,037.98 kB │ gzip: 313.63 kB
dist/assets/index-BEVzTmX3.js   1,118.29 kB │ gzip: 313.73 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 12.71s
