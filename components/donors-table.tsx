"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Eye, Pencil, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  donorColumns,
  donorFromDatabase,
  type DatabaseDonor,
  type Donor,
} from "@/lib/donors";
import { type Donation } from "@/lib/donations";
import { createClient } from "@/lib/supabase/client";

const bloodTypes = ["0+", "0-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;
type DonorForm = Omit<
  Donor,
  | "id"
  | "donationCount"
  | "bloodDonationCount"
  | "plasmaDonationCount"
  | "lastDonation"
>;
const emptyForm: DonorForm = {
  name: "",
  email: "",
  phone: "",
  gender: "female",
  birthDate: "",
  registryCode: "",
  bloodType: "0+",
  active: true,
};
const italianMonths: Record<string, string> = {
  gen: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  mag: "05",
  giu: "06",
  lug: "07",
  ago: "08",
  set: "09",
  ott: "10",
  nov: "11",
  dic: "12",
};
const donationClassifications = {
  donation: { label: "Donazione", variant: "success", color: "border-emerald-200 bg-emerald-50/50" },
  "first-donation": { label: "Prima donazione", variant: "info", color: "border-sky-200 bg-sky-50/50" },
  "pre-donation": { label: "Idoneità", variant: "warning", color: "border-amber-200 bg-amber-50/50" },
} as const;
const toDateInputValue = (value: string) => {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [day, month, year] = value.split(" ");
  return `${year}-${italianMonths[month]}-${day.padStart(2, "0")}`;
};
const formatBirthDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(new Date(`${value}T00:00:00`))
        .replace(".", "")
    : value;

function BirthDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value
    ? new Date(`${toDateInputValue(value)}T00:00:00`)
    : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date
            ? formatBirthDate(toDateInputValue(value))
            : "Seleziona una data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={it}
          captionLayout="dropdown"
          selected={date}
          onSelect={(selected) => {
            if (!selected) return;
            onChange(format(selected, "yyyy-MM-dd"));
            setOpen(false);
          }}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DonorsTable({
  donors: initialDonors,
  donations,
}: {
  donors: Donor[];
  donations: Donation[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialDonors);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editing, setEditing] = useState<Donor | null>(null);
  const [detailsDonor, setDetailsDonor] = useState<Donor | null>(null);
  const [open, setOpen] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [form, setForm] = useState<DonorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const rows = useMemo(
    () =>
      items.filter(
        (donor) =>
          (activeFilter === "all" ||
            donor.active === (activeFilter === "active")) &&
          `${donor.name} ${donor.email ?? ""} ${donor.phone ?? ""} ${donor.registryCode}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, query, activeFilter],
  );
  const detailsDonations = useMemo(
    () =>
      donations.filter((donation) => donation.donorId === detailsDonor?.id),
    [detailsDonor?.id, donations],
  );
  const set = <K extends keyof DonorForm>(key: K, value: DonorForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setNameError(false);
  };
  const edit = (donor?: Donor) => {
    setEditing(donor ?? null);
    setForm(
      donor
        ? {
            name: donor.name,
            email: donor.email ?? "",
            phone: donor.phone ?? "",
            gender: donor.gender,
            birthDate: donor.birthDate,
            registryCode: donor.registryCode,
            bloodType: donor.bloodType,
            active: donor.active,
          }
        : emptyForm,
    );
    setNameError(false);
    setOpen(true);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Inserisci il nome del donatore.");
      setNameError(true);
      window.setTimeout(() => setNameError(false), 2000);
      return;
    }
    setSaving(true);

    const code = form.registryCode.trim();
    const email = (form.email ?? "").trim();
    const telephone = (form.phone ?? "").trim();
    const values = {
      name: form.name.trim(),
      birth_date: form.birthDate ? `${form.birthDate}T00:00:00.000Z` : null,
      gender: form.gender,
      blood_group: form.bloodType,
      is_active: form.active,
      ...(code ? { code } : {}),
      ...(email ? { email } : {}),
      ...(telephone ? { telephone } : {}),
    };
    const supabase = createClient();
    const query = editing
      ? supabase
          .from("donors")
          .update(values)
          .eq("id", editing.id)
          .select(donorColumns)
          .single()
      : supabase.from("donors").insert(values).select(donorColumns).single();
    const { data, error } = await query;

    setSaving(false);

    if (error) {
      toast.error("Impossibile salvare il donatore. Riprova.");
      return;
    }

    const savedDonor = donorFromDatabase(data as DatabaseDonor);
    setItems((current) =>
      editing
        ? current.map((donor) =>
            donor.id === editing.id ? savedDonor : donor,
          )
        : [savedDonor, ...current],
    );
    toast.success(editing ? "Donatore aggiornato." : "Donatore inserito.");
    close();
    router.refresh();
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row">
        <p className="flex shrink-0 items-center text-sm text-muted-foreground">
          {rows.length} donatori registrati
        </p>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca per nome, codice o contatto"
            className="pl-9"
          />
        </div>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="active">Attivi</SelectItem>
            <SelectItem value="inactive">Non attivi</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => edit()}>
          <Plus className="h-4 w-4" />
          Nuovo donatore
        </Button>
      </div>
      <Dialog open={open} onOpenChange={(value) => !value && close()}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifica donatore" : "Nuovo donatore"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome e cognome</Label>
              <Input
                id="name"
                placeholder="es. Giulia Rossi"
                value={form.name}
                onChange={(event) => {
                  set("name", event.target.value);
                  setNameError(false);
                }}
                aria-invalid={nameError}
                className={cn(
                  nameError &&
                    "border-destructive bg-destructive/10 ring-2 ring-destructive/50",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth">Data di nascita</Label>
              <BirthDatePicker
                value={form.birthDate}
                onChange={(value) => set("birthDate", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Codice anagrafico</Label>
              <Input
                id="code"
                inputMode="numeric"
                placeholder="es. 6621972"
                value={form.registryCode}
                onChange={(event) => set("registryCode", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sesso</Label>
              <Select
                value={form.gender}
                onValueChange={(value) =>
                  set("gender", value as DonorForm["gender"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Donna</SelectItem>
                  <SelectItem value="male">Uomo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="es. giulia@email.it"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="es. +39 333 123 4567"
                value={form.phone}
                onChange={(event) => set("phone", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gruppo sanguigno</Label>
              <Select
                value={form.bloodType}
                onValueChange={(value) =>
                  set("bloodType", value as DonorForm["bloodType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona gruppo" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stato</Label>
              <Select
                value={form.active ? "active" : "inactive"}
                onValueChange={(value) => set("active", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="inactive">Non attivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={close}>
                Annulla
              </Button>
              <Button type="submit" disabled={saving}>
                {editing ? "Salva modifiche" : "Inserisci donatore"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(detailsDonor)}
        onOpenChange={(open) => !open && setDetailsDonor(null)}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-h-[32rem]">
          <DialogHeader>
            <DialogTitle>Donazioni di {detailsDonor?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {detailsDonations.length ? (
              detailsDonations.map((donation) => {
                const classification =
                  donationClassifications[donation.classification ?? "donation"];

                return (
                  <div
                    key={donation.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      classification.color,
                    )}
                  >
                    <div>
                      <p className="font-medium">
                        {donation.type ?? "Idoneità"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {donation.date
                          ? format(
                              new Date(`${donation.date}T12:00:00`),
                              "dd MMM yyyy",
                              { locale: it },
                            )
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={classification.variant}>
                        {classification.label}
                      </Badge>
                      <Badge variant="outline">{donation.year}</Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessuna donazione registrata.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid gap-3 sm:hidden">
        {rows.length ? (
          rows.map((donor) => (
          <div
            key={donor.id}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    donor.gender === "female"
                      ? "text-pink-600"
                      : "text-sky-600",
                  )}
                >
                  {donor.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {donor.gender === "female" ? "Donna" : "Uomo"} · Gruppo{" "}
                  {donor.bloodType} · Cod. {donor.registryCode || "—"}
                </p>
              </div>
              <Badge
                variant={donor.active ? "success" : "warning"}
                className="shrink-0 whitespace-nowrap"
              >
                {donor.active ? "Attivo" : "Non attivo"}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Nascita</p>
                <p>{formatBirthDate(donor.birthDate) || "—"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Donazioni</p>
                <p className="font-medium">
                  Totale {donor.donationCount ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sangue {donor.bloodDonationCount ?? "—"} · Plasma{" "}
                  {donor.plasmaDonationCount ?? "—"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Telefono</p>
                <p>{donor.phone ?? "—"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Ultima donazione
                </p>
                <p>{donor.lastDonation ?? "—"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setDetailsDonor(donor)}
              >
                <Eye className="h-4 w-4" />
                Donazioni
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => edit(donor)}
              >
                <Pencil className="h-4 w-4" />
                Modifica
              </Button>
            </div>
          </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nessun donatore trovato.
          </p>
        )}
      </div>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donatore</TableHead>
              <TableHead className="hidden lg:table-cell">
                Dati anagrafici
              </TableHead>
              <TableHead className="hidden md:table-cell">Contatti</TableHead>
              <TableHead className="hidden sm:table-cell">
                Ultima donazione
              </TableHead>
              <TableHead className="text-right">Donazioni</TableHead>
              <TableHead className="hidden text-right xl:table-cell">
                Stato
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell>
                  <div
                    className={cn(
                      "font-medium",
                      donor.gender === "female"
                        ? "text-pink-600"
                        : "text-sky-600",
                    )}
                  >
                    {donor.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {donor.gender === "female" ? "Donna" : "Uomo"} · Gruppo{" "}
                    {donor.bloodType}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div>{formatBirthDate(donor.birthDate) || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    Cod. {donor.registryCode || "—"}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>{donor.phone ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {donor.email ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {donor.lastDonation ?? "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div>Totale {donor.donationCount ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    Sangue {donor.bloodDonationCount ?? "—"} · Plasma{" "}
                    {donor.plasmaDonationCount ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="hidden text-right xl:table-cell">
                  <Badge variant={donor.active ? "success" : "warning"}>
                    {donor.active ? "Attivo" : "Non attivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDetailsDonor(donor)}
                    aria-label={`Visualizza donazioni di ${donor.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => edit(donor)}
                    aria-label={`Modifica ${donor.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  Nessun donatore trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
