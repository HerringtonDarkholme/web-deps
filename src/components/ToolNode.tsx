import { motion } from 'framer-motion';
import type { ToolNode } from '../types';

interface ToolNodeProps {
  node: ToolNode;
  isSelected: boolean;
  isHovered: boolean;
  isConnected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ToolNodeComponent: React.FC<ToolNodeProps> = ({
  node,
  isSelected,
  isHovered,
  isConnected,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  // Handle missing logos gracefully
  const logoSrc = node.logo || '/logos/default.svg';
  
  return (
    <motion.div
      className="tool-node"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isSelected ? 1.08 : 1,
        y: isSelected ? -4 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: node.dimensions.width,
        height: node.dimensions.height,
        background: isSelected 
          ? `linear-gradient(135deg, ${node.category.color}22, ${node.category.color}11)`
          : isHovered 
            ? `linear-gradient(135deg, ${node.category.color}15, ${node.category.color}08)`
            : 'var(--bg-secondary)',
        border: isSelected 
          ? `2px solid ${node.category.color}` 
          : isHovered 
            ? `1px solid ${node.category.color}80`
            : `1px solid var(--border-primary)`,
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        boxShadow: isSelected
          ? `0 8px 32px ${node.category.color}30, 0 4px 16px rgba(0, 0, 0, 0.3)`
          : isHovered 
            ? `0 4px 16px ${node.category.color}20, 0 2px 8px rgba(0, 0, 0, 0.2)`
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        fontSize: '11px',
        fontWeight: '500',
        opacity: isConnected ? 1 : (isSelected ? 1 : 0.85),
        backdropFilter: 'blur(10px)',
        userSelect: 'none'
      }}
    >
      {/* Logo */}
      <div style={{ 
        width: '24px', 
        height: '24px', 
        marginBottom: '6px',
        background: `linear-gradient(135deg, ${node.category.color}, ${node.category.color}CC)`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#ffffff'
      }}>
        {/* Fallback to first letter if logo fails to load */}
        <img 
          src={logoSrc} 
          alt={node.name}
          style={{ width: '20px', height: '20px' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const nextElement = e.currentTarget.nextElementSibling;
            if (nextElement && nextElement instanceof HTMLSpanElement) {
              nextElement.style.display = 'block';
            }
          }}
        />
        <span style={{ display: 'none' }}>
          {node.name.charAt(0).toUpperCase()}
        </span>
      </div>
      
      {/* Tool Name */}
      <div style={{ 
        fontWeight: '600', 
        marginBottom: '2px',
        textAlign: 'center',
        lineHeight: '1.2',
        fontSize: '12px',
        color: '#ffffff'
      }}>
        {node.name}
      </div>
      
      {/* Category */}
      <div style={{ 
        fontSize: '9px', 
        opacity: 0.7,
        textAlign: 'center',
        color: node.category.color,
        fontWeight: '500'
      }}>
        {node.category.name}
      </div>
    </motion.div>
  );
}; 