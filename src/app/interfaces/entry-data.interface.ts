export interface Entry {
  id?: string;
  weight?: number;
  sleep?: number;
  alcohol?: number;
  alcoholPrice?: number;
  activityCalories?: number;
  date?: Date;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface EntryData {
  entries: Entry[];
  totalEarned: number;
}
