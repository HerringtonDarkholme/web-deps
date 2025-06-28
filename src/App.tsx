import { useMemo, useState, useCallback } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { SearchBar } from './components/SearchBar';
import { calculateLayout } from './layout';
import { graphData } from './data';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

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
      width: 2000,
      height: 1400,
      nodeWidth: 160,
      nodeHeight: 80,
      levelSpacing: 180,
      categorySpacing: 80,
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
          
          <SearchBar onSearch={handleSearch} />
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
          color: 'rgba(255,255,255,0.6)',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          background: 'rgba(10,10,10,0.85)',
          borderRadius: 8,
          padding: '6px 16px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
