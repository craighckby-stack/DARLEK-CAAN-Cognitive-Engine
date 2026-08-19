export interface ProjectManifest {
  project: string;
  version: string;
  description: string;
  architecture: Record<string, string>;
  capabilities: {
    serverSide: string[];
    clientSide: string[];
  };
  deployment: {
    environment: string;
    autoScaling: boolean;
    telemetry: string;
  };
  dependencies: Record<string, string>;
}