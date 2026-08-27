# Product Requirements Document

## Product

FreeSpirits Real Estate — WebMCP Challenge Edition

## Challenge objective

Demonstrate a compelling agent-native real estate workflow where a human can delegate complex property discovery and comparison work to an AI agent through structured WebMCP tools while retaining control over consequential actions.

## Primary user story

As a property seeker, I want to describe what I need in natural language and let my agent search, inspect, compare, shortlist, and prepare an enquiry so I can make a faster, better-informed decision without manually operating every filter and page.

Example request:

> Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.

## Product principles

1. **WebMCP-native, not UI automation** — core tasks must be exposed as structured tools.
2. **Real product experience** — the demo must feel like a coherent property-search product, not a schema playground.
3. **Human control** — the agent may prepare consequential actions, but the user reviews before final submission.
4. **Production-safe** — no production secrets or proprietary internals should be required by the public challenge repo.
5. **Judge-friendly** — setup, live testing, tool discovery, and the wow moment must be obvious within minutes.

## Target audience

- Renters and buyers searching across many listings
- International property seekers who need multilingual assistance
- Busy users who want an agent to reduce repetitive research
- Property marketplaces exploring agent-native interfaces

## Problem

Traditional property search requires repeated manual interaction with filters, listing cards, detail pages, notes, comparisons, favorites, and contact forms. Browser agents can attempt to automate those UIs, but they must infer page structure and may fail when layouts change.

WebMCP allows the site to define exactly what the agent can do and what inputs/outputs mean.

## Core workflow

### Step 1 — Search

The agent receives user criteria and invokes `search_properties`.

Acceptance criteria:

- Supports transaction type, location, min/max price, bedrooms, property type, renovation status, and optional features.
- Returns normalized listing summaries with stable identifiers.
- Rejects malformed or unsafe inputs.
- Clearly distinguishes no-results from tool failure.

### Step 2 — Inspect

The agent invokes `get_property_details` for promising listings.

Acceptance criteria:

- Returns normalized facts useful for decision-making.
- Includes price, size, bedrooms, location summary, condition, features, and a canonical listing URL where available.
- Does not expose private seller/user data that is not intended for public display.

### Step 3 — Compare

The agent invokes `compare_properties` with 2–5 property IDs plus optional priorities.

Acceptance criteria:

- Produces a structured comparison, not only prose.
- Highlights strengths, tradeoffs, and missing information.
- Does not invent unavailable facts.
- Can rank against user priorities while surfacing the basis for the ranking.

### Step 4 — Favorite

The agent invokes `save_favorite` where an authenticated/session context permits it.

Acceptance criteria:

- Requires a valid property identifier.
- Returns whether the property was newly saved or already saved.
- If no authenticated context exists, returns an actionable response instead of silently failing.

### Step 5 — Prepare enquiry

The agent invokes `prepare_enquiry` for the chosen listing.

Acceptance criteria:

- Generates a structured draft containing property ID, intended recipient context, user-provided contact fields where appropriate, and message text.
- The tool does **not** silently send the enquiry.
- The UI clearly presents the draft for human review/confirmation.

## Wow moment

Within the first 15–30 seconds of the demo, the viewer should see a natural-language property request turn into a multi-step agent workflow that searches live/demo inventory, narrows candidates, and produces a useful comparison without manually clicking through filters and listings.

The climax is the agent preparing a tailored enquiry while explicitly handing control back to the human before sending.

## Non-goals

- Rebuilding the complete FreeSpirits Real Estate production marketplace
- Publishing production admin/payment code
- Autonomous legally binding transactions
- Silent contact-form submission
- General-purpose browser automation

## Success metrics for judging

### WebMCP Leverage

- At least five meaningful tools registered with `document.modelContext.registerTool(...)` or the equivalent supported WebMCP mechanism.
- Schemas are specific, validated, and domain-appropriate.
- Multi-tool workflows work reliably.

### Execution

- Public repo runs from documented instructions.
- Live demo works in a WebMCP-enabled supported browser environment.
- Error states are handled cleanly.

### Potential Impact

- The demo shows clear time/effort reduction versus manual property browsing.
- The human remains in control of consequential steps.

### Creativity & Ambition

- Comparison is priority-aware rather than a generic table.
- The agent can explain tradeoffs grounded in structured property facts.
- Multilingual/domain-specific possibilities are visible without overcomplicating the MVP.

## Submission deliverables

- Public GitHub repository
- Open-source license
- Working hosted URL
- English README and test instructions
- Clear pre-existing-vs-new-work documentation
- Under-three-minute public YouTube demo with audio
- Devpost project description explaining WebMCP fit, UX improvement, human-agent collaboration, and implementation
