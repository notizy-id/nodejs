import type { CursorOptions, CursorPage } from '../types/cursor-page';
import type { Response } from '../types/http';

export type MessageStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';

/** Who sent an outbound message. */
export type SentBy =
  | { type: 'api_key'; id: string }
  /** `id` is null for messages sent before it was recorded. */
  | { type: 'user'; id: string | null; name: string | null }
  | { type: 'broadcast'; id: string }
  | { type: 'ai' }
  /** Sent from the WhatsApp Business app. */
  | { type: 'business_app' };

export interface Message {
  id: string;
  channel: 'whatsapp';
  direction: 'outbound' | 'inbound';
  /** null for inbound messages. */
  status: MessageStatus | null;
  type: string;
  text?: string;
  media_url?: string;
  /** The WhatsApp account (business number). */
  account_id: string;
  /** Phone number, digits only: the business number for outbound, the contact for inbound. */
  from: string;
  /** Phone number, digits only. */
  to: string;
  /** Outbound only. */
  sent_by?: SentBy;
  conversation_id: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  error?: { code: string | null; message: string | null };
}

export type ListMessagesOptions = CursorOptions & {
  conversation_id?: string;
  status?: MessageStatus;
  direction?: 'inbound' | 'outbound';
  /** ISO 8601, inclusive. */
  since?: string;
  /** ISO 8601, exclusive. */
  until?: string;
};

export type ListMessagesResponse = Response<CursorPage<Message>>;
export type GetMessageResponse = Response<Message>;
