import React from "react";
import { WorkspacesHub } from "./WorkspacesHub";
import type { StatusModel, WorkspaceInfo } from "../types";

interface EmptyWorkspaceProps {
  workspace: WorkspaceInfo | null;
  status?: StatusModel | null;
  onWorkspacePathChange?: (newPath: string) => Promise<{ success: boolean; error?: string } | void> | void;
  isLoading?: boolean;
}

export const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({
  workspace,
  status = null,
  onWorkspacePathChange,
  isLoading = false,
}) => {
  return (
    <WorkspacesHub
      workspace={workspace}
      status={status}
      onWorkspacePathChange={onWorkspacePathChange}
      isLoading={isLoading}
    />
  );
};
