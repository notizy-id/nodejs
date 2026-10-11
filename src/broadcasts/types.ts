import type { CursorOptions, CursorPage } from '../types/cursor-page';
import type { Response } from '../types/http';

export type BroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface BroadcastStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  skipped: number;
}

export interface Broadcast {
  id: string;
  title: string | null;
  status: BroadcastStatus;
  status_reason: string | null;
  account_id: string;
  template: { name: string; language: string; category: string } | null;
  total_recipients: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  stats?: BroadcastStats;
}

/** Where a text variable's value comes from. */
export type VariableSource =
  | {
      source: 'contact';
      field: 'name' | 'phone' | 'email' | `attr:${string}`;
      /** Used when the contact has no value. */
      fallback?: string;
    }
  | { source: 'static'; value: string };

/** Contact filter; `{}` = every subscribed contact. */
export interface AudienceFilter {
  search?: string;
  tags_any?: string[];
  tags_all?: string[];
  tags_exclude?: string[];
  contact_ids?: string[];
  active_within_days?: number;
  inactive_for_days?: number;
  received_broadcast_id?: string;
  not_received_broadcast_id?: string;
  sources?: ('MANUAL' | 'IMPORT' | 'CHAT' | 'BROADCAST' | 'API')[];
  fields?: {
    key: string;
    op: 'is' | 'is_not' | 'contains' | 'set' | 'not_set';
    value?: string;
  }[];
}

export interface CreateBroadcastOptions {
  account_id: string;
  title?: string;
  template: { name: string; language: string };
  /** Opted-out contacts are always skipped. */
  audience?: AudienceFilter;
  /**
   * Text variable id (`broadcast_variables` of
   * `notizy.whatsapp.templates.list()`, e.g. `body_1`) → its source.
   */
  variables?: Record<string, VariableSource>;
  /** Media header: `{ header_media: url, header_media_filename? }`. */
  global_variables?: Record<string, string>;
  /** ISO 8601; omit to send now. */
  scheduled_at?: string;
}

export type CreatedBroadcast = Broadcast & {
  skipped: { opted_out: number; missing_variable: number };
  /** Contacts left out (first 100). */
  errors: { cell: string; message: string }[];
};

export type ListBroadcastsOptions = CursorOptions & {
  status?: BroadcastStatus;
};

export type CreateBroadcastResponse = Response<CreatedBroadcast>;
export type ListBroadcastsResponse = Response<CursorPage<Broadcast>>;
export type BroadcastResponse = Response<Broadcast>;
