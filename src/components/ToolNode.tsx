import { motion } from 'framer-motion';
import type { ToolNode } from '../types';
import styles from './ToolNode.module.css';

interface ToolNodeProps {
  node: ToolNode;
  isSelected: boolean;
  isHovered: boolean;
  isConnected: boolean;
  dependencyCount: number;
  dependeeCount: number;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  blurOut?: boolean;
}

export const ToolNodeComponent: React.FC<ToolNodeProps> = ({
  node,
  isSelected,
  isHovered,
  isConnected,
  dependencyCount,
  dependeeCount,
  onClick,
  onMouseEnter,
  onMouseLeave,
  blurOut = false
}) => {
  // Handle missing logos gracefully
  const logoSrc = node.logo || '/logos/default.svg';

  const connectionCount = dependencyCount + dependeeCount;

  return (
    <motion.div
      className={styles.toolNode}
      id={`tool-node-${node.id}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{
        scale: 1.05,
        y: -2,
        rotate: [-1, 1],
      }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isSelected ? 1.08 : 1,
        y: isSelected ? -4 : 0,
        rotate: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        rotate: {
          repeat: Infinity,
          repeatType: 'mirror',
          duration: 0.2,
        }
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
            : "1px solid var(--border-primary)",
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
        filter: blurOut ? 'blur(2.5px) grayscale(0.7)' : undefined,
        opacity: blurOut ? 0.35 : (isConnected ? 1 : (isSelected ? 1 : 0.85)),
        backdropFilter: 'blur(15px)',
        userSelect: 'none',
        overflow: 'visible'
      }}
    >
      {/* Logo */}
      <div className={styles.logoContainer} style={{
        border: `2px solid ${node.category.color}`,
      }}>
        {/* Fallback to first letter if logo fails to load */}
        <img
          src={logoSrc}
          alt={node.name}
          className={styles.logoImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const nextElement = target.nextElementSibling as HTMLElement | null;
            if (nextElement) {
              nextElement.style.display = 'block';
            }
          }}
        />
        <span className={styles.logoFallback}>
          {node.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Tool Name and Connections */}
      <div className={styles.nameContainer}>
        <span>{node.name}</span>
        <span
          className={styles.connectionCount}
          style={{
            background: (isHovered || isSelected) ? node.category.color : 'transparent',
            color: (isHovered || isSelected) ? '#fff' : node.category.color,
            border: `1.2px solid ${node.category.color}`,
          }}
        >
          {connectionCount}
        </span>
      </div>

      {/* Category */}
      <div className={styles.category} style={{
        color: node.category.color,
      }}>
        {node.category.name}
      </div>
    </motion.div>
  );
};
