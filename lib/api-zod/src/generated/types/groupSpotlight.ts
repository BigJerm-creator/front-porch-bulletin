export interface GroupSpotlight {
  id: number;
  name: string;
  groupType: string;
  description: string;
  photoUrl?: string | null;
  photoCredit?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
