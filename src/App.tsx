import { useEffect, useMemo, useState } from 'react';
import type { PropertySummary } from './domain/property';
import { registerWebMCPTools } from './webmcp/registerTools';

const demoPrompt = 'Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.';

export default function App() {
  const [results, setResults] = useState<PropertySummary[]>([]);
  const [activity, setActivity] = useState<string[]>(['Challenge Edition loaded.']);
  const webMCPAvailable = useMemo(() => typeof document !== 'undefined' && Boolean(document.modelContext), []);

  useEffect(() => {
    let cleanup: () => void = () => undefined;
    let active = true;

    registerWebMCPTools({
      onActivity: (message) => active && setActivity((items) => [message, ...items].slice(0, 8)),
      onSearchResults: (items) => active && setResults(items),
    }).then((dispose) => {
      if (!active) dispose();
      else cleanup = dispose;
    }).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unknown WebMCP registration error.';
      setActivity((items) => [`WebMCP registration failed: ${message}`, ...items]);
    });

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">THE WEBMCP CHALLENGE · CHALLENGE EDITION</p>
          <h1>FreeSpirits Real Estate</h1>
          <p className="lead">Property discovery designed for humans and agents to work together.</p>
        </div>
        <div className={`status ${webMCPAvailable ? 'ready' : 'waiting'}`}>
          <span className="dot" />
          {webMCPAvailable ? 'WebMCP detected' : 'WebMCP-capable browser required'}
        </div>
      </header>

      <section className="prompt-card">
        <p className="label">Headline demo request</p>
        <blockquote>{demoPrompt}</blockquote>
        <p className="hint">Open this page in a WebMCP-enabled browser/agent and use the request above. The first tools are already exposed directly from the page.</p>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="label">Agent-visible inventory</p>
              <h2>Search results</h2>
            </div>
            <span className="count">{results.length}</span>
          </div>

          {results.length === 0 ? (
            <div className="empty">No agent search has run yet. Invoke <code>search_properties</code> to populate this view.</div>
          ) : (
            <div className="cards">
              {results.map((property) => (
                <article className="property-card" key={property.id}>
                  <div className="property-topline"><span>{property.neighborhood}</span><strong>€{property.price}/mo</strong></div>
                  <h3>{property.title}</h3>
                  <p>{property.areaSqm} m² · {property.bedrooms} bedrooms · {property.renovated ? 'Renovated' : 'Not renovated'}</p>
                  <div className="chips">{property.features.slice(0, 3).map((feature) => <span key={feature}>{feature}</span>)}</div>
                  <footer><code>{property.id}</code></footer>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="panel activity-panel">
          <p className="label">Human + agent collaboration</p>
          <h2>Activity</h2>
          <ol className="activity-list">
            {activity.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ol>
          <div className="tool-list">
            <p className="label">Registered now</p>
            <code>search_properties</code>
            <code>get_property_details</code>
          </div>
        </aside>
      </section>

      <footer className="page-footer">
        <span>Challenge-safe demo data · no production secrets</span>
        <span>Human confirmation will be required for enquiries</span>
      </footer>
    </main>
  );
}
