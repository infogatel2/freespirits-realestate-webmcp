# Technical Specification

## 1. Architecture

The Challenge Edition will be a standalone public web application with a small, auditable codebase.

Recommended stack:

- React
- TypeScript
- Vite
- WebMCP imperative API via `document.modelContext.registerTool(...)`
- Zod or equivalent runtime validation for application-side input checking
- Challenge data provider abstraction with two modes:
  - bundled sanitized/demo JSON for guaranteed reproducibility
  - optional remote challenge-safe API adapter for live FreeSpirits Real Estate data

No OpenAI API key is required for the core WebMCP interaction because the browser/agent invokes the tools exposed by the page.

## 2. Repository boundaries

The repository contains only challenge-specific code and reusable public assets.

Never commit:

- production `.env`
- database credentials
- SMTP/payment/API secrets
- private production source that is unrelated to this challenge
- private user/contact data

## 3. Runtime structure

```text
src/
  app/
    App.tsx
    routes.ts
  components/
    SearchPanel.tsx
    PropertyCard.tsx
    ComparePanel.tsx
    EnquiryReview.tsx
    WebMCPStatus.tsx
  data/
    demo-properties.json
  domain/
    property.ts
    search.ts
    comparison.ts
    enquiry.ts
  services/
    propertyProvider.ts
    demoPropertyProvider.ts
    remotePropertyProvider.ts
  webmcp/
    registerTools.ts
    result.ts
    schemas/
      searchProperties.ts
      getPropertyDetails.ts
      compareProperties.ts
      saveFavorite.ts
      prepareEnquiry.ts
  state/
    favorites.ts
    session.ts
  tests/
    ...
```

## 4. WebMCP registration

On application startup, when `document.modelContext` is available, register the Challenge Edition tools using the imperative WebMCP API.

Representative shape:

```ts
await document.modelContext.registerTool({
  name: "search_properties",
  description: "Search available properties using structured real-estate criteria.",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string" },
      maxPrice: { type: "number" },
      minBedrooms: { type: "integer" }
    }
  },
  async execute(input) {
    return toWebMCPResult(await propertyService.search(input));
  }
});
```

Tool registration should use an `AbortController` so registrations can be cleanly removed during hot reload/unmount.

If WebMCP is unavailable, the UI must still load and clearly show that a WebMCP-capable environment is required for agent tool discovery.

## 5. Tool contracts

### `search_properties`

Purpose: discover candidate properties.

Input fields:

- `transactionType`: `rent | sale`
- `location`: string
- `minPrice`: number, optional
- `maxPrice`: number, optional
- `minBedrooms`: integer, optional
- `maxBedrooms`: integer, optional
- `propertyTypes`: string[], optional
- `renovated`: boolean, optional
- `features`: string[], optional
- `limit`: integer, default 10, max 20

Output:

- normalized criteria
- result count
- array of concise property summaries
- stable property IDs
- canonical listing URLs when available

### `get_property_details`

Input:

- `propertyId`: string

Output:

- public property facts
- location summary
- price and transaction type
- bedrooms / bathrooms / area
- condition / renovation information
- features
- short description
- listing URL
- explicit `unknown`/missing fields rather than fabricated values

### `compare_properties`

Input:

- `propertyIds`: 2–5 IDs
- `priorities`: optional array such as `price`, `space`, `renovated`, `metro_access`, `university_access`, `outdoor_space`

Output:

- property comparison rows
- best-per-priority indicators
- tradeoffs
- missing-data warnings
- deterministic score breakdown when priorities are provided

The scoring logic must be transparent and implemented in code, not hallucinated by an LLM.

### `save_favorite`

Input:

- `propertyId`: string

Output:

- `saved`: boolean
- `alreadySaved`: boolean
- current favorite count

Challenge default may use browser-local session storage. A remote/authenticated adapter can be added later without changing the tool contract.

### `prepare_enquiry`

Input:

- `propertyId`: string
- `name`: optional string
- `email`: optional string
- `phone`: optional string
- `messageIntent`: optional string

Output:

- structured enquiry draft
- property summary
- generated/default message template based only on known property facts and user-supplied intent
- `requiresHumanConfirmation: true`

This tool must not send an enquiry.

## 6. Data-provider abstraction

Define a `PropertyProvider` interface so the challenge can run safely in two modes.

```ts
interface PropertyProvider {
  search(criteria: PropertySearchCriteria): Promise<PropertySummary[]>;
  getById(id: string): Promise<PropertyDetails | null>;
}
```

### Demo provider

- Uses sanitized bundled JSON.
- Always available.
- Makes repository reproducible for judges.

### Remote provider

- Optional.
- Calls a narrow challenge-safe endpoint.
- Must not require privileged production credentials in browser code.
- Must have strict CORS/rate limits if enabled.
- Falls back gracefully to demo mode when unavailable.

## 7. UI requirements

The visible app should help judges understand what the agent is doing.

Required UI areas:

- WebMCP readiness indicator
- search/result view
- selected-property detail view
- comparison view
- favorites indicator
- enquiry review panel
- small activity timeline showing which WebMCP action just changed the app state

When a tool executes, the UI should visibly update so the demo demonstrates human + agent collaboration rather than invisible RPC calls.

## 8. Security and trust boundaries

- Treat property text and remote data as untrusted content.
- Never allow listing descriptions to redefine tool behavior.
- Validate all tool inputs before use.
- Clamp search result limits.
- Escape/render property content safely.
- Do not expose private contact data through public tools.
- Do not auto-send enquiries.
- Do not allow arbitrary URLs or arbitrary backend requests from tool input.

## 9. Testing

### Unit tests

- filtering logic
- comparison scoring
- missing-data handling
- favorite state
- enquiry draft generation
- schema/input validation

### WebMCP tests

- all five tools register
- duplicate registration is avoided across hot reload
- each tool returns valid structured output
- invalid property IDs return a controlled error result
- no-results search is distinct from execution failure

### Manual acceptance test

In a supported WebMCP environment, run:

> Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month. Compare the best three, save the best fit, and prepare an enquiry for me to review.

Expected sequence:

1. `search_properties`
2. one or more `get_property_details`
3. `compare_properties`
4. `save_favorite`
5. `prepare_enquiry`
6. human review remains required

## 10. Deployment

The app must be hosted over HTTPS because WebMCP is a secure-context browser capability.

Candidate deployment:

- challenge subdomain under FreeSpirits infrastructure, or
- Cloudflare / Vercel / Netlify / Render

The live URL must remain available and unchanged through the judging period.

## 11. Submission evidence

The repository commit history is part of the evidence that WebMCP work was added after August 25, 2026.

Before submission:

- tag the final judged version
- record the exact commit SHA in README/testing docs
- confirm live deployment matches that commit
- do not modify submitted repo/site during judging unless competition rules explicitly permit it
