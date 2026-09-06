import React from "react";
import { ManifestView } from "../components/ManifestView";
import type { StatusModel } from "../types";

interface ManifestPageProps {
  status: StatusModel;
}

export const ManifestPage: React.FC<ManifestPageProps> = ({ status }) => {
  return <ManifestView status={status} />;
};
