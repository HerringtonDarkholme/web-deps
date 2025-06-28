import { useMemo, useState, useCallback, useEffect } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { SearchBar } from './components/SearchBar';
import { calculateLayout } from './layout';
import { graphData } from './data';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Apply theme to body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
      }
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'light' : 'dark');
      };
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Filter tools based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return graphData;
    }

    const query = searchQuery.toLowerCase();
    const matchingTools = graphData.tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.category.name.toLowerCase().includes(query)
    );

    const matchingToolIds = new Set(matchingTools.map(t => t.id));

    // Include edges that connect to matching tools
    const relevantEdges = graphData.edges.filter(edge =>
      matchingToolIds.has(edge.source) || matchingToolIds.has(edge.target)
    );

    // Include all tools that are connected to matching tools
    const allRelevantToolIds = new Set(matchingToolIds);
    for (const edge of relevantEdges) {
      allRelevantToolIds.add(edge.source);
      allRelevantToolIds.add(edge.target);
    }

    const allRelevantTools = graphData.tools.filter(tool =>
      allRelevantToolIds.has(tool.id)
    );

    return {
      tools: allRelevantTools,
      edges: relevantEdges,
      categories: graphData.categories
    };
  }, [searchQuery]);

  // Calculate layout for the filtered graph
  const { nodes, edges } = useMemo(() => {
    return calculateLayout(filteredData.tools, filteredData.edges, {
      width: window.innerWidth,
      height: window.innerHeight,
      nodeWidth: 160,
      nodeHeight: 100,
      levelSpacing: 180,
      categorySpacing: 90,
      nodeSpacing: 20
    });
  }, [filteredData]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-content">
          <div className="app-title">
            <h1>Web Tools Dependency Graph</h1>
            <p>Explore the relationships between modern web development tools</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <SearchBar onSearch={handleSearch} />
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="theme-toggle-btn"
            >
              {theme === 'light' ? (
                // Sun icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
              ) : (
                // Moon icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
              )}
            </button>
          </div>
        </div>

        {searchQuery && (
          <div className="search-results-info">
            Showing {nodes.length} tools matching "{searchQuery}"
            {nodes.length !== graphData.tools.length && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      <div className="graph-container">
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          width={window.innerWidth}
          height={window.innerHeight - (searchQuery ? 140 : 120)}
        />
      </div>

      {/* Disclaimer & Credits */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 2000,
          fontSize: 13,
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          padding: '6px 16px',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 2px 8px var(--shadow-md)',
          pointerEvents: 'auto',
        }}>
          Inspired by <a href="https://github.com/yoavbls/web-chaos-graph" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>yoavbls/web-chaos-graph</a> &nbsp;|&nbsp;
          Vibe coded by <a href="https://github.com/HerringtonDarkholme/" target="_blank" rel="noopener noreferrer" style={{ color: '#f81ce5' }}>@HerringtonDarkholme</a> &nbsp;|&nbsp;
          If you like this, please give <a href="https://github.com/ast-grep/ast-grep" target="_blank" rel="noopener noreferrer" style={{ color: '#ffd93d' }}>ast-grep</a> a star!
        </span>
      </div>
    </div>
  );
}

export default App;
