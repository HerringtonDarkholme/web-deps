import type { ToolNode, EdgeNode } from '../types';

interface SidebarProps {
  tool: ToolNode | null;
  edges: EdgeNode[];
  nodes: ToolNode[];
  showDefault?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ tool, edges, nodes, showDefault }) => {
  if (showDefault) {
    return (
      <aside style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 320,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1.5px solid var(--border-primary)',
        boxShadow: '2px 0 16px rgba(0,0,0,0.07)',
        zIndex: 2000,
        padding: '32px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        transition: 'transform 0.2s',
        color: 'var(--text-primary)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Web Tools Dependency Graph</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18, textWrap: 'pretty' }}>
          Explore the relationships between modern web development tools. Hover over a node to see details and connections.
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>How to use</div>
        <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
          <li>Hover a node to see its details and relationships.</li>
          <li>Drag the canvas to pan around.</li>
          <li>Use the zoom buttons or scroll to zoom in/out.</li>
          <li>Click a node to select it and highlight its connections.</li>
          <li>Use the theme toggle in the header to switch between light and dark mode.</li>
        </ul>
      </aside>
    );
  }

  if (!tool) return null;
  const logoSrc = tool.logo || '/logos/default.svg';
  return (
    <aside style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 320,
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1.5px solid var(--border-primary)',
      boxShadow: '2px 0 16px rgba(0,0,0,0.07)',
      zIndex: 2000,
      padding: '32px 24px 24px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      transition: 'transform 0.2s',
      color: 'var(--text-primary)'
    }}>
      {/* Logo */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '16px',
        border: `2.5px solid ${tool.category.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        background: 'transparent',
        overflow: 'hidden',
      }}>
        <img src={logoSrc} alt={tool.name} style={{ width: 48, height: 48 }} />
      </div>
      {/* Name & Category */}
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>{tool.name}</div>
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
    </aside>
  );
};
