"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrivateShell({ children }: { children: React.ReactNode }) { const [collapsed, setCollapsed] = useState(false); return <div className="min-h-screen bg-muted/30"><AppSidebar collapsed={collapsed} /><div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-20" : "md:pl-64")}><header className="hidden h-16 items-center border-b bg-background px-6 md:flex"><Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Espandi barra laterale" : "Riduci barra laterale"}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</Button></header><main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main></div></div>; }
