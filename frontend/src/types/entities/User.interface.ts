import { EntityTypes } from "./enums/index.enum";
import { Notification } from "./index";
import { Document } from "./Document.interface";

export interface User {
  id: number;
  full_name?: string;
  first_name: string;
  last_name: string;
  username: string;
  privilege_level?: string;
  rc?: string;
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
  notifications?: Notification[];
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
