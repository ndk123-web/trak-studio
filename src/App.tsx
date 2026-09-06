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
import { fetchFileTree, fetchStatus, fetchWorkspace, toggleModuleDone } from "./api";

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

  const handleWorkspacePathChange = (newPath: string) => {
    setWorkspace((prev) => (prev ? { ...prev, cwd: newPath } : { cwd: newPath, hasTrakJson: true }));
    loadData();
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-[#f1f5f9] antialiased">
        {/* Resizable & Collapsible Left Studio Sidebar */}
        <Sidebar
          status={status}
          workspace={workspace}
          onRefresh={loadData}
          isLoading={loading}
          width={sidebarWidth}
          onWidthChange={handleWidthChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopBar
            status={status}
            onRefresh={loadData}
            isLoading={loading}
          />

          <main className="flex-1 overflow-y-auto bg-[#07090e]">
            {!loading && workspace && !workspace.hasTrakJson ? (
              <EmptyWorkspace workspace={workspace} />
            ) : status ? (
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <DashboardPage
                      status={status}
                      onToggleDone={handleToggleDone}
                    />
                  }
                />
                <Route
                  path="/modules"
                  element={
                    <ModulesPage
                      status={status}
                      onToggleDone={handleToggleDone}
                    />
                  }
                />
                <Route
                  path="/modules/:moduleId"
                  element={
                    <ModuleDetailPage
                      status={status}
                      onToggleDone={handleToggleDone}
                    />
                  }
                />
                <Route
                  path="/editor"
                  element={<EditorPage tree={tree} />}
                />
                <Route
                  path="/verify"
                  element={
                    <VerifyPage
                      status={status}
                      onToggleDone={handleToggleDone}
                    />
                  }
                />
                <Route
                  path="/manifest"
                  element={<ManifestPage status={status} />}
                />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      workspace={workspace}
                      status={status}
                      onRefresh={loadData}
                      isLoading={loading}
                      onWorkspacePathChange={handleWorkspacePathChange}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                Connecting to local workspace...
              </div>
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

