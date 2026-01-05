export interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  rating: number | null;
  image: string | null;
}

export const SERVICES_DATA: Service[] = [
  { id: 1, name: "Signature Haircut", price: 65, duration: "60 min", category: "Hair" },
  { id: 2, name: "Beard Sculpting", price: 35, duration: "30 min", category: "Face" },
  { id: 3, name: "Deep Tissue Massage", price: 90, duration: "60 min", category: "Body" },
  { id: 4, name: "Rejuvenating Facial", price: 85, duration: "45 min", category: "Face" },
];

export const STAFF_DATA: Staff[] = [
  { id: 1, name: "Sarah Jenkins", role: "Senior Stylist", rating: 4.9, image: "https://i.pravatar.cc/150?u=sarah" },
  { id: 2, name: "Michael Ross", role: "Barber Specialist", rating: 4.8, image: "https://i.pravatar.cc/150?u=mike" },
  { id: 3, name: "Emma Watson", role: "Therapist", rating: 5.0, image: "https://i.pravatar.cc/150?u=emma" },
  { id: 0, name: "Any Professional", role: "First Available", rating: null, image: null },
];

export const TIME_SLOTS: string[] = [
  "09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"
];