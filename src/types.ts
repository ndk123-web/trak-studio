export interface StatusModel {
  id: string;
  name: string;
  version: string;
  template_version: string;
  created_at: string;
  template: string;
  progress?: number;
  author: string;
  source: string;
  repository?: string;
  module_breakdown: Record<string, boolean>;
}

export interface WorkspaceInfo {
  cwd: string;
  hasTrakJson: boolean;
  activeTrack?: string;
  totalFiles?: number;
  totalModules?: number;
  completedModules?: number;
}

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  size?: number;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
  extension: string;
  size: number;
}

export interface VerifyResult {
  module: string;
  passed: boolean;
  output: string;
  durationMs: number;
  timestamp: string;
}
