import { Card, CardContent } from "@/components/ui/card";
import { DonationsTable } from "@/components/donations-table";
export default function DonationsPage() { return <><div className="mb-8"><p className="text-sm font-medium text-primary">Registro</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Donazioni</h1><p className="mt-2 text-muted-foreground">Tutte le donazioni di sangue registrate, filtrabili per anno.</p></div><Card><CardContent className="pt-6"><DonationsTable /></CardContent></Card></>; }
