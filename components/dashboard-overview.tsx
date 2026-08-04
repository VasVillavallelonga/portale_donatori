"use client";

import { useMemo, useState } from "react";
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

type DashboardDonor = Pick<Donor, "id" | "name" | "bloodType" | "active"> & {
  createdAt: string | null;
};

const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${value}T12:00:00`))
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
    const availableYears = new Set([
      ...donations.map((donation) => donation.year),
      ...donors.map((donor) => donor.createdAt?.slice(0, 4) ?? ""),
    ]);
    const values = [...availableYears].filter(Boolean).sort((a, b) => b.localeCompare(a));

    return values.length ? values : [String(new Date().getFullYear())];
  }, [donations, donors]);
  const [year, setYear] = useState(years[0]);
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
    () => donors.filter((donor) => donor.createdAt?.slice(0, 4) === year).length,
    [donors, year],
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
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} interval={0} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="donations" name="Donazioni" fill="var(--primary)" radius={[6, 6, 0, 0]} minPointSize={4} />
                </BarChart>
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
