import { useEffect, useState } from 'react';
import FuturisticTransportMap from './components/FuturisticTransportMap';
import AppNavBar from './components/AppNavBar';
import RouteOptimizerPage from './pages/RouteOptimizerPage';
import { readStoredLayoutMode, LAYOUT_STORAGE_KEY } from './layout/layoutModes';
import { APP_PAGES } from './navigation/appPages';
import './styles/app-nav.css';
import './styles/transport-layout.css';
import './App.css';

function App() {
  const [page, setPage] = useState(APP_PAGES.MAP);
  const [layoutMode, setLayoutMode] = useState(readStoredLayoutMode);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.layout = layoutMode;
  }, [layoutMode]);

  return (
    <div className={`app-viewport layout-${layoutMode}`}>
      <AppNavBar page={page} onPageChange={setPage} />
      {page === APP_PAGES.MAP ? (
        <div className="app-shell app-shell--map">
          <FuturisticTransportMap layoutMode={layoutMode} onLayoutModeChange={setLayoutMode} />
        </div>
      ) : (
        <RouteOptimizerPage />
      )}
    </div>
  );
}

export default App;
