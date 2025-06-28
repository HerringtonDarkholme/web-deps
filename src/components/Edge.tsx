import type React from 'react';
import type { EdgeNode } from '../types';

interface EdgeProps {
  edge: EdgeNode;
  isHighlighted: boolean;
  isHovered: boolean;
}

export const EdgeComponent: React.FC<EdgeProps> = ({
  edge,
  isHighlighted,
  isHovered
}) => {
  const { sourcePosition, targetPosition, controlPoints } = edge;
  
  // Create path for curved edge
  const createPath = () => {
    if (controlPoints && controlPoints.length >= 2) {
      const [cp1, cp2] = controlPoints;
      return `M ${sourcePosition.x} ${sourcePosition.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${targetPosition.x} ${targetPosition.y}`;
    }
    
    // Fallback to simple curved path
    const midY = (sourcePosition.y + targetPosition.y) / 2;
    const cp1 = { x: sourcePosition.x, y: midY };
    const cp2 = { x: targetPosition.x, y: midY };
    return `M ${sourcePosition.x} ${sourcePosition.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${targetPosition.x} ${targetPosition.y}`;
  };

  const strokeColor = isHighlighted 
    ? '#0070f3' 
    : isHovered 
      ? 'rgba(255, 255, 255, 0.6)' 
      : 'rgba(255, 255, 255, 0.15)';
  
  const strokeWidth = isHighlighted ? 2.5 : isHovered ? 1.5 : 1;
  const opacity = isHighlighted || isHovered ? 1 : 0.4;

  return (
    <g>
      {/* Glow effect for highlighted edges */}
      {isHighlighted && (
        <path
          d={createPath()}
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          fill="none"
          opacity={0.3}
          filter="blur(2px)"
        />
      )}
      
      {/* Main edge */}
      <path
        d={createPath()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        markerEnd="url(#arrowhead)"
        strokeDasharray={isHovered ? "4 2" : "none"}
        style={{
          transition: 'all 0.2s ease',
        }}
      />
      
      {/* Edge label */}
      {edge.label && (isHighlighted || isHovered) && (
        <g>
          {/* Label background */}
          <rect
            x={(sourcePosition.x + targetPosition.x) / 2 - (edge.label.length * 3)}
            y={(sourcePosition.y + targetPosition.y) / 2 - 10}
            width={edge.label.length * 6}
            height={16}
            fill="var(--bg-primary)"
            stroke="var(--border-primary)"
            strokeWidth="0.5"
            rx="4"
            opacity={0.95}
          />
          
          {/* Label text */}
          <text
            x={(sourcePosition.x + targetPosition.x) / 2}
            y={(sourcePosition.y + targetPosition.y) / 2 - 2}
            textAnchor="middle"
            fontSize="8"
            fill="var(--text-primary)"
            fontWeight="500"
            opacity={1}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}; 