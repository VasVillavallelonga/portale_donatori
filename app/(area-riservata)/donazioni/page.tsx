import { Card, CardContent } from "@/components/ui/card";
import { DonationsTable } from "@/components/donations-table";
import { donorColumns, donorFromDatabase, type DatabaseDonor } from "@/lib/donors";
import { donationColumns, donationFromDatabase, type DatabaseDonation } from "@/lib/donations";
import { createClient } from "@/lib/supabase/server";

export default async function DonationsPage() {
  const supabase = await createClient();
  const [{ data: donationsData, error: donationsError }, { data: donorsData, error: donorsError }] = await Promise.all([
    supabase.from("donations").select(donationColumns).order("date", { ascending: false }),
    supabase.from("donors").select(donorColumns).order("name", { ascending: true }),
  ]);

  if (donationsError || donorsError) {
    console.log(donationsError ?? donorsError);
    throw new Error("Impossibile caricare le donazioni.");
  }

  const donations = (donationsData as DatabaseDonation[]).map(donationFromDatabase);
  const donors = (donorsData as DatabaseDonor[]).map(donorFromDatabase);

  return <><div className="mb-4"><p className="text-sm font-medium text-primary">Registro</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Donazioni</h1><p className="mt-2 text-muted-foreground">Tutte le donazioni di sangue registrate, filtrabili per anno.</p></div><Card><CardContent className="pt-6"><DonationsTable donations={donations} donors={donors} /></CardContent></Card></>;
}
