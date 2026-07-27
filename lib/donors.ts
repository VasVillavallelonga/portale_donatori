export type Donor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate: string;
  registryCode: string;
  bloodType: "0+" | "0-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
  donationCount: number;
  lastDonation: string;
  active: boolean;
};

export const donors: Donor[] = [
  { id: "1", name: "Giulia Rossi", email: "giulia.rossi@email.it", phone: "+39 333 123 4567", birthDate: "12 apr 1989", registryCode: "6621972", bloodType: "0+", donationCount: 14, lastDonation: "18 lug 2026", active: true },
  { id: "2", name: "Marco Bianchi", email: "marco.bianchi@email.it", phone: "+39 347 555 0192", birthDate: "27 nov 1983", registryCode: "6621973", bloodType: "A+", donationCount: 9, lastDonation: "15 lug 2026", active: true },
  { id: "3", name: "Elena Conti", email: "elena.conti@email.it", birthDate: "05 set 1996", registryCode: "6621974", bloodType: "0-", donationCount: 1, lastDonation: "11 lug 2026", active: true },
  { id: "4", name: "Luca Romano", email: "luca.romano@email.it", phone: "+39 339 774 2801", birthDate: "18 gen 1978", registryCode: "6621975", bloodType: "B+", donationCount: 22, lastDonation: "03 lug 2026", active: false },
  { id: "5", name: "Sara Ferri", email: "sara.ferri@email.it", phone: "+39 320 234 9088", birthDate: "30 mag 1991", registryCode: "6621976", bloodType: "A-", donationCount: 11, lastDonation: "29 giu 2026", active: true },
  { id: "6", name: "Davide Moretti", phone: "+39 331 621 4112", birthDate: "22 feb 1999", registryCode: "6621977", bloodType: "AB+", donationCount: 2, lastDonation: "24 giu 2026", active: true },
];
