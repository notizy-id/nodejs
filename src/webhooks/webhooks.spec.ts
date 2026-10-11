import { createHmac } from 'node:crypto';
import { verifyWebhook, WebhookVerificationError } from './webhooks';

const secret = 'whsec_test';
const payload = JSON.stringify({
  id: 'd1',
  event: 'message.delivered',
  created_at: '2026-10-11T00:00:00.000Z',
  data: { id: 'm1', status: 'DELIVERED' },
});
// same scheme as the server: HMAC-SHA256 of "<t>.<body>"
const sign = (t: number, body = payload, key = secret) =>
  `t=${t},v1=${createHmac('sha256', key).update(`${t}.${body}`).digest('hex')}`;
const now = () => Math.floor(Date.now() / 1000);

describe('verifyWebhook', () => {
  it('returns the event for a valid signature', async () => {
    const event = await verifyWebhook({
      payload,
      signature: sign(now()),
      secret,
    });
    expect(event.event).toBe('message.delivered');
    expect(event.id).toBe('d1');
  });

  it.each([
    ['a tampered body', () => sign(now()), `${payload} `],
    ['the wrong secret', () => sign(now(), payload, 'whsec_other'), payload],
    ['a timestamp older than 5 minutes', () => sign(now() - 301), payload],
    ['a missing header', () => undefined, payload],
    ['a malformed header', () => 'v1=abc', payload],
  ])('rejects %s', async (_, signature, body) => {
    await expect(
      verifyWebhook({ payload: body, signature: signature(), secret }),
    ).rejects.toBeInstanceOf(WebhookVerificationError);
  });

  it('toleranceSeconds: 0 accepts old signatures', async () => {
    await expect(
      verifyWebhook({
        payload,
        signature: sign(now() - 3600),
        secret,
        toleranceSeconds: 0,
      }),
    ).resolves.toMatchObject({ id: 'd1' });
  });
});
