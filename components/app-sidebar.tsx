"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Droplets, LayoutDashboard, LogOut, PanelLeftOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { href: "/donatori", label: "Donatori", icon: Users }, { href: "/donazioni", label: "Donazioni", icon: Droplets }];

function Navigation({ collapsed = false, onItemSelect }: { collapsed?: boolean; onItemSelect?: () => void }) {
  const pathname = usePathname();
  return <nav className="grid gap-1" aria-label="Navigazione principale">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={onItemSelect} title={collapsed ? label : undefined} className={cn("flex items-center rounded-md py-2.5 text-sm font-medium transition-colors", collapsed ? "justify-center px-2" : "gap-3 px-3", pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="h-4 w-4 shrink-0" /><span className={cn(collapsed && "sr-only")}>{label}</span></Link>)}</nav>;
}

export function Brand({ collapsed = false }: { collapsed?: boolean }) { return <Link href="/dashboard" title={collapsed ? "Portale Donazioni di sangue" : undefined} className={cn("flex items-center font-semibold", collapsed ? "justify-center" : "gap-2")}><Image src="/vas-logo.svg" alt="Logo VAS" width={500} height={606} unoptimized className="h-10 w-10 shrink-0 object-contain" /><span className={cn(collapsed && "sr-only")}>VAS Villavallelonga</span></Link>; }
function LogoutButton({ collapsed = false }: { collapsed?: boolean }) { const router = useRouter(); const logout = async () => { try { await signOut(); router.replace("/login"); router.refresh(); } catch { router.refresh(); } }; return<Button variant="outline" onClick={logout} title={collapsed ? "Esci" : undefined} className={cn("w-full bg-red-700 text-white hover:bg-red-800 hover:text-white", collapsed ? "justify-center px-2" : "justify-start")}><LogOut className="h-4 w-4" /><span className={cn(collapsed && "sr-only")}>Esci</span></Button>; }

export function AppSidebar({ collapsed }: { collapsed: boolean }) { const [mobileMenuOpen, setMobileMenuOpen] = useState(false); return <><aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-background p-4 transition-[width] duration-200 md:flex", collapsed ? "w-20" : "w-64")}><Brand collapsed={collapsed} /><div className="mt-5"><Navigation collapsed={collapsed} /></div><div className={cn("mt-auto space-y-3", collapsed && "flex flex-col items-center")}><LogoutButton collapsed={collapsed} /></div></aside><header className="flex h-16 items-center border-b bg-background px-4 md:hidden"><Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Apri menu"><PanelLeftOpen className="h-5 w-5" /></Button></SheetTrigger><SheetContent><Brand /><div className="mt-5"><Navigation onItemSelect={() => setMobileMenuOpen(false)} /></div><div className="mt-auto"><LogoutButton /></div></SheetContent></Sheet></header></>; }
