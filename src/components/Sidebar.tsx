import type { ToolNode, EdgeNode } from '../types';
import { useState, useEffect } from 'react';

interface SidebarProps {
  tool: ToolNode | null;
  edges: EdgeNode[];
  nodes: ToolNode[];
  showDefault?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ tool, edges, nodes, showDefault }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  
  // Base styles for both desktop and mobile
  const baseStyles = {
    background: 'var(--bg-secondary)',
    boxShadow: '2px 0 16px rgba(0,0,0,0.07)',
    padding: '32px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 18,
    transition: 'transform 0.2s',
    color: 'var(--text-primary)'
  };

  // Desktop styles (left sidebar)
  const desktopStyles = {
    ...baseStyles,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: 320,
    height: '100%',
    borderRight: '1.5px solid var(--border-primary)',
    zIndex: 2000,
  };

  // Mobile styles (bottom sheet)
  const mobileStyles = {
    ...baseStyles,
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxHeight: '70vh',
    borderTop: '1.5px solid var(--border-primary)',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    overflowY: 'auto' as const,
    padding: '16px 20px 24px 20px',
    zIndex: 2100,
    transform: isCollapsed ? 'translateY(calc(100% - 60px))' : 'translateY(0)',
    transition: 'transform 0.3s ease-in-out',
  };

  // Determine if mobile based on window width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const currentStyles = isMobile ? mobileStyles : desktopStyles;

  // Collapse by default on mobile only on mount
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const handleToggleCollapse = () => {
    if (isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleCollapse();
    }
  };

  if (showDefault) {
    return (
      <aside style={currentStyles}>
        {/* Mobile handle */}
        {isMobile && (
          <div 
            onClick={handleToggleCollapse}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHandleHovered(true)}
            onMouseLeave={() => setIsHandleHovered(false)}
            tabIndex={0}
            role="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              width: 40,
              height: 4,
              background: 'var(--text-tertiary)',
              borderRadius: 2,
              margin: '0 auto 16px auto',
              opacity: isHandleHovered ? 0.8 : 0.5,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
          />
        )}
        {(!isMobile || !isCollapsed) && (
          <>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 20, marginBottom: 8 }}>Web Tools Dependency Graph</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
              Explore the relationships between modern web development tools. Hover over a node to see details and connections.
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>How to use</div>
            <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              <li>{isMobile ? 'Tap' : 'Hover'} a node to see its details and relationships.</li>
              <li>Drag the canvas to pan around.</li>
              <li>Use the zoom buttons or {isMobile ? 'pinch' : 'scroll'} to zoom in/out.</li>
              <li>{isMobile ? 'Tap' : 'Click'} a node to select it and highlight its connections.</li>
              <li>Use the theme toggle in the header to switch between light and dark mode.</li>
            </ul>
          </>
        )}
      </aside>
    );
  }

  if (!tool) return null;
  const logoSrc = tool.logo || '/logos/default.svg';
  return (
    <aside style={currentStyles}>
      {/* Mobile handle */}
      {isMobile && (
        <div 
          onClick={handleToggleCollapse}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHandleHovered(true)}
          onMouseLeave={() => setIsHandleHovered(false)}
          tabIndex={0}
          role="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: 40,
            height: 4,
            background: 'var(--text-tertiary)',
            borderRadius: 2,
            margin: '0 auto 16px auto',
            opacity: isHandleHovered ? 0.8 : 0.5,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        />
      )}
      {(!isMobile || !isCollapsed) && (
        <>
          {/* Logo */}
          <div style={{
            width: isMobile ? 48 : 64,
            height: isMobile ? 48 : 64,
            borderRadius: isMobile ? '12px' : '16px',
            border: `2.5px solid ${tool.category.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            background: 'transparent',
            overflow: 'hidden',
          }}>
            <img src={logoSrc} alt={tool.name} style={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48 }} />
          </div>
          {/* Name & Category */}
          <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 20, marginBottom: 2 }}>{tool.name}</div>
          <div style={{ fontSize: 13, color: tool.category.color, fontWeight: 600, marginBottom: 8 }}>{tool.category.name}</div>
          {/* Description */}
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>{tool.description}</div>
          {/* Connections */}
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Connections ({edges.length})</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {edges.length === 0 && <li style={{ color: 'var(--text-tertiary)' }}>No connections</li>}
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              return (
                <li key={edge.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: source.category.color }}>{source.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 4px' }}>{edge.label.toLowerCase()}</span>
                  <span style={{ fontWeight: 500, fontSize: 13, color: target.category.color }}>{target.name}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
};
