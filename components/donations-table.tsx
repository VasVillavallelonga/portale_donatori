"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { donations as initialDonations, donorForDonation, type Donation } from "@/lib/donations";
import { donors } from "@/lib/donors";

type DonationForm = Pick<Donation, "donorId" | "date" | "type">;
const emptyForm: DonationForm = { donorId: "", date: "", type: "Sangue intero" };
const types: Donation["type"][] = ["Sangue intero", "Plasma"];

function formatDate(value: string) {
  if (!value.includes("-")) return value;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function toInputDate(value: string) {
  if (value.includes("-")) return value;
  const months: Record<string, string> = { gen: "01", feb: "02", mar: "03", apr: "04", mag: "05", giu: "06", lug: "07", ago: "08", set: "09", ott: "10", nov: "11", dic: "12" };
  const [day, month, year] = value.split(" ");
  return day && months[month] && year ? `${year}-${months[month]}-${day.padStart(2, "0")}` : "";
}

export function DonationsTable() {
  const [items, setItems] = useState(initialDonations);
  const [year, setYear] = useState<Donation["year"]>("2026");
  const [editing, setEditing] = useState<Donation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<DonationForm>(emptyForm);
  const rows = useMemo(() => items.filter((donation) => donation.year === year), [items, year]);
  const closeForm = () => { setIsFormOpen(false); setEditing(null); setForm(emptyForm); };
  const openNew = () => { setEditing(null); setForm(emptyForm); setIsFormOpen(true); };
  const openEdit = (donation: Donation) => { setEditing(donation); setForm({ donorId: donation.donorId, date: toInputDate(donation.date), type: donation.type }); setIsFormOpen(true); };
  const set = <K extends keyof DonationForm>(key: K, value: DonationForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.donorId || !form.date || !form.type) {
      toast.error("Compila tutti i campi della donazione.");
      const invalidElements = [
        !form.date ? event.currentTarget.querySelector<HTMLInputElement>("#donation-date") : null,
        !form.donorId ? event.currentTarget.querySelectorAll<HTMLElement>("[role=combobox]")[0] : null,
        !form.type ? event.currentTarget.querySelectorAll<HTMLElement>("[role=combobox]")[1] : null,
      ].filter((element): element is HTMLElement => element !== null);
      invalidElements.forEach((element) => element.classList.add("border-destructive", "ring-2", "ring-destructive/30"));
      window.setTimeout(() => invalidElements.forEach((element) => element.classList.remove("border-destructive", "ring-2", "ring-destructive/30")), 2000);
      return;
    }
    const donationYear = form.date.slice(0, 4) as Donation["year"];
    const stored = { ...form, date: formatDate(form.date), year: donationYear };
    if (editing) { setItems((current) => current.map((donation) => donation.id === editing.id ? { ...donation, ...stored } : donation)); toast.success("Donazione aggiornata."); }
    else { setItems((current) => [{ ...stored, id: crypto.randomUUID() }, ...current]); toast.success("Donazione inserita."); }
    setYear(donationYear); closeForm();
  };
  return <><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row"><div className="flex items-center gap-3"><p className="text-sm text-muted-foreground">{rows.length} donazioni registrate</p><div className="w-32"><Select value={year} onValueChange={(value) => setYear(value as Donation["year"])}><SelectTrigger aria-label="Filtra per anno"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2026">2026</SelectItem><SelectItem value="2025">2025</SelectItem><SelectItem value="2024">2024</SelectItem></SelectContent></Select></div></div><Button onClick={openNew}><Plus className="h-4 w-4" />Nuova donazione</Button></div><Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}><DialogContent><DialogHeader><DialogTitle>{editing ? "Modifica donazione" : "Nuova donazione"}</DialogTitle><DialogDescription>Il gruppo sanguigno e l’anno vengono recuperati automaticamente da donatore e data.</DialogDescription></DialogHeader><form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={save}><div className="space-y-2 sm:col-span-2"><Label>Donatore</Label><Select value={form.donorId} onValueChange={(value) => set("donorId", value)}><SelectTrigger><SelectValue placeholder="Seleziona un donatore" /></SelectTrigger><SelectContent>{donors.filter((donor) => donor.active).map((donor) => <SelectItem key={donor.id} value={donor.id}>{donor.name} · {donor.bloodType}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="donation-date">Data</Label><Input id="donation-date" type="date" value={form.date.includes("-") ? form.date : ""} onChange={(event) => set("date", event.target.value)} /></div><div className="space-y-2"><Label>Tipologia</Label><Select value={form.type} onValueChange={(value) => set("type", value as Donation["type"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={closeForm}>Annulla</Button><Button type="submit">{editing ? "Salva modifiche" : "Inserisci donazione"}</Button></div></form></DialogContent></Dialog><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Donatore</TableHead><TableHead className="hidden sm:table-cell">Gruppo sanguigno</TableHead><TableHead className="text-right">Tipologia</TableHead><TableHead aria-label="Azioni" /></TableRow></TableHeader><TableBody>{rows.length ? rows.map((donation) => { const donor = donorForDonation(donation, donors); return <TableRow key={donation.id}><TableCell>{donation.date}</TableCell><TableCell><div className="font-medium">{donor?.name ?? "Donatore non trovato"}</div><div className="text-xs text-muted-foreground sm:hidden">Gruppo {donor?.bloodType}</div></TableCell><TableCell className="hidden sm:table-cell"><Badge variant="outline">{donor?.bloodType}</Badge></TableCell><TableCell className="text-right">{donation.type}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => openEdit(donation)} aria-label="Modifica donazione"><Pencil className="h-4 w-4" /></Button></TableCell></TableRow>; }) : <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Nessuna donazione registrata per l’anno selezionato.</TableCell></TableRow>}</TableBody></Table></>;
}
