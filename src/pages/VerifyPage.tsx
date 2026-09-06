import React from "react";
import { useSearchParams } from "react-router-dom";
import { VerifyView } from "../components/VerifyView";
import type { StatusModel } from "../types";

interface VerifyPageProps {
  status: StatusModel;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ status, onToggleDone }) => {
  const [searchParams] = useSearchParams();
  const moduleParam = searchParams.get("module") || undefined;
  const autoRun = searchParams.get("run") === "true";

  return (
    <VerifyView
      status={status}
      defaultModule={moduleParam}
      autoRun={autoRun}
      onToggleDone={onToggleDone}
    />
  );
};
