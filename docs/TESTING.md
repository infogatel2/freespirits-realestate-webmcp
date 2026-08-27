# Judge & Developer Testing Guide

## What this verifies

The Challenge Edition exposes five structured WebMCP tools:

1. `search_properties`
2. `get_property_details`
3. `compare_properties`
4. `save_favorite`
5. `prepare_enquiry`

The intended journey is:

```text
search → inspect → compare → favorite → prepare enquiry → human review
```

The final step deliberately stops before sending an enquiry.

## Local setup

Requirements:

- Node.js 22+
- npm

```bash
npm install
npm test
npm run build
npm run dev
```

The application is intentionally self-contained and uses sanitized demo property data by default. No production credentials are required.

## Automated verification

Run:

```bash
npm test
```

The test suite checks:

- property filtering for the headline demo query
- stable property lookup
- transparent comparison scoring
- comparison validation
- enquiry drafts always require human confirmation
- all five WebMCP tools register
- the complete search → compare → favorite → enquiry tool journey

Every push to `main` also runs the public GitHub Actions workflow **Challenge CI**, which executes the tests and a production TypeScript/Vite build in a fresh environment.

## WebMCP browser testing

Use either:

- ChatGPT's in-app browser with WebMCP support, or
- a WebMCP-enabled supported Google Chrome build (for the challenge, Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the browser restarted).

Open the deployed HTTPS URL. The top-right status should show:

`WebMCP detected`

If it instead shows:

`WebMCP-capable browser required`

then the page is running normally but the browser has not exposed `document.modelContext`.

## Headline acceptance test

Give the agent this request:

> Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.

Expected behavior:

### 1. Search

The agent calls `search_properties` with criteria equivalent to:

- transaction type: rent
- location: Thessaloniki
- maximum price: 750
- bedrooms: 2–3
- renovated: true

The visible app should populate with at least three matching properties.

### 2. Inspect

The agent may call `get_property_details` for candidate IDs returned by search.

### 3. Compare

The agent calls `compare_properties` for 2–5 candidates and may choose priorities such as:

- `price`
- `space`
- `renovated`
- `metro_access`
- `university_access`
- `outdoor_space`

The visible comparison panel should update with a deterministic score and clearly labelled strengths/tradeoffs.

### 4. Favorite

The agent calls `save_favorite` for the chosen property. The favorites counter should update. Saving the same listing twice is idempotent.

### 5. Enquiry draft

The agent calls `prepare_enquiry` for the selected property.

The page should show an enquiry review card with:

`Human confirmation required`

The tool response must include:

```json
"requiresHumanConfirmation": true
```

The Challenge Edition does not auto-send enquiries.

## Safety checks

Before submission, verify:

- no `.env` file is committed
- no production database/API/payment/SMTP credentials are present
- no private seller/user data is exposed by WebMCP tools
- invalid property IDs return controlled errors
- result limits remain bounded
- listing text never controls tool registration or behavior
- enquiry sending remains disabled until an explicit human-controlled production integration is designed

## Fresh-clone judge rehearsal

Before the final Devpost submission:

1. Open the public repository in an incognito browser to confirm it is genuinely public.
2. Clone it into a fresh directory.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm run build`.
6. Open the deployed HTTPS site in a WebMCP-enabled browser.
7. Run the headline acceptance test from beginning to end.
8. Record the exact final commit SHA in the submission/testing instructions.
