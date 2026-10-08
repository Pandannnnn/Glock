import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { DemoProvider } from "@/lib/demo-store";

export const metadata: Metadata = {
  title: "GLock Merchant",
  description: "A simulated GCash-inspired business wallet and inventory planning prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body><AuthProvider><DemoProvider>{children}</DemoProvider></AuthProvider></body>
    </html>
  );
}
