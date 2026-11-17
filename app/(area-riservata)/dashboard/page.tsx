import { DashboardOverview } from "@/components/dashboard-overview";
import { donationColumns, donationFromDatabase, type DatabaseDonation } from "@/lib/donations";
import { donorColumns, donorFromDatabase, type DatabaseDonor } from "@/lib/donors";
import { createClient, readQuery } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [donorsData, donationsData] = await Promise.all([
    readQuery(
      () => supabase.from("donors").select(donorColumns),
      "Impossibile caricare la dashboard.",
    ),
    readQuery(
      () => supabase.from("donations").select(donationColumns),
      "Impossibile caricare la dashboard.",
    ),
  ]);

  const donors = ((donorsData ?? []) as DatabaseDonor[]).map((databaseDonor) => {
    const donor = donorFromDatabase(databaseDonor);

    return {
      id: donor.id,
      name: donor.name,
      gender: donor.gender,
      bloodType: donor.bloodType,
      active: donor.active,
    };
  });
  const donations = ((donationsData ?? []) as DatabaseDonation[]).map(donationFromDatabase);

  return <DashboardOverview donors={donors} donations={donations} />;
}
