import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = { title: "Portale Donazioni", description: "Gestione delle donazioni" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="it"><body className="min-h-screen bg-background font-sans text-foreground antialiased">{children}<Toaster position="bottom-right" /></body></html>; }
