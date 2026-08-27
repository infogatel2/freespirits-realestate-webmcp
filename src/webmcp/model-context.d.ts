export {};

type WebMCPTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => unknown | Promise<unknown>;
};

type WebMCPRegisterOptions = {
  signal?: AbortSignal;
  exposedTo?: string[];
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMCPTool, options?: WebMCPRegisterOptions) => Promise<void>;
    };
  }
}
