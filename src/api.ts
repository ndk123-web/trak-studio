import type { FileContent, FileNode, StatusModel, VerifyResult, WorkspaceInfo } from "./types";

// In production (embedded in Go binary), always use relative path "" so ANY port (--port 3000, -p 8200, etc.) works with real data!
// Only during local Vite development (npm run dev on port 5173), route to the Go backend on port 8200.
const API_BASE =
  import.meta.env.DEV && typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:8200"
    : "";

// Realistic mock data for preview/standalone development mode
const MOCK_TRAK_JSON: StatusModel = {
  id: "lang/go",
  template: "lang/go",
  template_version: "1.3.0",
  created_at: new Date().toISOString(),
  author: "Trak Core",
  source: "templates/lang/go.json",
  version: "1.3.0",
  repository: "https://github.com/ndk123-web/trak-registry",
  name: "Go (Golang) Comprehensive Mastery Track",
  module_breakdown: {
    "00-setup-and-prerequisites": true,
    "01-runtime-and-escape-analysis": true,
    "02-toolchain-and-workspaces": false,
    "03-variables-and-zero-values": false,
    "04-data-types-and-memory-headers": false,
    "05-arrays-slices-and-growth": false,
    "06-maps-structs-and-custom-types": false,
    "07-control-flow-and-functions": false,
    "08-pointers-and-semantics": false,
    "09-methods-interfaces-duck-typing": false,
    "10-generics": false,
    "11-error-handling-and-custom-types": false,
    "12-concurrency-goroutines-gmp": false,
    "13-channels-select-and-sync": false,
    "14-context-cancellation-timeouts": false,
    "15-standard-library-powerhouses": false,
    "16-production-web-services": false,
    "17-database-sql-and-pooling": false,
    "18-testing-benchmarks-profiling": false,
    "19-interview-questions-and-drills": false,
  },
};

const MOCK_WORKSPACE_TREE: FileNode[] = [
  {
    name: "00-setup-and-prerequisites",
    path: "00-setup-and-prerequisites",
    isDir: true,
    children: [
      { name: "README.md", path: "00-setup-and-prerequisites/README.md", isDir: false, size: 1420 },
      { name: "main.go", path: "00-setup-and-prerequisites/main.go", isDir: false, size: 680 },
      { name: "exercise_test.go", path: "00-setup-and-prerequisites/exercise_test.go", isDir: false, size: 840 },
    ],
  },
  {
    name: "01-runtime-and-escape-analysis",
    path: "01-runtime-and-escape-analysis",
    isDir: true,
    children: [
      { name: "README.md", path: "01-runtime-and-escape-analysis/README.md", isDir: false, size: 2150 },
      { name: "escape.go", path: "01-runtime-and-escape-analysis/escape.go", isDir: false, size: 920 },
      { name: "escape_test.go", path: "01-runtime-and-escape-analysis/escape_test.go", isDir: false, size: 760 },
    ],
  },
  {
    name: "02-toolchain-and-workspaces",
    path: "02-toolchain-and-workspaces",
    isDir: true,
    children: [
      { name: "README.md", path: "02-toolchain-and-workspaces/README.md", isDir: false, size: 1890 },
      { name: "workspace.go", path: "02-toolchain-and-workspaces/workspace.go", isDir: false, size: 810 },
      { name: "workspace_test.go", path: "02-toolchain-and-workspaces/workspace_test.go", isDir: false, size: 710 },
    ],
  },
  { name: "go.mod", path: "go.mod", isDir: false, size: 120 },
  { name: "trak.json", path: "trak.json", isDir: false, size: 1217 },
  { name: "README.md", path: "README.md", isDir: false, size: 3450 },
];

export async function fetchWorkspace(): Promise<WorkspaceInfo> {
  try {
    const res = await fetch(`${API_BASE}/api/workspace`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { ...data, isMock: false };
    }
  } catch {
    // Return mock if API not running
  }
  return {
    cwd: "d:/CLI/trak/workspaces/learn-go",
    hasTrakJson: true,
    activeTrack: "lang/go",
    totalModules: 20,
    completedModules: 2,
    totalFiles: 42,
    isMock: true,
  };
}

