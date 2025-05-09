export interface Entry {
  id: string;
  weight?: number;
  sleep?: string | null;
  alcohol: boolean;
  alcoholPrice?: string | number;
  activityCalories?: string | number;
  foodCalories?: number;
  earned?: number;
  date: string;  // ISO date string
  createdAt: string;
  updatedAt?: string;
  bmi?: number;
  imageUrl?: string | null;
}

export interface LastImage {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  weight: number;
  weightDate: string;
}

export interface EntryData {
  entries: Entry[];
  totalEarned: number;
  totalDaysWithoutAlcohol: number;
  lastImage?: LastImage;
}
