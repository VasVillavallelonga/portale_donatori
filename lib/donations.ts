import type { Donor } from "@/lib/donors";

export type Donation = { id: string; donorId: string; date: string; year: "2024" | "2025" | "2026"; type: "Sangue intero" | "Plasma" };

export const donations: Donation[] = [
  { id: "d1", donorId: "1", date: "18 lug 2026", year: "2026", type: "Sangue intero" }, { id: "d2", donorId: "2", date: "15 lug 2026", year: "2026", type: "Plasma" }, { id: "d3", donorId: "3", date: "11 lug 2026", year: "2026", type: "Sangue intero" }, { id: "d4", donorId: "4", date: "03 lug 2026", year: "2026", type: "Sangue intero" }, { id: "d5", donorId: "5", date: "29 giu 2026", year: "2026", type: "Sangue intero" }, { id: "d6", donorId: "6", date: "24 giu 2026", year: "2026", type: "Plasma" },
  { id: "d7", donorId: "1", date: "16 nov 2025", year: "2025", type: "Sangue intero" }, { id: "d8", donorId: "2", date: "02 ott 2025", year: "2025", type: "Plasma" }, { id: "d9", donorId: "5", date: "18 set 2025", year: "2025", type: "Sangue intero" }, { id: "d10", donorId: "4", date: "07 apr 2024", year: "2024", type: "Sangue intero" },
];

export function donorForDonation(donation: Donation, donorList: Donor[]) { return donorList.find((donor) => donor.id === donation.donorId); }
