import { Card, CardContent } from "@/components/ui/card";
import { DonorsTable } from "@/components/donors-table";
import { donorColumns, donorFromDatabase, type DatabaseDonor } from "@/lib/donors";
import {
  donationColumns,
  donationFromDatabase,
  type DatabaseDonation,
} from "@/lib/donations";
import { createClient } from "@/lib/supabase/server";

function formatDonationDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${value}T12:00:00`))
    .replace(".", "");
}

export default async function DonorsPage() {
  const supabase = await createClient();
  const [{ data: donorsData, error: donorsError }, { data: donationsData, error: donationsError }] =
    await Promise.all([
      supabase.from("donors").select(donorColumns).order("name", { ascending: true }),
      supabase.from("donations").select(donationColumns).order("date", { ascending: false }),
    ]);

  if (donorsError || donationsError) {
    console.log(donorsError ?? donationsError);
    throw new Error("Impossibile caricare i donatori.");
  }

  const databaseDonations = donationsData as DatabaseDonation[];
  const donationStats = new Map<
    number,
    {
      donationCount: number;
      bloodDonationCount: number;
      plasmaDonationCount: number;
      lastDonation: string | null;
    }
  >();

  for (const donation of databaseDonations) {
    if (donation.event_type === "pre-donation") continue;

    const stats = donationStats.get(donation.donor_id) ?? {
      donationCount: 0,
      bloodDonationCount: 0,
      plasmaDonationCount: 0,
      lastDonation: null,
    };

    stats.donationCount += 1;
    if (donation.donation_type === "blood") stats.bloodDonationCount += 1;
    if (donation.donation_type === "plasma") stats.plasmaDonationCount += 1;
    if (!stats.lastDonation && donation.date) {
      stats.lastDonation = formatDonationDate(donation.date.slice(0, 10));
    }

    donationStats.set(donation.donor_id, stats);
  }

  const donors = (donorsData as DatabaseDonor[]).map((databaseDonor) => {
    const donor = donorFromDatabase(databaseDonor);
    const stats = donationStats.get(databaseDonor.id);

    return {
      ...donor,
      donationCount: stats?.donationCount ?? 0,
      bloodDonationCount: stats?.bloodDonationCount ?? 0,
      plasmaDonationCount: stats?.plasmaDonationCount ?? 0,
      lastDonation: stats?.lastDonation ?? null,
    };
  });

  return <><div className="mb-4"><p className="text-sm font-medium text-primary">Anagrafiche</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Donatori</h1><p className="mt-2 text-muted-foreground">Consulta, inserisci e aggiorna i dati e i contatti dei donatori.</p></div><Card><CardContent className="pt-6 [&>div:last-child]:max-h-[32rem] [&>div:last-child]:overflow-y-auto"><DonorsTable donors={donors} donations={databaseDonations.map(donationFromDatabase)} /></CardContent></Card></>;
}
