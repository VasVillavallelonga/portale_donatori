import type { Donor } from "@/lib/donors";

export type Donation = {
  id: string;
  donorId: string;
  date: string;
  year: string;
  type?: string;
  classification?: "donation" | "first-donation" | "pre-donation";
};

export type DatabaseDonation = {
  id: number;
  created_at: string;
  donor_id: number;
  date: string | null;
  donation_type: string;
  event_type: string;
};

export const donationColumns =
  "id, created_at, donor_id, date, donation_type, event_type";

export function donationFromDatabase(donation: DatabaseDonation): Donation {
  const date = donation.date?.slice(0, 10) ?? "";
  const classification = ["donation", "first-donation", "pre-donation"].includes(
    donation.event_type,
  )
    ? (donation.event_type as Donation["classification"])
    : "donation";

  return {
    id: String(donation.id),
    donorId: String(donation.donor_id),
    date,
    year: date.slice(0, 4),
    type:
      donation.donation_type === "blood"
        ? "Sangue intero"
        : donation.donation_type === "plasma"
          ? "Plasma"
          : donation.donation_type || undefined,
    classification,
  };
}

export const donations: Donation[] = [
  {
    id: "d1",
    donorId: "1",
    date: "18 lug 2026",
    year: "2026",
    type: "Sangue intero",
  },
  { id: "d2", donorId: "2", date: "15 lug 2026", year: "2026", type: "Plasma" },
  {
    id: "d3",
    donorId: "3",
    date: "11 lug 2026",
    year: "2026",
    type: "Sangue intero",
  },
  {
    id: "d4",
    donorId: "4",
    date: "03 lug 2026",
    year: "2026",
    type: "Sangue intero",
  },
  {
    id: "d5",
    donorId: "5",
    date: "29 giu 2026",
    year: "2026",
    type: "Sangue intero",
  },
  { id: "d6", donorId: "6", date: "24 giu 2026", year: "2026", type: "Plasma" },
  {
    id: "d7",
    donorId: "1",
    date: "16 nov 2025",
    year: "2025",
    type: "Sangue intero",
  },
  { id: "d8", donorId: "2", date: "02 ott 2025", year: "2025", type: "Plasma" },
  {
    id: "d9",
    donorId: "5",
    date: "18 set 2025",
    year: "2025",
    type: "Sangue intero",
  },
  {
    id: "d10",
    donorId: "4",
    date: "07 apr 2024",
    year: "2024",
    type: "Sangue intero",
  },
];

export function donorForDonation(donation: Donation, donorList: Donor[]) {
  return donorList.find((donor) => donor.id === donation.donorId);
}
