"use client";

import { useEffect, useMemo, useState } from "react";
import { Droplets, HeartPulse, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Donation } from "@/lib/donations";
import type { Donor } from "@/lib/donors";

type DashboardDonor = Pick<Donor, "id" | "name" | "bloodType" | "gender" | "active">;

const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const bloodTypes = ["0+", "0-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

function percent(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}

export function DashboardOverview({
  donors,
  donations,
}: {
  donors: DashboardDonor[];
  donations: Donation[];
}) {
  const years = useMemo(() => {
    const availableYears = new Set(donations.map((donation) => donation.year));
    const values = [...availableYears].filter(Boolean).sort((a, b) => b.localeCompare(a));

    return values.length ? values : [String(new Date().getFullYear())];
  }, [donations]);
  const [year, setYear] = useState(years[0]);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const donationsForYear = useMemo(
    () =>
      donations.filter(
        (donation) =>
          donation.year === year && donation.classification !== "pre-donation",
      ),
    [donations, year],
  );
  const activeDonors = useMemo(() => {
    const donorIds = new Set(donationsForYear.map((donation) => donation.donorId));

    return donors.filter((donor) => donor.active && donorIds.has(donor.id)).length;
  }, [donationsForYear, donors]);
  const newDonors = useMemo(
    () =>
      new Set(
        donationsForYear
          .filter((donation) => donation.classification === "first-donation")
          .map((donation) => donation.donorId),
      ).size,
    [donationsForYear],
  );
  const monthlyDonations = useMemo(
    () =>
      months.map(
        (_, index) =>
          donationsForYear.filter(
            (donation) => Number(donation.date.slice(5, 7)) === index + 1,
          ).length,
      ),
    [donationsForYear],
  );
  const annualDonations = useMemo(
    () =>
      [...years].reverse().map((item) => ({
        year: item,
        donations: donations.filter(
          (donation) =>
            donation.year === item && donation.classification !== "pre-donation",
        ).length,
      })),
    [donations, years],
  );
  const latestDonations = useMemo(
    () =>
      [...donationsForYear]
        .sort((first, second) => second.date.localeCompare(first.date))
        .slice(0, 4),
    [donationsForYear],
  );
  const monthlyChartData = months.map((month, index) => ({
    month,
    donations: monthlyDonations[index],
  }));
  const metrics = [
    { label: "Donazioni", value: donationsForYear.length, icon: Droplets },
    { label: "Donatori attivi", value: activeDonors, icon: Users },
    { label: "Nuovi donatori", value: newDonors, icon: HeartPulse },
  ];
  const donorsForYear = useMemo(() => {
    const donorIds = new Set(donationsForYear.map((donation) => donation.donorId));
    return donors.filter((donor) => donorIds.has(donor.id));
  }, [donationsForYear, donors]);
  const women = donorsForYear.filter((donor) => donor.gender === "female").length;
  const men = donorsForYear.filter((donor) => donor.gender === "male").length;
  const wholeBlood = donationsForYear.filter((donation) => donation.type === "Sangue intero").length;
  const plasma = donationsForYear.filter((donation) => donation.type === "Plasma").length;
  const bloodGroups = bloodTypes.map((type) => {
    const count = donorsForYear.filter((donor) => donor.bloodType === type).length;
    return { type, count, share: percent(count, donorsForYear.length) };
  });

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Panoramica</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Riepilogo delle donazioni per l’anno selezionato.
          </p>
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="dashboard-year" className="mb-2 block text-sm font-medium">
            Anno
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="dashboard-year"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donatori per sesso</CardTitle>
            <CardDescription>Chi ha effettuato almeno una donazione nel {year}.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-sky-600">Uomini</p>
              <p className="mt-1 text-2xl font-bold">{men}</p>
              <p className="text-sm text-muted-foreground">{percent(men, donorsForYear.length)}%</p>
            </div>
            <div>
              <p className="text-sm text-pink-600">Donne</p>
              <p className="mt-1 text-2xl font-bold">{women}</p>
              <p className="text-sm text-muted-foreground">{percent(women, donorsForYear.length)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tipo di raccolta</CardTitle>
            <CardDescription>Sangue intero e plasma nel {year}, idoneità escluse.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sangue intero</p>
              <p className="mt-1 text-2xl font-bold">{wholeBlood}</p>
              <p className="text-sm text-muted-foreground">{percent(wholeBlood, donationsForYear.length)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plasma</p>
              <p className="mt-1 text-2xl font-bold">{plasma}</p>
              <p className="text-sm text-muted-foreground">{percent(plasma, donationsForYear.length)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gruppi sanguigni</CardTitle>
          <CardDescription>Quota dei donatori del {year} per gruppo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {bloodGroups.map(({ type, count, share }) => (
            <div key={type} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
              <p className="text-sm font-medium">{type}</p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
              </div>
              <p className="whitespace-nowrap text-sm text-muted-foreground">{count} · {share}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Confronto annuale</CardTitle>
          <CardDescription>Totale delle donazioni per anno, con le idoneità escluse.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualDonations} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="donations" name="Donazioni" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Andamento donazioni</CardTitle>
            <CardDescription>Donazioni registrate mese per mese nel {year}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={narrow ? "h-[28rem] w-full" : "h-64 w-full"}>
              <ResponsiveContainer key={narrow ? "mesi-stretti" : "mesi-larghi"} width="100%" height="100%">
                {narrow ? (
                  <BarChart data={monthlyChartData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="month" width={40} interval={0} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "var(--muted)" }} />
                    <Bar dataKey="donations" name="Donazioni" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} interval={0} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "var(--muted)" }} />
                    <Bar dataKey="donations" name="Donazioni" fill="var(--primary)" radius={[6, 6, 0, 0]} minPointSize={4} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ultime donazioni</CardTitle>
            <CardDescription>Le quattro donazioni più recenti del {year}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestDonations.length ? latestDonations.map((donation) => {
              const donor = donors.find((item) => item.id === donation.donorId);

              return (
                <div key={donation.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{donor?.name ?? "Donatore non trovato"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(donation.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Gruppo {donor?.bloodType ?? "—"}</p>
                    <Badge variant="success" className="mt-1">{donation.type ?? "Donazione"}</Badge>
                  </div>
                </div>
              );
            }) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Nessuna donazione registrata.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
