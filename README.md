# FreeSpirits Real Estate — WebMCP Challenge Edition

FreeSpirits Real Estate — WebMCP Challenge Edition is a focused, open-source extension of the existing FreeSpirits Real Estate marketplace, created for **The WebMCP Challenge**.

The goal is to explore a real agent-native property discovery workflow where people and AI agents can work together through structured WebMCP tools instead of forcing an agent to infer intent from page layouts, buttons, and forms.

## Challenge vision

A user should be able to ask an agent something like:

> Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.

The website exposes structured WebMCP capabilities so the agent can perform those steps reliably while preserving human control for consequential actions.

## Planned WebMCP tools

- `search_properties` — structured search over available properties
- `get_property_details` — retrieve normalized details for one listing
- `compare_properties` — compare selected properties against user priorities
- `save_favorite` — save a selected property where the user context permits it
- `prepare_enquiry` — prepare, but do not silently send, a property enquiry for human review

## Human + agent interaction

The Challenge Edition is intentionally designed around collaboration rather than blind automation.

The agent can search, inspect, filter, summarize, compare, and prepare actions. A human remains in control of sensitive or consequential steps such as sending an enquiry.

## Pre-existing project vs. challenge work

FreeSpirits Real Estate existed before the WebMCP Challenge. The production marketplace already includes property publishing, multilingual content, search, user accounts, property administration, media, analytics, and other commercial functionality.

**This repository is a separate Challenge Edition.** It does not publish the complete proprietary production application.

All WebMCP-specific functionality in this repository is being developed during the challenge submission period, beginning after **August 25, 2026**.

See [`docs/PRE_EXISTING_VS_WEBMCP.md`](docs/PRE_EXISTING_VS_WEBMCP.md) for the formal separation of prior work and challenge work.

## Architecture principle

The Challenge Edition is designed to remain isolated from the production codebase.

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
Challenge-safe property data/API boundary
      |
      v
FreeSpirits Real Estate data or sanitized demo data
```

The challenge layer must never require publishing secrets, production credentials, payment internals, private administration code, or unrelated proprietary logic.

## Competition priorities

The implementation is being optimized around the challenge judging criteria:

1. **WebMCP Leverage** — meaningful, non-trivial WebMCP tool use.
2. **Execution** — a coherent, working product experience rather than a technical toy.
3. **Potential Impact** — a credible improvement to property discovery and decision-making.
4. **Creativity & Ambition** — a compelling example of humans and agents working together on the open web.

## Safety principles

- No production secrets committed to this repository.
- No private database credentials committed.
- Read-only operations are preferred where practical.
- Consequential write operations require clear human review/confirmation.
- Tool schemas should be narrow, explicit, validated, and easy for judges to understand.
- Challenge testing must not put the production marketplace at risk.

## Repository status

**Challenge foundation initialized: August 27, 2026.**

Implementation will be added through small, timestamped commits so the challenge-specific work is easy to audit.

## License

This Challenge Edition is released under the MIT License. See [`LICENSE`](LICENSE).
