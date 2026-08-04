import { DashboardOverview } from "@/components/dashboard-overview";
import { donationColumns, donationFromDatabase, type DatabaseDonation } from "@/lib/donations";
import { donorColumns, donorFromDatabase, type DatabaseDonor } from "@/lib/donors";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: donorsData, error: donorsError }, { data: donationsData, error: donationsError }] =
    await Promise.all([
      supabase.from("donors").select(donorColumns),
      supabase.from("donations").select(donationColumns),
    ]);

  if (donorsError || donationsError) {
    console.log(donorsError ?? donationsError);
    throw new Error("Impossibile caricare la dashboard.");
  }

  const donors = (donorsData as DatabaseDonor[]).map((databaseDonor) => {
    const donor = donorFromDatabase(databaseDonor);

    return {
      id: donor.id,
      name: donor.name,
      bloodType: donor.bloodType,
      active: donor.active,
      createdAt: databaseDonor.created_at,
    };
  });
  const donations = (donationsData as DatabaseDonation[]).map(donationFromDatabase);

  return <DashboardOverview donors={donors} donations={donations} />;
}
