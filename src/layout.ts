import * as d3 from 'd3';
import type { Tool, Edge, ToolNode, EdgeNode, Position } from './types';

export interface LayoutConfig {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  levelSpacing: number;
  categorySpacing: number;
  nodeSpacing: number;
}

const defaultConfig: LayoutConfig = {
  width: 2000,
  height: 1400,
  nodeWidth: 140,
  nodeHeight: 60,
  levelSpacing: 200,
  categorySpacing: 100,
  nodeSpacing: 20,
};

export function calculateLayout(
  tools: Tool[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): { nodes: ToolNode[]; edges: EdgeNode[] } {
  const layoutConfig = { ...defaultConfig, ...config };
  
  // Group tools by level and category
  const toolsByLevel = d3.group(tools, d => d.level);
  const levels = Array.from(toolsByLevel.keys()).sort((a, b) => a - b);
  
  const nodes: ToolNode[] = [];
  
  // Calculate positions for each level
  levels.forEach((level, levelIndex) => {
    const levelTools = toolsByLevel.get(level) || [];
    const toolsByCategory = d3.group(levelTools, d => d.category.id);
    const categories = Array.from(toolsByCategory.keys());
    
    // Calculate Y position for this level
    const baseY = 100 + levelIndex * layoutConfig.levelSpacing;
    
    // Calculate total width needed for this level
    const totalCategoriesWidth = categories.reduce((total, categoryId) => {
      const categoryTools = toolsByCategory.get(categoryId) || [];
      const categoryWidth = categoryTools.length * (layoutConfig.nodeWidth + layoutConfig.nodeSpacing) - layoutConfig.nodeSpacing;
      return total + categoryWidth + layoutConfig.categorySpacing;
    }, 0) - layoutConfig.categorySpacing;
    
    // Start X position to center the level
    let currentX = (layoutConfig.width - totalCategoriesWidth) / 2;
    
    // Position tools within each category
    categories.forEach(categoryId => {
      const categoryTools = toolsByCategory.get(categoryId) || [];
      
      categoryTools.forEach((tool, toolIndex) => {
        const x = currentX + toolIndex * (layoutConfig.nodeWidth + layoutConfig.nodeSpacing);
        const y = baseY;
        
        nodes.push({
          ...tool,
          position: { x, y },
          dimensions: { width: layoutConfig.nodeWidth, height: layoutConfig.nodeHeight }
        });
      });
      
      // Move to next category position
      const categoryWidth = categoryTools.length * (layoutConfig.nodeWidth + layoutConfig.nodeSpacing) - layoutConfig.nodeSpacing;
      currentX += categoryWidth + layoutConfig.categorySpacing;
    });
  });
  
  // Create a map for quick node lookup
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  // Calculate edge positions and control points
  const edgeNodes: EdgeNode[] = edges.map((edge, index) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) {
      console.warn(`Edge ${edge.id}: Missing node for edge ${edge.source} -> ${edge.target}`);
      return {
        ...edge,
        sourcePosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 }
      };
    }
    
    // Calculate connection points (bottom of source, top of target)
    const sourcePosition: Position = {
      x: sourceNode.position.x + sourceNode.dimensions.width / 2,
      y: sourceNode.position.y + sourceNode.dimensions.height
    };
    
    const targetPosition: Position = {
      x: targetNode.position.x + targetNode.dimensions.width / 2,
      y: targetNode.position.y
    };
    
    // Calculate control points for curved edges
    const controlPoints = calculateControlPoints(sourcePosition, targetPosition);
    
    return {
      ...edge,
      sourcePosition,
      targetPosition,
      controlPoints
    };
  });
  
  return { nodes, edges: edgeNodes };
}

function calculateControlPoints(source: Position, target: Position): Position[] {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  
  // For a smooth cubic bezier curve
  const controlOffset = Math.min(Math.abs(dy) * 0.5, 100);
  
  const cp1: Position = {
    x: source.x,
    y: source.y + controlOffset
  };
  
  const cp2: Position = {
    x: target.x,
    y: target.y - controlOffset
  };
  
  return [cp1, cp2];
}

// Force-directed layout alternative for better edge management
export function calculateForceLayout(
  tools: Tool[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): { nodes: ToolNode[]; edges: EdgeNode[] } {
  const layoutConfig = { ...defaultConfig, ...config };
  
  // Create nodes with initial positions based on levels
  const nodes: ToolNode[] = tools.map(tool => ({
    ...tool,
    position: {
      x: Math.random() * layoutConfig.width,
      y: 100 + (tool.level - 1) * 120 + Math.random() * 60
    },
    dimensions: { width: layoutConfig.nodeWidth, height: layoutConfig.nodeHeight }
  }));
  
  // Create simulation
  const simulation = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(layoutConfig.width / 2, layoutConfig.height / 2))
    .force('collision', d3.forceCollide().radius(layoutConfig.nodeWidth / 2 + 10))
    .force('y', d3.forceY().y((d: any) => 100 + (d.level - 1) * 120).strength(0.5));
  
  // Run simulation
  for (let i = 0; i < 300; ++i) simulation.tick();
  
  // Update positions from simulation
  nodes.forEach((node, i) => {
    const simNode = simulation.nodes()[i] as any;
    node.position = { x: simNode.x, y: simNode.y };
  });
  
  // Calculate edges
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edgeNodes: EdgeNode[] = edges.map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) {
      return {
        ...edge,
        sourcePosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 }
      };
    }
    
    const sourcePosition: Position = {
      x: sourceNode.position.x + sourceNode.dimensions.width / 2,
      y: sourceNode.position.y + sourceNode.dimensions.height / 2
    };
    
    const targetPosition: Position = {
      x: targetNode.position.x + targetNode.dimensions.width / 2,
      y: targetNode.position.y + targetNode.dimensions.height / 2
    };
    
    return {
      ...edge,
      sourcePosition,
      targetPosition,
      controlPoints: calculateControlPoints(sourcePosition, targetPosition)
    };
  });
  
  return { nodes, edges: edgeNodes };
} 