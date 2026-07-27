import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return <main className="flex flex-1 items-center justify-center bg-muted/40 px-6 py-16"><section className="max-w-lg text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><HandHeart className="h-7 w-7" /></div><p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">Portale donazioni</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Stiamo preparando qualcosa di importante.</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Il nuovo portale per gestire le donazioni è in arrivo. L’area riservata è già disponibile per il team.</p><Button asChild className="mt-8"><Link href="/login">Accedi all’area riservata <ArrowRight className="h-4 w-4" /></Link></Button></section></main>;
}
