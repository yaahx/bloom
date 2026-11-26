export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: "Shoes" | "T-Shirts" | "Hoodies" | "Accessories" | string;
  image: string;
  images?: string[];
  description: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  isSoldOut?: boolean;
}
