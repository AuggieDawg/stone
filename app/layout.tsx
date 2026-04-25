import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stone RigOps",
  description: "Standalone rig maintenance, repair, systems, and tool tracking app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
