export interface BusinessSpotlight {
  id: number;
  name: string;
  businessType: string;
  description: string;
  photoUrl?: string | null;
  photoCredit?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
