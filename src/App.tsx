import { useEffect, useState, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { StatusBar } from "./components/StatusBar";
import { DashboardPage } from "./pages/DashboardPage";
import { ModulesPage } from "./pages/ModulesPage";
import { ModuleDetailPage } from "./pages/ModuleDetailPage";
import { EditorPage } from "./pages/EditorPage";
import { VerifyPage } from "./pages/VerifyPage";
import { ManifestPage } from "./pages/ManifestPage";
import { SettingsPage } from "./pages/SettingsPage";
import { EmptyWorkspace } from "./components/EmptyWorkspace";
import type { FileNode, StatusModel, WorkspaceInfo } from "./types";
import { fetchFileTree, fetchStatus, fetchWorkspace, toggleModuleDone, setWorkspacePath } from "./api";

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [status, setStatus] = useState<StatusModel | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Resizable & Collapsible sidebar state with persistence
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("trak_studio_sidebar_width");
    return saved ? parseInt(saved, 10) : 256;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("trak_studio_sidebar_collapsed") === "true";
  });

  const handleWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem("trak_studio_sidebar_width", newWidth.toString());
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("trak_studio_sidebar_collapsed", next.toString());
      return next;
    });
  };

  // Keyboard shortcut Cmd+B / Ctrl+B for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ws, st, tr] = await Promise.all([
        fetchWorkspace(),
        fetchStatus(),
        fetchFileTree(),
      ]);
      setWorkspace(ws);
      setStatus(st);
      setTree(tr);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleDone = async (moduleName: string, done: boolean) => {
    if (!status) return;

    // Optimistic UI update
    setStatus((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        module_breakdown: {
          ...prev.module_breakdown,
          [moduleName]: done,
        },
      };
    });

    await toggleModuleDone(moduleName, done);
  };

  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);

  const handleWorkspacePathChange = async (newPath: string): Promise<{ success: boolean; error?: string }> => {
    setIsSwitchingWorkspace(true);
    setLoading(true);
    try {
      const res = await setWorkspacePath(newPath);
      if (!res.success) {
        return res;
      }
      await loadData();
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    } finally {
      setIsSwitchingWorkspace(false);
      setLoading(false);
    }
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-[#f1f5f9] antialiased relative">
        {/* Workspace Switching Loading Overlay */}
        {isSwitchingWorkspace && (
          <div className="fixed inset-0 z-50 bg-[#07090e]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                Switching Workspace
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Re-indexing workspace tree and curriculum status...
              </div>
            </div>
          </div>
        )}

        {/* Resizable & Collapsible Left Studio Sidebar */}
        <Sidebar
          status={status}
          workspace={workspace}
          onRefresh={loadData}
          isLoading={loading || isSwitchingWorkspace}
          width={sidebarWidth}
          onWidthChange={handleWidthChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopBar
            status={status}
            workspace={workspace}
            onRefresh={loadData}
            isLoading={loading}
          />

          <main className="flex-1 overflow-y-auto bg-[#07090e]">
            {loading && !workspace ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                Connecting to local workspace...
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    !workspace?.hasTrakJson || !status ? (
                      <EmptyWorkspace
                        workspace={workspace}
                        onWorkspacePathChange={handleWorkspacePathChange}
                        isLoading={loading || isSwitchingWorkspace}
                      />
                    ) : (
                      <DashboardPage
                        status={status}
                        onToggleDone={handleToggleDone}
                      />
                    )
                  }
                />
                <Route
                  path="/modules"
                  element={
                    !workspace?.hasTrakJson || !status ? (
                      <EmptyWorkspace
                        workspace={workspace}
                        onWorkspacePathChange={handleWorkspacePathChange}
                        isLoading={loading || isSwitchingWorkspace}
                      />
                    ) : (
                      <ModulesPage
                        status={status}
                        onToggleDone={handleToggleDone}
                      />
                    )
                  }
                />
                <Route
                  path="/modules/:moduleId"
                  element={
                    !workspace?.hasTrakJson || !status ? (
                      <EmptyWorkspace
                        workspace={workspace}
                        onWorkspacePathChange={handleWorkspacePathChange}
                        isLoading={loading || isSwitchingWorkspace}
                      />
                    ) : (
                      <ModuleDetailPage
                        status={status}
                        onToggleDone={handleToggleDone}
                      />
                    )
                  }
                />
                <Route
                  path="/editor"
                  element={<EditorPage tree={tree} onRefreshTree={loadData} />}
                />
                <Route
                  path="/verify"
                  element={
                    !workspace?.hasTrakJson || !status ? (
                      <EmptyWorkspace
                        workspace={workspace}
                        onWorkspacePathChange={handleWorkspacePathChange}
                        isLoading={loading || isSwitchingWorkspace}
                      />
                    ) : (
                      <VerifyPage
                        status={status}
                        onToggleDone={handleToggleDone}
                      />
                    )
                  }
                />
                <Route
                  path="/manifest"
                  element={
                    !workspace?.hasTrakJson || !status ? (
                      <EmptyWorkspace
                        workspace={workspace}
                        onWorkspacePathChange={handleWorkspacePathChange}
                        isLoading={loading || isSwitchingWorkspace}
                      />
                    ) : (
                      <ManifestPage status={status} />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      workspace={workspace}
                      status={status}
                      onRefresh={loadData}
                      isLoading={loading || isSwitchingWorkspace}
                      onWorkspacePathChange={handleWorkspacePathChange}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            )}
          </main>

          {/* VS Code-style Status Bar Footer */}
          <StatusBar
            workspace={workspace}
            status={status}
            isLoading={loading}
            onRefresh={loadData}
            onToggleSidebar={handleToggleCollapse}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
      </div>
    </HashRouter>
  );
}

export default App;

