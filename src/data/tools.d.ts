declare module '@data/tools' {
  interface Tool {
    name: string;
    path: string;
    description: string;
    icon?: string;
  }

  interface ToolCategory {
    id: string;
    name: string;
    path: string;
    icon: string;
    tools: Tool[];
  }

  const toolCategories: ToolCategory[];
  export { Tool, ToolCategory, toolCategories };
} 