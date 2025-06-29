import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import type { ToolNode, EdgeNode, ViewportState } from '../types';
import { ToolNodeComponent } from './ToolNode';
import { EdgeComponent } from './Edge';
import styles from './GraphCanvas.module.css';
import { calculateCenteredViewport } from './graphUtils';
import { Sidebar } from './Sidebar';

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

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Motion values for smooth interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.5);

  // Zoom constraints
  const minZoom = 0.1;
  const maxZoom = 2;

  // Sidebar width (only for desktop)
  const SIDEBAR_WIDTH = 320;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveSidebarWidth = isMobile ? 0 : SIDEBAR_WIDTH;

  // Pan and zoom handlers
  const handleWheel = useCallback((event: any) => {
    if (typeof event.preventDefault === 'function') event.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ('clientX' in event ? event.clientX : 0) - rect.left;
    const mouseY = ('clientY' in event ? event.clientY : 0) - rect.top;

    // Calculate zoom
    const zoomIntensity = 0.1;
    const deltaY = 'deltaY' in event ? event.deltaY : 0;
    const zoomFactor = deltaY > 0 ? 1 - zoomIntensity : 1 + zoomIntensity;
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
      (containerRef.current as HTMLDivElement).style.cursor = 'grabbing';
    }
  }, []);

  const handlePanEnd = useCallback(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLDivElement).style.cursor = 'grab';
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
    setSelectedNodes(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  }, []);

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

  // Center the graph on initial load, accounting for sidebar on desktop
  useEffect(() => {
    if (viewport.translateX === 0 && viewport.translateY === 0) {
      // Center the graph in the visible area
      const visibleWidth = width - effectiveSidebarWidth;
      const { scale: initialScale, translateX: centerX, translateY: centerY } = calculateCenteredViewport({
        width: visibleWidth,
        height,
        canvasWidth: 2000,
        canvasHeight: 1400,
        initialScale: 0.5
      });
      setViewport({ scale: initialScale, translateX: centerX, translateY: centerY });
      x.set(centerX);
      y.set(centerY);
      scale.set(initialScale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Find hovered node and its relationships
  const hoveredTool = nodes.find(n => n.id === hoveredNode) ?? null;
  const hoveredEdges = hoveredTool ? edges.filter(e => e.source === hoveredTool.id || e.target === hoveredTool.id) : [];

  // Default sidebar content when no tool is hovered
  const showDefaultSidebar = !hoveredTool;

  return (
    <>
      {/* Sidebar always visible */}
      <Sidebar
        tool={hoveredTool}
        edges={hoveredEdges}
        nodes={nodes}
        showDefault={showDefaultSidebar}
      />
      <div
        ref={containerRef}
        className={styles.container}
        style={{ 
          width, 
          height, 
          cursor: 'grab', 
          position: 'relative', 
          display: 'flex', 
          marginLeft: isMobile ? 0 : SIDEBAR_WIDTH 
        }}
      >
        {/* Graph area */}
        <div style={{ width: width - effectiveSidebarWidth, height, position: 'relative', overflow: 'hidden' }}>
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
                const visibleWidth = width - effectiveSidebarWidth;
                const { scale: initialScale, translateX: centerX, translateY: centerY } = calculateCenteredViewport({
                  width: visibleWidth,
                  height,
                  canvasWidth: 2000,
                  canvasHeight: 1400,
                  initialScale: 0.5
                });
                setViewport({ scale: initialScale, translateX: centerX, translateY: centerY });
                scale.set(initialScale);
                x.set(centerX);
                y.set(centerY);
              }}
            >
              Reset
            </button>
          </div>
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
              {/* SVG for all edges (below nodes) */}
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
                {visibleEdges.map(edge => {
                  const sourceSelected = selectedNodes.includes(edge.source);
                  const targetSelected = selectedNodes.includes(edge.target);
                  const sourceHovered = hoveredNode === edge.source;
                  const targetHovered = hoveredNode === edge.target;
                  let edgeState: 'default' | 'hover' | 'selected-hover' | 'selected-between' = 'default';
                  if ((sourceHovered || targetHovered) && (sourceSelected || targetSelected)) {
                    edgeState = 'selected-hover';
                  } else if (sourceHovered || targetHovered) {
                    edgeState = 'hover';
                  } else if (sourceSelected && targetSelected) {
                    edgeState = 'selected-between';
                  }
                  return (
                    <EdgeComponent
                      key={edge.id}
                      edge={edge}
                      edgeState={edgeState}
                    />
                  );
                })}
              </svg>

              {/* Nodes layer */}
              <div className={styles.nodeLayer} style={{ position: 'relative', zIndex: 2 }}>
                {visibleNodes.map(node => {
                  const isSelected = selectedNodes.includes(node.id);
                  const isHovered = hoveredNode === node.id;
                  // A node is connected if any selected node is connected to it
                  const isConnected = selectedNodes.some(selId => getConnectedNodes(selId).includes(node.id));
                  // Count dependencies (outgoing) and dependees (incoming)
                  const dependencyCount = edges.filter(e => e.source === node.id).length;
                  const dependeeCount = edges.filter(e => e.target === node.id).length;
                  return (
                    <ToolNodeComponent
                      key={node.id}
                      node={node}
                      isSelected={isSelected}
                      isHovered={isHovered}
                      isConnected={isConnected}
                      dependencyCount={dependencyCount}
                      dependeeCount={dependeeCount}
                      onClick={() => handleNodeClick(node.id)}
                      onMouseEnter={() => handleNodeHover(node.id)}
                      onMouseLeave={() => handleNodeHover(null)}
                    />
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
