# Challenge Deployment Guide

## Goal

Deploy the public Challenge Edition over HTTPS without exposing or modifying the private production FreeSpirits Real Estate application.

The generated Vite build uses relative asset paths, so the same `dist/` output can be hosted at a dedicated root domain/subdomain or at a project subdirectory.

## Build

```bash
npm install
npm test
npm run build
```

Deploy the contents of:

```text
dist/
```

## Recommended production separation

Keep the commercial marketplace and the Challenge Edition isolated.

```text
realestate.fspirits.com
    production marketplace
    private commercial code

challenge-realestate.fspirits.com   (example)
    public WebMCP Challenge Edition
    built from this repository
```

A dedicated challenge hostname is preferred because it makes the judging target obvious and allows the Challenge Edition to be frozen after the submission deadline without freezing ongoing commercial development.

## Hosting requirements

- HTTPS
- publicly reachable without VPN/IP allow-listing
- no production credentials embedded in browser JavaScript
- stable URL through the complete judging period
- WebMCP-capable browser must receive the normal application page without bot/browser blocking

## Static-host deployment

This project is a client-side React/Vite app and can be hosted as static files.

Typical static hosting flow:

1. Build with `npm run build`.
2. Upload everything inside `dist/` to the document root of the challenge hostname.
3. Ensure `index.html` is served for the root request.
4. Confirm JavaScript/CSS files return HTTP 200.
5. Confirm HTTPS certificate validity.
6. Open the site in the WebMCP-capable browser and verify the status changes to `WebMCP detected`.

## GitHub Pages option

Because Vite assets are relative, the build can also be served from a project path such as:

```text
https://<github-user>.github.io/freespirits-realestate-webmcp/
```

If GitHub Pages is used, configure Pages to deploy a production `dist/` artifact from GitHub Actions or an appropriate deployment branch. Verify WebMCP behavior on the final Pages URL before using it in Devpost.

## Optional live-data mode

The first Challenge Edition intentionally ships with sanitized demo inventory so judges can always reproduce the project.

If live FreeSpirits data is added later, use a narrow challenge-safe public endpoint. Do not expose privileged credentials in browser code.

Recommended pattern:

```text
Challenge App
   |
   | HTTPS read-only request
   v
Challenge-safe API endpoint
   |
   v
Public property fields only
```

The demo provider should remain available as a fallback so judging is not dependent on the production marketplace or database availability.

## Submission freeze

Before the Devpost deadline:

1. Verify the final commit with GitHub Actions.
2. Deploy that exact commit.
3. Record the commit SHA.
4. Confirm the live URL matches the submitted behavior.
5. Complete the demo recording from the same deployed version.
6. After submission closes, leave the submitted repository and deployed judged version unchanged through judging, consistent with the challenge rules.

If continued development is desired during judging, work in a separate fork or separate development copy rather than altering the submitted judged version.