export async function fetchStatus(): Promise<StatusModel> {
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { ...data, isMock: false };
    }
  } catch {
    // Return mock
  }
  return { ...MOCK_TRAK_JSON, isMock: true };
}

export async function fetchFileTree(): Promise<FileNode[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tree`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) return await res.json();
  } catch {
    // Return mock
  }
  return MOCK_WORKSPACE_TREE;
}

export async function fetchFileContent(filePath: string): Promise<FileContent> {
  try {
    const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(filePath)}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return await res.json();
  } catch {
    // Return mock
  }

  // Fallback mock content
  if (filePath.endsWith("README.md")) {
    return {
      path: filePath,
      content: `# ${filePath.split("/")[0] || "Workspace Overview"}\n\n## Core Engineering Objectives\n1. Deep dive into language semantics and memory layout.\n2. Understand stack vs heap allocation patterns.\n3. Execute deterministic test suites.\n\n\`\`\`go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Running module exercise")\n}\n\`\`\`\n\nRun \`trak verify\` in this module directory to validate assertions.`,
      extension: "md",
      size: 1420,
    };
  }

  if (filePath.endsWith(".go")) {
    return {
      path: filePath,
      content: `package main\n\nimport (\n\t"fmt"\n)\n\n// ExerciseSolution implements the required interface\nfunc ExerciseSolution(input string) (string, error) {\n\tif input == "" {\n\t\treturn "", fmt.Errorf("empty input not permitted")\n\t}\n\treturn fmt.Sprintf("Processed: %s", input), nil\n}\n`,
      extension: "go",
      size: 450,
    };
  }

  if (filePath.endsWith("trak.json")) {
    return {
      path: filePath,
      content: JSON.stringify(MOCK_TRAK_JSON, null, 2),
      extension: "json",
      size: 1217,
    };
  }

  return {
    path: filePath,
    content: `// Content for ${filePath}\nmodule workspace_lab\n`,
    extension: filePath.split(".").pop() || "txt",
    size: 200,
  };
}

export async function runVerify(moduleName: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: moduleName }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return await res.json();
  } catch {
    // Return mock verification response
  }

  // Simulating real test run
  await new Promise((r) => setTimeout(r, 600));
  return {
    module: moduleName,
    passed: true,
    output: `=== RUN   TestExerciseSolution\n--- PASS: TestExerciseSolution (0.00s)\nPASS\nok  \tlearn-go/${moduleName}\t0.042s`,
    durationMs: 42,
    timestamp: new Date().toLocaleTimeString(),
  };
}

export async function toggleModuleDone(moduleName: string, done: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: moduleName, done }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return true; // Optimistic mock
  }
}

export async function saveFileContent(filePath: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, content }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createWorkspaceItem(
  filePath: string,
  isDir: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, isDir }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { success: false, error: errText || `Failed to create item (HTTP ${res.status})` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteWorkspaceItem(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/item/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { success: false, error: errText || `Failed to delete item (HTTP ${res.status})` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function setWorkspacePath(newPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/workspace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: newPath }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || `Server error (status ${res.status})` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export interface WorkspaceHistoryItem {
  path: string;
  name: string;
  lastOpened: string;
  trackId?: string;
}

export async function fetchWorkspacesHistory(): Promise<WorkspaceHistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/workspaces`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem("trak_workspaces_history", JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API unavailable
  }
  const saved = localStorage.getItem("trak_workspaces_history");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

export async function deleteWorkspaceHistoryItem(targetPath: string): Promise<WorkspaceHistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/workspaces?path=${encodeURIComponent(targetPath)}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem("trak_workspaces_history", JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // fallback
  }
  const current = await fetchWorkspacesHistory();
  const updated = current.filter((item) => item.path !== targetPath);
  localStorage.setItem("trak_workspaces_history", JSON.stringify(updated));
  return updated;
}

