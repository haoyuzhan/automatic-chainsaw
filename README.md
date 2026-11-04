# Z&Y Accounting & Advisory website

A responsive, dependency-free marketing website with an interactive quote estimator for a Toronto accounting and advisory practice.

## Run locally

From this directory, start a small local web server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. Stop the server with `Ctrl+C`.

No package installation or build step is required.

## Deploy privately for free

The included Cloudflare Worker protects every page and asset with a shared password. It uses a free `workers.dev` address, so a paid domain is not required.

1. Create a free Cloudflare account.
2. From this directory, authorize Wrangler:

   ```bash
   npx wrangler login
   ```

3. Create the Worker once:

   ```bash
   npx wrangler deploy
   ```

4. Add the password securely. Enter it only at Wrangler's prompt:

   ```bash
   npx wrangler secret put SITE_PASSWORD
   ```

5. Deploy again so the private site is ready:

   ```bash
   npx wrangler deploy
   ```

Wrangler prints the private `workers.dev` URL. Visitors see only the password screen until authenticated. Sessions expire after eight hours. Change the password at any time by repeating step 4. Do not place the password in this repository or send it in chat.

To test the protected version locally after Wrangler is available:

```bash
npx wrangler dev
```

## Files

- `index.html` — page content and quote questionnaire
- `styles.css` — responsive layout and visual design
- `script.js` — navigation, quote calculations, and interactions
- `favicon.svg` — browser tab icon
- `worker.mjs` — password gate and security headers for Cloudflare
- `wrangler.jsonc` — free Cloudflare Workers deployment configuration
- `.assetsignore` — limits the files included in the public asset bundle

The prices are editable in `index.html` (displayed packages) and `script.js` (quote calculator ranges). They are planning estimates in Canadian dollars and should be reviewed against the firm's final scope and credentials before publication.
