import React from "react";
import { VerifyView } from "../components/VerifyView";
import type { StatusModel } from "../types";

interface VerifyPageProps {
  status: StatusModel;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ status, onToggleDone }) => {
  return <VerifyView status={status} onToggleDone={onToggleDone} />;
};
