import type { CursorOptions } from '../types/cursor-page';
import type { Response } from '../types/http';

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: string[];
  attributes: Record<string, string>;
  source: 'MANUAL' | 'IMPORT' | 'CHAT' | 'BROADCAST' | 'API';
  /** false once the contact opted out of broadcasts. */
  subscribed: boolean;
  opted_out_at: string | null;
  last_inbound_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  /**
   * Local (0812…) or international (62812…); normalized with your
   * organization's default country code.
   */
  phone: string;
  name?: string | null;
  email?: string | null;
  /** Replaces the contact's tags. */
  tags?: string[];
  /** Custom fields; replaces the contact's attributes. */
  attributes?: Record<string, string>;
}

export type ListContactsOptions = CursorOptions & {
  search?: string;
  /** Contacts with any of these tags. */
  tags?: string[];
  subscribed?: boolean;
};

export type ContactPage = {
  data: Contact[];
  next_cursor: string | null;
  /** Only on the first page. */
  total?: number;
};

export type ListContactsResponse = Response<ContactPage>;
export type ContactResponse = Response<Contact>;
export type RemoveContactResponse = Response<{ id: string; deleted: true }>;
