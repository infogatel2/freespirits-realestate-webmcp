# FreeSpirits Real Estate WebMCP — AI Builders Hackathon 2026

## Slide 1 — Problem
Property search is repetitive and fragmented. Users repeatedly apply filters, open listings, compare details, save candidates, and prepare enquiries. Generic browser agents also have to infer meaning from changing layouts, buttons, and forms.

## Slide 2 — Solution
FreeSpirits Real Estate WebMCP exposes structured website tools that AI agents can discover and invoke directly. Humans remain in control while agents handle repetitive discovery, comparison, shortlisting, and preparation work.

## Slide 3 — Target Users
- Renters and buyers who want faster property discovery
- Students and professionals relocating to a city
- Real-estate marketplaces that want agent-native workflows
- Property platforms that need transparent AI-assisted decision support

## Slide 4 — Product Features
- Structured property search
- Stable property detail lookup
- Deterministic property comparison
- Session favorite saving
- Enquiry drafting with explicit human confirmation
- Visible agent activity throughout the workflow

## Slide 5 — Technical Architecture
User / AI Agent → WebMCP-enabled React app → five registered WebMCP tools → challenge-safe property provider → sanitized Thessaloniki demo inventory.

Core stack: React, TypeScript, Vite, Vitest, GitHub Actions, GitHub Pages, WebMCP.

## Slide 6 — AI Technologies Used
The app uses WebMCP to expose structured agent capabilities through `document.modelContext.registerTool(...)`. Compatible AI agents can call the tools directly instead of scraping or visually guessing how the interface works.

The comparison layer is intentionally deterministic rather than relying on opaque LLM scoring.

## Slide 7 — Human + AI Safety
The agent can search, inspect, compare, save, and prepare an enquiry. It cannot silently contact an advertiser. The enquiry tool always returns `requiresHumanConfirmation: true`, keeping consequential communication under human control.

## Slide 8 — Impact & Value
- Reduces repetitive property-search work
- Makes agent behavior visible and auditable
- Improves reliability over brittle UI automation
- Preserves human control for real-world actions
- Demonstrates a pattern reusable in marketplaces, CRM, travel, and business software

## Slide 9 — Live Demo
Demo request: Find renovated 2–3 bedroom apartments in Thessaloniki under €760/month, compare the best three, save my favorite, and prepare an enquiry for me to review.

Live app: https://infogatel2.github.io/freespirits-realestate-webmcp/

Demo video: https://youtu.be/VMTohINDioM

## Slide 10 — Roadmap
- Connect to a challenge-safe live property API
- Expand multilingual agent interactions
- Add richer preference dimensions
- Integrate the WebMCP layer into the production FreeSpirits Real Estate marketplace
- Extend the same human-agent architecture to other business applications
