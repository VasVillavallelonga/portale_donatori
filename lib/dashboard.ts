export type DashboardYear = "2024" | "2025" | "2026";

export const dashboardYears: DashboardYear[] = ["2026", "2025", "2024"];

export const dashboardByYear: Record<DashboardYear, { donations: number; activeDonors: number; newDonors: number; change: string; monthlyDonations: number[] }> = {
  "2026": { donations: 684, activeDonors: 342, newDonors: 48, change: "+8,4%", monthlyDonations: [74, 89, 82, 106, 98, 121] },
  "2025": { donations: 631, activeDonors: 316, newDonors: 39, change: "+5,2%", monthlyDonations: [69, 77, 81, 94, 90, 109] },
  "2024": { donations: 600, activeDonors: 291, newDonors: 32, change: "+3,1%", monthlyDonations: [62, 71, 75, 88, 86, 101] },
};
