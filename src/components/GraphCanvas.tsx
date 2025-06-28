import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import type { ToolNode, EdgeNode, ViewportState } from '../types';
import { ToolNodeComponent } from './ToolNode';
import { EdgeComponent } from './Edge';
import styles from './GraphCanvas.module.css';

interface GraphCanvasProps {
  nodes: ToolNode[];
  edges: EdgeNode[];
  width: number;
  height: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  width,
  height
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewport, setViewport] = useState<ViewportState>({
    scale: 0.5,
    translateX: 0,
    translateY: 0
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Motion values for smooth interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.5);

  // Zoom constraints
  const minZoom = 0.1;
  const maxZoom = 2;

  // Pan and zoom handlers
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate zoom
    const zoomIntensity = 0.1;
    const zoomFactor = event.deltaY > 0 ? 1 - zoomIntensity : 1 + zoomIntensity;
    const newScale = Math.max(minZoom, Math.min(maxZoom, viewport.scale * zoomFactor));

    // Calculate new translate to zoom towards mouse position
    const scaleChange = newScale / viewport.scale;
    const newTranslateX = mouseX - (mouseX - viewport.translateX) * scaleChange;
    const newTranslateY = mouseY - (mouseY - viewport.translateY) * scaleChange;

    setViewport({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    });

    scale.set(newScale);
    x.set(newTranslateX);
    y.set(newTranslateY);
  }, [viewport, scale, x, y]);

  // Pan handling
  const handlePanStart = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handlePanEnd = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handlePan = useCallback((_event: any, info: any) => {
    const newTranslateX = viewport.translateX + info.delta.x;
    const newTranslateY = viewport.translateY + info.delta.y;

    setViewport(prev => ({
      ...prev,
      translateX: newTranslateX,
      translateY: newTranslateY
    }));

    x.set(newTranslateX);
    y.set(newTranslateY);
  }, [viewport, x, y]);

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Handle node selection and highlighting
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  }, [selectedNode]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  // Get connected edges for highlighting
  const getConnectedEdges = useCallback((nodeId: string) => {
    return edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
  }, [edges]);

  // Get connected nodes for highlighting
  const getConnectedNodes = useCallback((nodeId: string) => {
    const connectedEdges = getConnectedEdges(nodeId);
    const connectedNodeIds = new Set<string>();

    connectedEdges.forEach(edge => {
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      } else {
        connectedNodeIds.add(edge.source);
      }
    });

    return Array.from(connectedNodeIds);
  }, [getConnectedEdges]);

  // Filter visible elements based on viewport
  const visibleNodes = nodes.filter(node => {
    const nodeX = (node.position.x * viewport.scale) + viewport.translateX;
    const nodeY = (node.position.y * viewport.scale) + viewport.translateY;
    const nodeWidth = node.dimensions.width * viewport.scale;
    const nodeHeight = node.dimensions.height * viewport.scale;

    return nodeX + nodeWidth >= -50 &&
           nodeX <= width + 50 &&
           nodeY + nodeHeight >= -50 &&
           nodeY <= height + 50;
  });

  const visibleEdges = edges.filter(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return false;

    // Simple visibility check - could be optimized
    return visibleNodes.includes(sourceNode) || visibleNodes.includes(targetNode);
  });

  // Split edges into highlighted and non-highlighted
  const highlightedEdges = visibleEdges.filter(edge => {
    const isHighlighted = (selectedNode && (edge.source === selectedNode || edge.target === selectedNode)) ||
      (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode));
    return isHighlighted;
  });
  const normalEdges = visibleEdges.filter(edge => !highlightedEdges.includes(edge));

  // Center the graph on initial load
  useEffect(() => {
    // Only center if at initial state
    if (viewport.translateX === 0 && viewport.translateY === 0) {
      const canvasWidth = 2000;
      const canvasHeight = 1400;
      const initialScale = 0.5;
      const centerX = (width - canvasWidth * initialScale) / 2;
      const centerY = (height - canvasHeight * initialScale) / 2;
      setViewport({ scale: initialScale, translateX: centerX, translateY: centerY });
      x.set(centerX);
      y.set(centerY);
      scale.set(initialScale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ width, height, cursor: 'grab' }}
    >
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={handlePanStart}
        onDragEnd={handlePanEnd}
        onDrag={handlePan}
        style={{
          width: '100%',
          height: '100%',
          x,
          y
        }}
      >
        <motion.div
          style={{
            scale,
            transformOrigin: '0 0',
            width: 2000,
            height: 1400,
            willChange: 'opacity'
          }}
        >
          {/* SVG for normal edges (below nodes) */}
          <svg
            ref={svgRef}
            className={styles.edgeLayer}
            width={2000}
            height={1400}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="var(--text-tertiary)"
                />
              </marker>
            </defs>
            {normalEdges.map(edge => {
              const isHighlighted = false;
              const isHovered = false;
              return (
                <EdgeComponent
                  key={edge.id}
                  edge={edge}
                  isHighlighted={isHighlighted}
                  isHovered={isHovered}
                />
              );
            })}
          </svg>

          {/* Nodes layer */}
          <div className={styles.nodeLayer} style={{ position: 'relative', zIndex: 2 }}>
            {visibleNodes.map(node => {
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const isConnected = selectedNode ?
                getConnectedNodes(selectedNode).includes(node.id) : false;
              return (
                <ToolNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isConnected={isConnected}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => handleNodeHover(node.id)}
                  onMouseLeave={() => handleNodeHover(null)}
                />
              );
            })}
          </div>

          {/* SVG for highlighted edges (above nodes) */}
          <svg
            className={styles.edgeLayer}
            width={2000}
            height={1400}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 3, pointerEvents: 'none' }}
          >
            {highlightedEdges.map(edge => {
              const isHighlighted = (selectedNode && (edge.source === selectedNode || edge.target === selectedNode));
              const isHovered = (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode));
              return (
                <EdgeComponent
                  key={edge.id}
                  edge={edge}
                  isHighlighted={!!isHighlighted}
                  isHovered={!!isHovered}
                />
              );
            })}
          </svg>
        </motion.div>
      </motion.div>

      {/* Zoom controls */}
      <div className={styles.controls}>
        <button
          className={styles.zoomButton}
          onClick={() => {
            const newScale = Math.min(maxZoom, viewport.scale * 1.2);
            setViewport(prev => ({ ...prev, scale: newScale }));
            scale.set(newScale);
          }}
        >
          +
        </button>
        <button
          className={styles.zoomButton}
          onClick={() => {
            const newScale = Math.max(minZoom, viewport.scale / 1.2);
            setViewport(prev => ({ ...prev, scale: newScale }));
            scale.set(newScale);
          }}
        >
          −
        </button>
        <button
          className={styles.resetButton}
          onClick={() => {
            setViewport({ scale: 0.5, translateX: 0, translateY: 0 });
            scale.set(0.5);
            x.set(0);
            y.set(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
