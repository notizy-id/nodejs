import type { Response } from '../../types/http';
import type { IdempotentRequest } from '../../types/idempotent-request';
import type { PostOptions } from '../../types/post-options';
import type { TemplatePayload } from './send-template';

type Base = {
  /** WhatsApp number to send from (`notizy.whatsapp.accounts.list()`). */
  account_id: string;
  /** International format, digits only, e.g. `6281234567890`. */
  to: string;
};

type Media = {
  /** Shown in the inbox, and sent when there is no `media_id`. */
  url: string;
  /** From `notizy.media.upload()`: Meta doesn't download the file again. */
  media_id?: string;
};

/**
 * `template` can be sent any time. `text` and media messages only within
 * 24h of the contact's last message to that number (otherwise a 422).
 */
export type SendWhatsAppMessageOptions = Base &
  (
    | { type: 'template'; template: TemplatePayload }
    | { type: 'text'; text: { body: string } }
    | { type: 'image'; image: Media & { caption?: string } }
    | { type: 'video'; video: Media & { caption?: string } }
    | { type: 'audio'; audio: Media }
    | {
        type: 'document';
        document: Media & { caption?: string; filename?: string };
      }
  );

export interface SendWhatsAppMessageRequestOptions
  extends PostOptions,
    IdempotentRequest {}

/** Accepted and queued, not delivered yet: follow it with messages.get(). */
export interface QueuedMessage {
  id: string;
  status: 'PENDING';
  account_id: string;
  /** The business number, digits only. */
  from: string;
  to: string;
  created_at: string;
  conversation_id: string;
}

export type SendWhatsAppMessageResponse = Response<QueuedMessage>;
