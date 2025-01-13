export interface Tool {
  name: string;
  path: string;
  description: string;
  icon?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  path: string;
  icon: string;
  tools: Tool[];
} 