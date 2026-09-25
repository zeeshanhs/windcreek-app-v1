import type { Metadata } from "next";
import { Suspense } from "react";
import AskPatApp from "./askpat-app";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskPat · Wind Creek Hospitality",
  description: "Fictional AskPat service-order and conversation prototype",
  icons: { icon: "/brand/windcreek-mark.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body><Suspense fallback={<main className="loading-screen">Loading AskPat…</main>}><AskPatApp /></Suspense>{children}</body></html>;
}
