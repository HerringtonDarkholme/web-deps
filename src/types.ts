export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  level: number;
  logo?: string;
  description?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  level: number;
  color: string;
}

export interface GraphData {
  tools: Tool[];
  edges: Edge[];
  categories: ToolCategory[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ToolNode extends Tool {
  position: Position;
  dimensions: Dimensions;
}

export interface EdgeNode extends Edge {
  sourcePosition: Position;
  targetPosition: Position;
  controlPoints?: Position[];
}

export type FocusMode = 'none' | 'blur' | 'hide'; 