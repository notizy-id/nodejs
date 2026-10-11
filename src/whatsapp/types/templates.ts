import type { Response } from '../../types/http';

export interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  header?: { format: string; text?: string; variables: number };
  /** `variables` = how many values `template.body` needs. */
  body?: { text: string; variables: number };
  footer?: string;
  buttons?: { type: string; text: string; url?: string; variables: number }[];
  /** Carousel: number of cards. */
  cards?: number;
  /**
   * Ids for broadcasts: text ones go in `variables`, media (header_media)
   * in `global_variables`.
   */
  broadcast_variables: { id: string; type: string }[];
}

export interface ListTemplatesOptions {
  account_id: string;
}

export type ListTemplatesResponse = Response<{ data: Template[] }>;

export interface WhatsappAccount {
  /** Use as `account_id`. */
  id: string;
  phone_number_id: string;
  display_phone_number: string;
  display_name: string | null;
  quality_rating: string | null;
  status: string | null;
  name_status: string | null;
  messaging_limit_tier: string | null;
}

export type ListAccountsResponse = Response<{ data: WhatsappAccount[] }>;
