import { Card, CardContent } from "@/components/ui/card";
import { DonorsTable } from "@/components/donors-table";
export default function DonorsPage() { return <><div className="mb-4"><p className="text-sm font-medium text-primary">Anagrafiche</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Donatori</h1><p className="mt-2 text-muted-foreground">Consulta, inserisci e aggiorna i dati e i contatti dei donatori.</p></div><Card><CardContent className="pt-6 [&>div:last-child]:max-h-[32rem] [&>div:last-child]:overflow-y-auto"><DonorsTable /></CardContent></Card></>; }
