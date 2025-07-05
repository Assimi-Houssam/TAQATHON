import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anomaly Management",
  description: "Manage and monitor system anomalies",
};

export default function AnomalyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
} 