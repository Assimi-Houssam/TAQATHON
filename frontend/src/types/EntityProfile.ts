import { LucideIcon } from "lucide-react";

interface FeedbackData {
  id: number;
  image: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
}

interface BidData {
  id: number;
  name: string;
  date: string;
  price: number;
  status: string;
}

interface companyStatics {
  id: number;
  title: string;
  value: number | string;
  description: string;
  color: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface companyMembers {
  id: string;
  fullname: string;
  image: string;
  email: string;
  role: string;
  description: string;
  mobile: string;
  isOnline?: boolean;
}

interface Profile {
  id: number;
  name: string;
  age: number;
  role: string;
  title: string;
  description: string;
  phone: string;
  email: string;
  startDate: string;
  image: string;
  company: string;
}

interface PurchaseRequest {
  reference: string;
  title: string;
  date: string;
  details: string;
}

interface EntityProfile {
  id: number;
  profile: Profile;
  type: "company" | "agent" | "supplier";
  companyMembers: companyMembers[];
  companyStatics: companyStatics[];
  bidsHistory: BidData[];
  feedbacks: FeedbackData[];
  purchaseRequests?: PurchaseRequest[];
}

export type {
  BidData,
  companyMembers,
  companyStatics,
  EntityProfile,
  FeedbackData,
  Profile,
  PurchaseRequest,
};
