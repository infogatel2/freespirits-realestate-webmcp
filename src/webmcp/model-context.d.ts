export {};

type WebMCPToolAnnotations = {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
};

type WebMCPTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
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
