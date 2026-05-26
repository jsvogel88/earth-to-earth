import React from 'react';
import RouteOptimizerPanel from '../components/RouteOptimizerPanel.jsx';
import '../styles/route-optimizer-page.css';

export default function RouteOptimizerPage() {
  return (
    <div className="route-optimizer-page">
      <header className="route-optimizer-page__header">
        <div>
          <h1 className="route-optimizer-page__title">Route Optimizer</h1>
          <p className="route-optimizer-page__subtitle">
            Starship E2E network analysis — separate from the live network map for now.
          </p>
        </div>
        <p className="route-optimizer-page__notice">
          The Network Map still uses default B2B hubs and hyperloop destinations. Applying optimizer
          results to the map is not enabled yet.
        </p>
      </header>
      <main className="route-optimizer-page__main">
        <RouteOptimizerPanel variant="page" />
      </main>
    </div>
  );
}
