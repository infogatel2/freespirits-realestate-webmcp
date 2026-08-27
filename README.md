# FreeSpirits Real Estate — WebMCP Challenge Edition

FreeSpirits Real Estate — WebMCP Challenge Edition is a focused, open-source extension of the existing FreeSpirits Real Estate marketplace, created for **The WebMCP Challenge**.

It demonstrates a real agent-native property discovery workflow where people and AI agents work together through structured WebMCP tools instead of forcing an agent to infer intent from page layouts, buttons, and forms.

## The demo in one sentence

> Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.

The agent can execute that multi-step journey using tools exposed directly by the web application while the human remains in control of consequential contact.

## Working WebMCP tools

The Challenge Edition currently registers five tools through `document.modelContext.registerTool(...)`:

- `search_properties` — structured property discovery using location, transaction type, price, bedroom count, property type, renovation status, features, and bounded result limits.
- `get_property_details` — normalized public facts for a stable property ID.
- `compare_properties` — deterministic, priority-aware comparison for 2–5 properties using price, space, renovation status, metro access, university access, and outdoor space.
- `save_favorite` — idempotent challenge-session favorite saving without exposing production account internals.
- `prepare_enquiry` — creates an enquiry draft for review and always returns `requiresHumanConfirmation: true`; it never silently sends the enquiry.

Tool calls visibly update the application, so the human can see the search results, ranking, favorites, enquiry draft, and agent activity as the workflow progresses.

## Why WebMCP fits this problem

Traditional real-estate search makes users repeatedly operate filters, open listings, compare details, remember tradeoffs, save candidates, and fill contact forms. A generic browser agent has to guess how each interface works.

With WebMCP, the website declares exactly what an agent may do and what the data means. The result is a more reliable collaboration model:

```text
Natural-language request
        |
        v
search_properties
        |
        v
get_property_details
        |
        v
compare_properties
        |
        v
save_favorite
        |
        v
prepare_enquiry
        |
        v
HUMAN REVIEW / CONFIRMATION
```

## Transparent decision support

The comparison layer does not ask an LLM to invent a score. The scoring implementation is deterministic and lives in the public source code.

A user can prioritize factors such as:

- price
- space
- renovation status
- metro access
- university access
- outdoor space

The tool returns ranking scores, strengths, tradeoffs, and missing-data warnings grounded in the available property facts.

## Human + agent safety boundary

This project is intentionally designed around collaboration rather than blind automation.

The agent can search, inspect, compare, shortlist, save a challenge-session favorite, and prepare an enquiry. The Challenge Edition does **not** autonomously send an enquiry.

The final contact step explicitly hands control back to the human.

## Reproducible challenge data

The repository includes sanitized Thessaloniki demo listings so judges and developers can reproduce the complete workflow without production database access or private credentials.

A challenge-safe remote data adapter can be added separately while retaining the bundled dataset as a fallback.

## Quick start

Requirements: Node.js 22+ and npm.

```bash
npm install
npm test
npm run build
npm run dev
```

The public CI workflow also runs the tests and production build on pushes to `main`.

See:

- [`docs/TESTING.md`](docs/TESTING.md) — automated tests, WebMCP testing, and the headline acceptance flow.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — HTTPS deployment and submission-freeze guidance.
- [`docs/PRE_EXISTING_VS_WEBMCP.md`](docs/PRE_EXISTING_VS_WEBMCP.md) — explicit separation of prior product work from challenge-period WebMCP work.
- [`docs/hackathon-build/prd.md`](docs/hackathon-build/prd.md) — product requirements.
- [`docs/hackathon-build/spec.md`](docs/hackathon-build/spec.md) — technical specification.
- [`docs/hackathon-build/checklist.md`](docs/hackathon-build/checklist.md) — build sequence and verification plan.

## Pre-existing project vs. challenge work

FreeSpirits Real Estate existed before the WebMCP Challenge. The production marketplace already includes property publishing, multilingual content, search, user accounts, property administration, media, analytics, and other commercial functionality.

**This repository is a separate Challenge Edition.** It does not publish the complete proprietary production application.

All WebMCP-specific functionality in this repository is being developed during the challenge submission period, beginning after **August 25, 2026**. The public Git commit history provides timestamped evidence of that work.

## Architecture boundary

```text
User / AI Agent
      |
      v
WebMCP-enabled Challenge App
      |
      +--> search_properties
      +--> get_property_details
      +--> compare_properties
      +--> save_favorite
      +--> prepare_enquiry
      |
      v
Challenge-safe property provider
      |
      +--> sanitized bundled inventory (available now)
      |
      +--> optional challenge-safe remote API (future adapter)
```

The challenge layer never requires publishing production secrets, payment internals, private administration code, database credentials, or unrelated proprietary logic.

## Judging focus

The implementation is intentionally aligned with the challenge criteria:

1. **WebMCP Leverage** — five meaningful structured tools form a real multi-step agent workflow.
2. **Execution** — a visible, coherent product experience backed by automated CI rather than a schema-only proof of concept.
3. **Potential Impact** — property seekers can delegate repetitive discovery and comparison while retaining control of contact.
4. **Creativity & Ambition** — transparent preference-aware ranking plus an explicit human-agent handoff demonstrates an agent-native workflow beyond simple UI automation.

## Security principles

- No production secrets committed to this repository.
- No private database credentials committed.
- Tool inputs are narrow and validated.
- Search results are bounded.
- Property content is treated as data, not instructions.
- Private contact data is not exposed through public listing tools.
- Consequential contact remains human-controlled.
- Challenge testing must not put the production marketplace at risk.

## Challenge timeline evidence

**Repository initialized: August 27, 2026.**

Challenge work is recorded through small, timestamped commits so reviewers can audit what was created during the submission period.

## License

This Challenge Edition is released under the MIT License. See [`LICENSE`](LICENSE).
