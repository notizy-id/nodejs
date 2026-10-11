# Notizy Node.js SDK

Node.js library for the Notizy API: WhatsApp messages and broadcasts,
contacts, media and webhooks. Full API reference:
https://api.notizy.id/docs

## Installation

```bash
npm install notizy
# or
pnpm add notizy
# or
yarn add notizy
```

## Setup

```ts
import { Notizy } from 'notizy';

const notizy = new Notizy(process.env.NOTIZY_API_KEY!);
```

Every method returns `{ data, error, headers }` and never throws for API
errors:

```ts
const { data, error } = await notizy.messages.get('msg_id');
if (error) {
  // error.name: 'validation_error' | 'invalid_api_key' | 'plan_limit_exceeded'
  //   | 'not_found' | 'conflict' | 'rate_limit_exceeded' | 'application_error'
  console.error(error.statusCode, error.message, error.errors);
}
```

## Send messages

```ts
const { data: accounts } = await notizy.whatsapp.accounts.list();
const accountId = accounts!.data[0].id;

// template: any time
const { data } = await notizy.whatsapp.sendTemplate(
  {
    account_id: accountId,
    to: '6281234567890',
    template: { name: 'order_confirmation', language: 'id', body: ['John', '#1234'] },
  },
  { idempotencyKey: 'order-1234-confirmation' }, // safe to retry
);
console.log(data?.id, data?.status); // queued: "PENDING"

// text / media: within 24h of the contact's last message
await notizy.whatsapp.send({
  account_id: accountId,
  to: '6281234567890',
  type: 'text',
  text: { body: 'Your order has shipped' },
});

const { data: media } = await notizy.media.upload({ account_id: accountId, file });
await notizy.whatsapp.send({
  account_id: accountId,
  to: '6281234567890',
  type: 'document',
  document: { url: media!.url, media_id: media!.media_id, filename: 'invoice.pdf' },
});
```

Approved templates and the variables they need:
`notizy.whatsapp.templates.list({ account_id })`.

## Messages

```ts
const page = await notizy.messages.list({ direction: 'inbound', limit: 50 });
const next = await notizy.messages.list({ cursor: page.data?.next_cursor ?? undefined });
const message = await notizy.messages.get('msg_id'); // status, delivered_at, read_at…
```

## Contacts

```ts
await notizy.contacts.upsert({ phone: '081234567890', name: 'John', tags: ['customer'] });
await notizy.contacts.list({ tags: ['customer'], subscribed: true });
await notizy.contacts.update(id, { attributes: { plan: 'gold' } });
await notizy.contacts.updateTags(id, { add: ['vip'], remove: ['trial'] });
await notizy.contacts.optOut(id); // optOut(id, false) to resubscribe
await notizy.contacts.remove(id);
```

## Broadcasts

```ts
const { data } = await notizy.broadcasts.create({
  account_id: accountId,
  template: { name: 'promo_october', language: 'id' },
  audience: { tags_any: ['customer'] },
  variables: {
    body_1: { source: 'contact', field: 'name', fallback: 'there' },
    body_2: { source: 'static', value: '20%' },
  },
  scheduled_at: '2026-10-12T09:00:00+07:00', // omit to send now
});

await notizy.broadcasts.get(data!.id); // live stats
await notizy.broadcasts.cancel(data!.id);
```

## Webhooks

Verify the `X-Notizy-Signature` header with the endpoint's signing secret,
using the raw request body:

```ts
import { verifyWebhook } from 'notizy';

app.post('/webhooks/notizy', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = await verifyWebhook({
      payload: req.body.toString(),
      signature: req.header('X-Notizy-Signature'),
      secret: process.env.NOTIZY_WEBHOOK_SECRET!,
    });
    if (event.event === 'message.received') console.log(event.data.text);
    res.sendStatus(200);
  } catch {
    res.sendStatus(400);
  }
});
```

Delivery is at-least-once: deduplicate on `event.data.id`.
