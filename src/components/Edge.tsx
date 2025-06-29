import type { EdgeNode } from '../types';

interface EdgeProps {
  edge: EdgeNode;
  edgeState: 'default' | 'hover' | 'selected-hover' | 'selected-between';
}

export const EdgeComponent: React.FC<EdgeProps> = ({
  edge,
  edgeState
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

  // Edge color logic
  let strokeColor = 'var(--edge-color, rgba(60,60,60,0.25))';
  let strokeWidth = 1;
  let opacity = 0.4;
  if (edgeState === 'hover') {
    strokeColor = 'var(--edge-hover-color, rgba(60,60,60,0.6))';
    strokeWidth = 1.5;
    opacity = 1;
  } else if (edgeState === 'selected-hover' || edgeState === 'selected-between') {
    strokeColor = 'var(--edge-highlight-color, #0070f3)';
    strokeWidth = 2.5;
    opacity = 1;
  }

  return (
    <g>
      {/* Glow effect for blue edges */}
      {(edgeState === 'selected-hover' || edgeState === 'selected-between') && (
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
        strokeDasharray={edgeState === 'hover' ? "4 2" : "none"}
        style={{
          transition: 'all 0.2s ease',
        }}
      />

      {/* Edge label */}
      {edge.label && (edgeState === 'hover' || edgeState === 'selected-hover' || edgeState === 'selected-between') && (
        <g>
          {/* Label background */}
          <rect
            x={(sourcePosition.x + targetPosition.x) / 2 - (edge.label.length * 3)}
            y={(sourcePosition.y + targetPosition.y) / 2 - 10}
            width={edge.label.length * 6}
            height={16}
            fill="var(--bg-primary, #fff)"
            stroke="var(--border-primary, #d0d7de)"
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
            fill="var(--text-primary, #222)"
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