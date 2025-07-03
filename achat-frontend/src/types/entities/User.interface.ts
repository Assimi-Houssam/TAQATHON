import { EntityTypes } from "./enums/index.enum";
import {
  Chat,
  Company,
  Feedback,
  Notification,
  PurchaseRequest,
} from "./index";
import { Document } from "./Document.interface";
import { Departement } from "@/types/entities/index";

export interface User {
  id: number;
  company_id?: number;
  companyId?: number;
  full_name?: string;
  first_name: string;
  last_name: string;
  username: string;
  privilege_level?: string;
  departements?: Departement[];
  rc?: string;
  companyId_scopes?: number[];
  bio?: string;
  address?: string;
  email?: string;
  avatar?: Document;
  entity_type: EntityTypes;
  phone_number: string;
  language: string;
  title?: string;
  birth_date?: Date;
  postal_city?: string;
  keycloak_id?: string;
  postal_country?: string;
  purchase_requests?: PurchaseRequest[];
  chats?: Chat[];
  notifications?: Notification[];
  company?: Company;
  feedbacks_given?: Feedback[];
  is_active?: boolean;
  verification_token?: string;
  is_verified?: boolean;
  verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  email_verification_token?: string;
  created_at?: Date;
  updated_at?: Date;
  status: string;
  roles?: string[];
  two_factor_enabled?: boolean;
}
