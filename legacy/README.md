# Legacy kiosk prototypes

These are the Express prototypes that came before the Next.js app. They are kept for reference and are not part of the deployed site.

They used to live in `public/`, which Next.js serves to everyone, so their source code, `package.json` and `node_modules` were downloadable from the live site.

- `kiosk/` — the MySQL kiosk (login, seller flow, dashboard). Run it with `cd legacy/kiosk && npm install && npm start`. It reads its own `kiosk/.env`.
- `server.js` — the earlier MongoDB / JSON-file prototype. Run it with `npm run legacy-server` from the project root. It stores data in `legacy/data/storage.json` when `MONGODB_URI` is not set.
- `tests/role-routes.test.js` — smoke test for `server.js`: `node legacy/tests/role-routes.test.js`.

Known problems, if you ever run these again: the APIs trust the client for payment amounts and confirmation, `server.js` has no authentication, and the kiosk dashboard renders user input with `innerHTML`.
