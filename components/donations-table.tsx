"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Pencil, Plus } from "lucide-react";
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
import {
  donations as initialDonations,
  donorForDonation,
  type Donation,
} from "@/lib/donations";
import { donors } from "@/lib/donors";
import { cn } from "@/lib/utils";

type DonationForm = Pick<
  Donation,
  "donorId" | "date" | "type" | "classification"
>;
const emptyForm: DonationForm = {
  donorId: "",
  date: "",
  type: "Sangue intero",
  classification: "donation",
};
const types: Exclude<Donation["type"], undefined>[] = [
  "Sangue intero",
  "Plasma",
];
const classifications = {
  donation: "Donazione",
  "first-donation": "Prima donazione",
  "pre-donation": "Predonazione (idoneità)",
} as const;

function DonationDatePicker({
  value,
  onChange,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(`${value}T00:00:00`) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            invalid &&
              "border-destructive bg-destructive/10 ring-2 ring-destructive/50",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? format(date, "PPP", { locale: it }) : "Seleziona una data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={it}
          captionLayout="dropdown"
          selected={date}
          disabled={{ after: new Date() }}
          onSelect={(selected) => {
            if (selected) {
              onChange(format(selected, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function formatDate(value: string) {
  if (!value.includes("-")) return value;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function toInputDate(value: string) {
  if (value.includes("-")) return value;
  const months: Record<string, string> = {
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
  const [day, month, year] = value.split(" ");
  return day && months[month] && year
    ? `${year}-${months[month]}-${day.padStart(2, "0")}`
    : "";
}

export function DonationsTable() {
  const [items, setItems] = useState(initialDonations);
  const [year, setYear] = useState<Donation["year"]>("2026");
  const [editing, setEditing] = useState<Donation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<DonationForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({ donor: false, date: false });
  const rows = useMemo(
    () => items.filter((donation) => donation.year === year),
    [items, year],
  );
  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({ donor: false, date: false });
  };
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };
  const openEdit = (donation: Donation) => {
    setEditing(donation);
    setForm({
      donorId: donation.donorId,
      date: toInputDate(donation.date),
      type: donation.type,
      classification: donation.classification ?? "donation",
    });
    setIsFormOpen(true);
  };
  const set = <K extends keyof DonationForm>(key: K, value: DonationForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !form.donorId ||
      !form.date ||
      (form.classification !== "pre-donation" && !form.type)
    ) {
      toast.error("Compila tutti i campi della donazione.");
      setFieldErrors({ donor: !form.donorId, date: !form.date });
      window.setTimeout(
        () => setFieldErrors({ donor: false, date: false }),
        2000,
      );
      return;
    }
    const donationYear = form.date.slice(0, 4) as Donation["year"];
    const stored = { ...form, date: formatDate(form.date), year: donationYear };
    if (editing) {
      setItems((current) =>
        current.map((donation) =>
          donation.id === editing.id ? { ...donation, ...stored } : donation,
        ),
      );
      toast.success("Donazione aggiornata.");
    } else {
      setItems((current) => [
        { ...stored, id: crypto.randomUUID() },
        ...current,
      ]);
      toast.success("Donazione inserita.");
    }
    setYear(donationYear);
    closeForm();
  };
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {rows.length} donazioni registrate
          </p>
          <div className="w-32">
            <Select
              value={year}
              onValueChange={(value) => setYear(value as Donation["year"])}
            >
              <SelectTrigger aria-label="Filtra per anno">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nuova donazione
        </Button>
      </div>
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifica donazione" : "Nuova donazione"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2"
            onSubmit={save}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label>Donatore</Label>
              <Select
                value={form.donorId}
                onValueChange={(value) => {
                  set("donorId", value);
                  setFieldErrors((errors) => ({ ...errors, donor: false }));
                }}
              >
                <SelectTrigger
                  className={cn(
                    fieldErrors.donor &&
                      "border-destructive bg-destructive/10 ring-2 ring-destructive/50",
                  )}
                >
                  <SelectValue placeholder="Seleziona un donatore" />
                </SelectTrigger>
                <SelectContent>
                  {donors
                    .filter((donor) => donor.active)
                    .map((donor) => (
                      <SelectItem key={donor.id} value={donor.id}>
                        {donor.name} · {donor.bloodType}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation-date">Data</Label>
              <DonationDatePicker
                value={form.date}
                onChange={(value) => {
                  set("date", value);
                  setFieldErrors((errors) => ({ ...errors, date: false }));
                }}
                invalid={fieldErrors.date}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 sm:row-start-3">
              <Label>Tipologia di registrazione</Label>
              <Select
                value={form.classification ?? "donation"}
                onValueChange={(value) => {
                  set(
                    "classification",
                    value as DonationForm["classification"],
                  );
                  if (value === "pre-donation") set("type", undefined);
                  else if (!form.type) set("type", "Sangue intero");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(classifications).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.classification === "pre-donation" ? (
              <div className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground sm:col-span-2">
                Predonazione: viene registrata l’idoneità, senza tipologia di
                raccolta.
              </div>
            ) : (
              <div className="space-y-2 sm:col-start-2 sm:row-start-2">
                <Label>Tipologia</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    set("type", value as Donation["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Annulla
              </Button>
              <Button type="submit">
                {editing ? "Salva modifiche" : "Inserisci donazione"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid gap-3 sm:hidden">
        {rows.length ? (
          rows.map((donation) => {
            const donor = donorForDonation(donation, donors);
            return (
              <div
                key={donation.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {donor?.name ?? "Donatore non trovato"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {donation.date} · Gruppo {donor?.bloodType ?? "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {classifications[donation.classification ?? "donation"]}
                  </Badge>
                </div>
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Tipologia</p>
                  <p className="mt-1 font-medium">
                    {donation.type ?? "Idoneità"}
                  </p>
                </div>
                <div className="mt-4 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openEdit(donation)}
                  >
                    <Pencil className="h-4 w-4" />
                    Modifica
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nessuna donazione registrata per l’anno selezionato.
          </p>
        )}
      </div>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Donatore</TableHead>
              <TableHead className="hidden sm:table-cell">
                Gruppo sanguigno
              </TableHead>
              <TableHead className="text-right">Tipologia</TableHead>
              <TableHead aria-label="Azioni" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((donation) => {
                const donor = donorForDonation(donation, donors);
                return (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.date}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {donor?.name ?? "Donatore non trovato"}
                      </div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        Gruppo {donor?.bloodType}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{donor?.bloodType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>{donation.type ?? "—"}</div>
                      <Badge variant="outline" className="mt-1">
                        {classifications[donation.classification ?? "donation"]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(donation)}
                        aria-label="Modifica donazione"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  Nessuna donazione registrata per l’anno selezionato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
