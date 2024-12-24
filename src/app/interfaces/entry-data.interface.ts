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
}

export interface EntryData {
  entries: Entry[];
  totalEarned: number;
  totalDaysWithoutAlcohol: number;
}
