import type { CursorOptions, CursorPage } from '../types/cursor-page';
import type { Response } from '../types/http';

export type MessageStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';

export interface Message {
  id: string;
  channel: 'whatsapp';
  direction: 'outbound' | 'inbound';
  /** null for inbound messages. */
  status: MessageStatus | null;
  type: string;
  text?: string;
  media_url?: string;
  from: string;
  to: string;
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
