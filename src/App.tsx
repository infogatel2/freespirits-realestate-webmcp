import { useEffect, useMemo, useState } from 'react';
import type { PropertyComparison } from './domain/comparison';
import type { EnquiryDraft } from './domain/enquiry';
import type { PropertySummary } from './domain/property';
import { registerWebMCPTools } from './webmcp/registerTools';

const demoPrompt = 'Find renovated 2–3 bedroom apartments in Thessaloniki under €750/month, compare the best three, save my favorite, and prepare an enquiry for me to review.';

export default function App() {
  const [results, setResults] = useState<PropertySummary[]>([]);
  const [comparison, setComparison] = useState<PropertyComparison | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [enquiry, setEnquiry] = useState<EnquiryDraft | null>(null);
  const [activity, setActivity] = useState<string[]>(['Challenge Edition loaded.']);
  const webMCPAvailable = useMemo(() => typeof document !== 'undefined' && Boolean(document.modelContext), []);

  useEffect(() => {
    let cleanup: () => void = () => undefined;
    let active = true;

    registerWebMCPTools({
      onActivity: (message) => active && setActivity((items) => [message, ...items].slice(0, 8)),
      onSearchResults: (items) => active && setResults(items),
      onComparison: (value) => active && setComparison(value),
      onFavorite: (result) => active && setFavoriteCount(result.favoriteCount),
      onEnquiry: (draft) => active && setEnquiry(draft),
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
        <div className="header-badges">
          <div className={`status ${webMCPAvailable ? 'ready' : 'waiting'}`}>
            <span className="dot" />
            {webMCPAvailable ? 'WebMCP detected' : 'WebMCP-capable browser required'}
          </div>
          <div className="status">★ {favoriteCount} favorites</div>
        </div>
      </header>

      <section className="prompt-card">
        <p className="label">Headline demo request</p>
        <blockquote>{demoPrompt}</blockquote>
        <p className="hint">Open this page in a WebMCP-enabled browser/agent and use the request above. Tool calls visibly update the product while consequential contact remains under human control.</p>
      </section>

      <section className="grid">
        <div className="stack">
          <div className="panel">
            <div className="panel-heading">
              <div><p className="label">Agent-visible inventory</p><h2>Search results</h2></div>
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

          <div className="panel">
            <p className="label">Transparent decision support</p>
            <h2>Agent comparison</h2>
            {!comparison ? (
              <div className="empty">Invoke <code>compare_properties</code> after searching to see a deterministic, priority-aware ranking here.</div>
            ) : (
              <div className="ranking">
                <div className="priority-line">Priorities: {comparison.priorities.join(' · ')}</div>
                {comparison.ranking.map((item, index) => (
                  <article className="rank-row" key={item.propertyId}>
                    <span className="rank-number">#{index + 1}</span>
                    <div className="rank-copy">
                      <strong>{item.title}</strong>
                      <small>{item.strengths.length ? `Strengths: ${item.strengths.join(', ')}` : 'Balanced profile'}{item.tradeoffs.length ? ` · Tradeoffs: ${item.tradeoffs.join(', ')}` : ''}</small>
                    </div>
                    <span className="score">{item.score}</span>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="panel enquiry-panel">
            <p className="label">Human-controlled next step</p>
            <h2>Enquiry review</h2>
            {!enquiry ? (
              <div className="empty">Invoke <code>prepare_enquiry</code> for a chosen property. The tool will prepare a draft, never send it.</div>
            ) : (
              <div className="enquiry-card">
                <div className="confirmation-pill">Human confirmation required</div>
                <h3>{enquiry.propertyTitle}</h3>
                <p>{enquiry.message}</p>
                <div className="enquiry-meta">
                  {enquiry.name && <span>Name: {enquiry.name}</span>}
                  {enquiry.email && <span>Email: {enquiry.email}</span>}
                  {enquiry.phone && <span>Phone: {enquiry.phone}</span>}
                </div>
                <button type="button" disabled title="Challenge Edition intentionally does not auto-send enquiries">Review only — sending disabled in challenge demo</button>
              </div>
            )}
          </div>
        </div>

        <aside className="panel activity-panel">
          <p className="label">Human + agent collaboration</p>
          <h2>Activity</h2>
          <ol className="activity-list">{activity.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
          <div className="tool-list">
            <p className="label">Registered now</p>
            <code>search_properties</code>
            <code>get_property_details</code>
            <code>compare_properties</code>
            <code>save_favorite</code>
            <code>prepare_enquiry</code>
          </div>
        </aside>
      </section>

      <footer className="page-footer">
        <span>Challenge-safe demo data · no production secrets</span>
        <span>Five WebMCP tools · human confirmation for enquiry</span>
      </footer>
    </main>
  );
}
