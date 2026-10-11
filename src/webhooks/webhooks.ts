import type { Broadcast } from '../broadcasts/types';
import type { Message } from '../messages/types';

type EventBase = {
  /** Delivery id; the same across retries of one delivery. */
  id: string;
  created_at: string;
};

/** Body of a Notizy webhook request, discriminated by `event`. */
export type NotizyWebhookEvent = EventBase &
  (
    | {
        event:
          | 'message.received'
          | 'message.sent'
          | 'message.delivered'
          | 'message.read'
          | 'message.failed';
        data: Message;
      }
    | { event: 'broadcast.completed'; data: Broadcast }
    | { event: 'webhook.test'; data: { message: string } }
  );

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

export interface VerifyWebhookOptions {
  /** The raw request body, exactly as received (not re-serialized JSON). */
  payload: string;
  /** The `X-Notizy-Signature` header. */
  signature: string | null | undefined;
  /** The endpoint's signing secret (`whsec_…`). */
  secret: string;
  /** Reject events signed longer ago than this (default 300; 0 = off). */
  toleranceSeconds?: number;
}

const hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');

// constant time: don't leak how many leading characters matched
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/**
 * Checks `X-Notizy-Signature` (`t=<unix>,v1=<HMAC-SHA256 of "<t>.<body>">`)
 * and returns the parsed event. Throws WebhookVerificationError otherwise.
 * Uses Web Crypto, so it runs on Node 20+, Bun, Deno and edge runtimes.
 */
export async function verifyWebhook(
  options: VerifyWebhookOptions,
): Promise<NotizyWebhookEvent> {
  const parts = Object.fromEntries(
    (options.signature ?? '').split(',').map((part) => {
      const i = part.indexOf('=');
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()];
    }),
  );
  const timestamp = Number(parts.t);
  if (!parts.t || !parts.v1 || !Number.isInteger(timestamp)) {
    throw new WebhookVerificationError('Missing or malformed signature header');
  }

  const tolerance = options.toleranceSeconds ?? 300;
  if (tolerance > 0 && Math.abs(Date.now() / 1000 - timestamp) > tolerance) {
    throw new WebhookVerificationError('Signature timestamp is too old');
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(options.secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = hex(
    await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${parts.t}.${options.payload}`),
    ),
  );
  if (!safeEqual(expected, parts.v1)) {
    throw new WebhookVerificationError('Signature does not match');
  }

  return JSON.parse(options.payload) as NotizyWebhookEvent;
}

export class Webhooks {
  /** See {@link verifyWebhook}. */
  verify(options: VerifyWebhookOptions): Promise<NotizyWebhookEvent> {
    return verifyWebhook(options);
  }
}
